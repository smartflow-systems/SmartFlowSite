const fs = require('fs').promises;
const path = require('path');
const { sanitizeForLog } = require('../utils/log-sanitizer.js');

/**
 * Workflow Engine - Executes multi-agent workflows with dependencies
 */
class WorkflowEngine {
  constructor(registry, stateStore, connectorManager) {
    this.registry = registry;
    this.stateStore = stateStore;
    this.connectorManager = connectorManager;
    this.workflowDir = path.join(process.cwd(), '.sfs', 'workflows');
    this.activeWorkflows = new Map();
  }

  /**
   * Sanitize filename to prevent path traversal attacks
   * @param {string} filename - The filename to sanitize
   * @returns {string} - Safe filename
   */
  sanitizeFilename(filename) {
    // Remove any path separators and dangerous characters
    const safe = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
    // Ensure it doesn't start with dots
    return safe.replace(/^\.+/, '_');
  }

  /**
   * Validate and create safe path within workflow directory
   * @param {string} filename - The filename
   * @returns {string} - Safe absolute path
   */
  getSafePath(filename) {
    const sanitized = this.sanitizeFilename(filename);
    const safePath = path.join(this.workflowDir, `${sanitized}.json`);

    // Verify the resolved path is within workflowDir
    const resolvedPath = path.resolve(safePath);
    const resolvedBase = path.resolve(this.workflowDir);

    if (!resolvedPath.startsWith(resolvedBase)) {
      throw new Error('Invalid file path: path traversal detected');
    }

    return safePath;
  }

  /**
   * Initialize workflow engine
   */
  async initialize() {
    await fs.mkdir(this.workflowDir, { recursive: true });
    console.log('✅ Workflow engine initialized');
  }

