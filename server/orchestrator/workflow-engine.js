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
   * Safely set object property, preventing prototype pollution
   * SECURITY: Rejects dangerous property names that could modify prototypes
   * @param {object} obj - The object to set property on
   * @param {string} key - The property name
   * @param {*} value - The value to set
   */
  safeSetProperty(obj, key, value) {
    // Reject dangerous property names
    const dangerousProps = ['__proto__', 'constructor', 'prototype'];
    if (dangerousProps.includes(key)) {
      throw new Error(`Forbidden property name: ${key}`);
    }

    // Validate key is a string and not empty
    if (typeof key !== 'string' || key.length === 0) {
      throw new Error('Property key must be a non-empty string');
    }

    // Validate key format (alphanumeric, dash, underscore only)
    if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(key)) {
      throw new Error(`Invalid property name: ${key}`);
    }

    // Use Object.defineProperty for safer assignment
    Object.defineProperty(obj, key, {
      value: value,
      writable: true,
      enumerable: true,
      configurable: true
    });
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

        // SECURITY: Sanitize step name to prevent log injection
        console.log(`📍 Step ${i + 1}/${workflow.steps.length}: ${sanitizeForLog(step.agent || step.action)}`);

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
        // SECURITY: Use safeSetProperty to prevent prototype pollution
        if (step.output_to && typeof step.output_to === 'string') {
          this.safeSetProperty(state.context, step.output_to, stepResult);
        }

        // Save state after each step
        await this.stateStore.setWorkflowState(workflowId, state);

        // Check if step failed
        if (stepResult.status === 'failed') {
          if (step.continue_on_error) {
            // SECURITY: Sanitize error message to prevent log injection
            console.warn(`⚠️  Step ${i} failed but continuing: ${sanitizeForLog(stepResult.error)}`);
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
   * SECURITY: Validates action whitelist and protects against injection attacks
   */
  async executeActionStep(step, workflowState) {
    // SECURITY: Whitelist of allowed actions
    const ALLOWED_ACTIONS = ['set-context', 'wait', 'log', 'store-state'];

    // SECURITY: Validate action before execution
    if (!step.action || typeof step.action !== 'string') {
      throw new Error('Invalid action: must be a string');
    }

    // SECURITY: Strict whitelist check
    if (!ALLOWED_ACTIONS.includes(step.action)) {
      throw new Error(`Unauthorized action: ${step.action}. Allowed: ${ALLOWED_ACTIONS.join(', ')}`);
    }

    const actions = {
      'set-context': async (input) => {
        // SECURITY: Validate input is an object
        if (typeof input !== 'object' || input === null) {
          throw new Error('set-context requires object input');
        }
        for (const [key, value] of Object.entries(input)) {
          // SECURITY: Only process own properties to prevent prototype pollution
          if (!Object.prototype.hasOwnProperty.call(input, key)) continue;

          // SECURITY: Use safeSetProperty to prevent prototype pollution
          this.safeSetProperty(
            workflowState.context,
            key,
            this.resolveVariables(value, workflowState.context)
          );
        }
        return { context_updated: true };
      },
      'wait': async (input) => {
        // SECURITY: Limit max wait time to prevent resource exhaustion
        const MAX_WAIT = 60000; // 60 seconds
        const MIN_WAIT = 0;
        const requestedMs = parseInt(input.duration) || 1000;
        const ms = Math.min(Math.max(MIN_WAIT, requestedMs), MAX_WAIT);

        if (requestedMs > MAX_WAIT) {
          console.warn(`⚠️  Wait duration capped at ${MAX_WAIT}ms (requested: ${requestedMs}ms)`);
        }

        await new Promise(resolve => setTimeout(resolve, ms));
        return { waited: ms };
      },
      'log': async (input) => {
        const message = this.resolveVariables(input.message || '', workflowState.context);
        const sanitized = sanitizeForLog(message);
        console.log(`📝 Workflow log: ${sanitized}`);
        return { logged: true, message: sanitized };
      },
      'store-state': async (input) => {
        // SECURITY: Validate key and namespace
        if (!input.key || typeof input.key !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(input.key)) {
          throw new Error('Invalid state key: must be alphanumeric with dash/underscore');
        }
        if (input.key.length > 100) {
          throw new Error('State key too long (max 100 characters)');
        }

        await this.stateStore.set(input.key, input.value, {
          namespace: input.namespace || 'workflow-data'
        });
        return { stored: true, key: input.key };
      }
    };

    const actionFn = actions[step.action];
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
   * SECURITY: Uses bounded quantifiers to prevent ReDoS attacks
   */
  resolveVariables(input, context) {
    if (typeof input === 'string') {
      // SECURITY: Non-backtracking pattern with strict length limit (max 100 chars)
      // Only allows alphanumeric and underscore in variable names
      return input.replace(/\$\{([a-zA-Z0-9_]{1,100})\}/g, (match, varName) => {
        return context.hasOwnProperty(varName) ? context[varName] : match;
      });
    } else if (Array.isArray(input)) {
      return input.map(item => this.resolveVariables(item, context));
    } else if (typeof input === 'object' && input !== null) {
      const resolved = {};
      for (const [key, value] of Object.entries(input)) {
        // SECURITY: Only process own properties to prevent prototype pollution
        if (!Object.prototype.hasOwnProperty.call(input, key)) continue;
        if (['__proto__', 'constructor', 'prototype'].includes(key)) {
          throw new Error(`Forbidden property: ${key}`);
        }
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
   * Validate workflow structure before saving
   * SECURITY: Comprehensive validation to prevent malicious data and DoS attacks
   */
  validateWorkflow(workflow) {
    // Type checks
    if (!workflow || typeof workflow !== 'object') {
      throw new Error('Invalid workflow: must be an object');
    }

    if (!workflow.id || typeof workflow.id !== 'string') {
      throw new Error('Invalid workflow: id is required');
    }

    // Length validation to prevent DoS
    if (workflow.id.length > 100) {
      throw new Error('Workflow id too long (max 100 characters)');
    }

    // Validate id format (alphanumeric, dash, underscore only)
    if (!/^[a-zA-Z0-9_-]+$/.test(workflow.id)) {
      throw new Error('Invalid workflow id format: only alphanumeric, dash, and underscore allowed');
    }

    // Validate steps array
    if (workflow.steps && !Array.isArray(workflow.steps)) {
      throw new Error('Invalid workflow: steps must be an array');
    }

    if (workflow.steps && workflow.steps.length > 100) {
      throw new Error('Too many workflow steps (max 100)');
    }

    // Validate each step
    if (workflow.steps) {
      for (const step of workflow.steps) {
        if (!step || typeof step !== 'object') {
          throw new Error('Invalid step: must be an object');
        }

        // Each step must have exactly one of: agent, action, or workflow
        const hasAgent = !!step.agent;
        const hasAction = !!step.action;
        const hasWorkflow = !!step.workflow;
        const count = [hasAgent, hasAction, hasWorkflow].filter(Boolean).length;

        if (count !== 1) {
          throw new Error('Each step must have exactly one of: agent, action, or workflow');
        }

        // Validate step name if provided
        if (step.name && typeof step.name !== 'string') {
          throw new Error('Step name must be a string');
        }
        if (step.name && step.name.length > 100) {
          throw new Error('Step name too long (max 100 characters)');
        }

        // Validate output_to if provided
        if (step.output_to) {
          if (typeof step.output_to !== 'string') {
            throw new Error('Step output_to must be a string');
          }
          if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(step.output_to)) {
            throw new Error('Invalid output_to format');
          }
        }
      }
    }

    // Size limit: Prevent large workflows from exhausting disk space
    const workflowJson = JSON.stringify(workflow);
    const MAX_SIZE = 1024 * 1024; // 1MB
    if (workflowJson.length > MAX_SIZE) {
      throw new Error(`Workflow too large (max ${MAX_SIZE} bytes)`);
    }

    return true;
  }

  /**
   * Save workflow to file
   * SECURITY: Path is sanitized via getSafePath() to prevent path traversal
   * SECURITY: Workflow data is validated before writing to prevent malicious content
   */
  async saveWorkflow(workflow) {
    // SECURITY: Comprehensive validation before writing to disk
    this.validateWorkflow(workflow);

    const workflowPath = this.getSafePath(workflow.id);

    // Write atomically to prevent partial writes
    const tempPath = `${workflowPath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(workflow, null, 2), { mode: 0o600 });
    await fs.rename(tempPath, workflowPath);

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