  /**
   * Execute a workflow
   */
  async execute(workflow, context = {}) {
    const workflowId = workflow.id || `workflow-${Date.now()}`;
    console.log(`🚀 Starting workflow: ${workflowId}`);

    // Initialize workflow state
    const state = {
      id: workflowId,
      status: 'running',
      started_at: new Date().toISOString(),
      steps: workflow.steps || [],
      current_step: 0,
      completed_steps: [],
      failed_steps: [],
      context: { ...context },
      outputs: {}
    };

    this.activeWorkflows.set(workflowId, state);
    await this.stateStore.setWorkflowState(workflowId, state);

    try {
      // Execute steps sequentially with dependency resolution
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        state.current_step = i;

        console.log(`📍 Step ${i + 1}/${workflow.steps.length}: ${step.agent || step.action}`);

        // Check dependencies
        if (!await this.checkDependencies(step, state)) {
          throw new Error(`Step ${i} dependencies not met: ${step.depends_on?.join(', ')}`);
        }

        // Execute step
        const stepResult = await this.executeStep(step, state);

        // Store step result
        state.outputs[step.name || `step_${i}`] = stepResult;
        state.completed_steps.push({
          step: i,
          name: step.name || step.action,
          completed_at: new Date().toISOString(),
          result: stepResult
        });

        // Update workflow context with step outputs
        if (step.output_to) {
          state.context[step.output_to] = stepResult;
        }

        // Save state after each step
        await this.stateStore.setWorkflowState(workflowId, state);

        // Check if step failed
        if (stepResult.status === 'failed') {
          if (step.continue_on_error) {
            console.warn(`⚠️  Step ${i} failed but continuing: ${stepResult.error}`);
          } else {
            throw new Error(`Step ${i} failed: ${stepResult.error}`);
          }
        }
      }

      // Workflow completed successfully
      state.status = 'completed';
      state.completed_at = new Date().toISOString();

      console.log(`✅ Workflow completed: ${workflowId}`);

      return state;
    } catch (error) {
      // Workflow failed
      state.status = 'failed';
      state.error = error.message;
      state.failed_at = new Date().toISOString();

      console.error(`❌ Workflow failed: ${sanitizeForLog(workflowId)} - ${sanitizeForLog(error.message)}`);

      return state;
    } finally {
      // Clean up
      await this.stateStore.setWorkflowState(workflowId, state);
      this.activeWorkflows.delete(workflowId);
    }
  }

  /**
   * Execute a single workflow step
   */
  async executeStep(step, workflowState) {
    try {
      // Resolve step type
      if (step.agent) {
        return await this.executeAgentStep(step, workflowState);
      } else if (step.action) {
        return await this.executeActionStep(step, workflowState);
      } else if (step.workflow) {
        return await this.executeSubWorkflow(step, workflowState);
      } else {
        throw new Error('Invalid step: must have agent, action, or workflow');
      }
    } catch (error) {
      return {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Execute an agent step
   */
  async executeAgentStep(step, workflowState) {
    const agent = this.registry.get(step.agent);

    if (!agent) {
      throw new Error(`Agent not found: ${step.agent}`);
    }

    // Get connector for agent platform
    const connector = this.connectorManager.get(agent.platform);

    if (!connector) {
      throw new Error(`No connector for platform: ${agent.platform}`);
    }

    // Prepare input by resolving variables from context
    const input = this.resolveVariables(step.input || {}, workflowState.context);

    // Invoke agent via connector
    const result = await connector.invoke(step.agent, {
      action: step.action,
      input,
      context: workflowState.context
    });

    // Record invocation
    this.registry.recordInvocation(step.agent);

    return {
      status: 'success',
      agent: step.agent,
      result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Execute an action step (built-in actions)
   */
  async executeActionStep(step, workflowState) {
    const actions = {
      'set-context': async (input) => {
        for (const [key, value] of Object.entries(input)) {
          workflowState.context[key] = this.resolveVariables(value, workflowState.context);
        }
        return { context_updated: true };
      },
      'wait': async (input) => {
        const ms = input.duration || 1000;
        await new Promise(resolve => setTimeout(resolve, ms));
        return { waited: ms };
      },
      'log': async (input) => {
        const message = this.resolveVariables(input.message || '', workflowState.context);
        console.log(`📝 Workflow log: ${sanitizeForLog(message)}`);
        return { logged: true, message };
      },
      'store-state': async (input) => {
        await this.stateStore.set(input.key, input.value, {
          namespace: input.namespace || 'workflow-data'
        });
        return { stored: true, key: input.key };
      }
    };

    const actionFn = actions[step.action];

    if (!actionFn) {
      throw new Error(`Unknown action: ${step.action}`);
    }

    const result = await actionFn(step.input || {});

    return {
      status: 'success',
      action: step.action,
      result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Execute a sub-workflow
   */
  async executeSubWorkflow(step, workflowState) {
    const subWorkflow = await this.loadWorkflow(step.workflow);

    // Merge parent context with sub-workflow input
    const context = {
      ...workflowState.context,
      ...this.resolveVariables(step.input || {}, workflowState.context)
    };

    const result = await this.execute(subWorkflow, context);

    return {
      status: result.status === 'completed' ? 'success' : 'failed',
      workflow: step.workflow,
      result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if step dependencies are met
   */
  async checkDependencies(step, workflowState) {
    if (!step.depends_on || step.depends_on.length === 0) {
      return true;
    }

    for (const dep of step.depends_on) {
      const completed = workflowState.completed_steps.some(s => s.name === dep);
      if (!completed) {
        return false;
      }
    }

    return true;
  }

  /**
   * Resolve variables in input (e.g., ${VAR_NAME})
   */
  resolveVariables(input, context) {
    if (typeof input === 'string') {
      return input.replace(/\${([^}]+)}/g, (match, varName) => {
        return context[varName] || match;
      });
    } else if (Array.isArray(input)) {
      return input.map(item => this.resolveVariables(item, context));
    } else if (typeof input === 'object' && input !== null) {
      const resolved = {};
      for (const [key, value] of Object.entries(input)) {
        resolved[key] = this.resolveVariables(value, context);
      }
      return resolved;
    }

    return input;
  }

  /**
   * Load workflow from file
   */
  async loadWorkflow(workflowName) {
    const workflowPath = this.getSafePath(workflowName);
    const content = await fs.readFile(workflowPath, 'utf8');
    return JSON.parse(content);
  }

  /**
   * Save workflow to file
   */
  async saveWorkflow(workflow) {
    const workflowPath = this.getSafePath(workflow.id);
    await fs.writeFile(workflowPath, JSON.stringify(workflow, null, 2));
    console.log(`💾 Saved workflow: ${sanitizeForLog(workflow.id)}`);
  }

  /**
   * List all workflows
   */
  async listWorkflows() {
    const files = await fs.readdir(this.workflowDir);
    const workflows = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        // Validate file is within workflow directory
        const safePath = path.join(this.workflowDir, path.basename(file));
        const resolvedPath = path.resolve(safePath);
        const resolvedBase = path.resolve(this.workflowDir);

        if (resolvedPath.startsWith(resolvedBase)) {
          const content = await fs.readFile(safePath, 'utf8');
          workflows.push(JSON.parse(content));
        }
      }
    }

    return workflows;
  }

  /**
   * Get active workflows
   */
  getActive() {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Get workflow stats
   */
  getStats() {
    return {
      active: this.activeWorkflows.size,
      active_workflows: Array.from(this.activeWorkflows.keys())
    };
  }
}

module.exports = WorkflowEngine;
