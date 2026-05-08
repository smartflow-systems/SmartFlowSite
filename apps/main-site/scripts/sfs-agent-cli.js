#!/usr/bin/env node

const fs = require('fs').promises;

/**
 * HTTP Client for SFS Orchestrator API
 */
class OrchestratorClient {
  constructor(baseUrl = process.env.ORCHESTRATOR_URL || 'http://localhost:5001') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic GET request handler
   */
  async get(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    return await response.json();
  }

  /**
   * Generic POST request handler
   */
  async post(endpoint, body) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await response.json();
  }

  // Agent endpoints
  async listAgents() {
    return await this.get('/api/agents');
  }

  async getAgent(agentId) {
    return await this.get(`/api/agents/${agentId}`);
  }

  async registerAgent(manifest) {
    return await this.post('/api/agents/register', manifest);
  }

  async invokeAgent(agentId, task = {}) {
    return await this.post(`/api/agents/${agentId}/invoke`, task);
  }

  // Workflow endpoints
  async listWorkflows() {
    return await this.get('/api/workflows');
  }

  async executeWorkflow(workflow) {
    return await this.post('/api/workflows/execute', workflow);
  }

  // Package endpoints
  async listPackages() {
    return await this.get('/api/packages');
  }

  async getPackage(packageId) {
    return await this.get(`/api/packages/${packageId}`);
  }

  async executePackage(packageId, context) {
    return await this.post(`/api/packages/${packageId}/execute`, { context });
  }

  // Health check
  async getHealth() {
    return await this.get('/health');
  }
}

/**
 * Utility functions for file operations and formatting
 */
class CLIUtils {
  /**
   * Read and parse JSON file
   */
  static async readJsonFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  }

  /**
   * Print formatted header
   */
  static printHeader(title, count = null) {
    const countText = count !== null ? ` (${count})` : '';
    console.log(`\n📋 ${title}${countText}\n`);
    console.log('─'.repeat(60));
  }

  /**
   * Print formatted separator
   */
  static printSeparator() {
    console.log('\n' + '─'.repeat(60) + '\n');
  }

  /**
   * Print success message
   */
  static printSuccess(message) {
    console.log(`✅ ${message}`);
  }

  /**
   * Print error message
   */
  static printError(message) {
    console.error(`❌ ${message}`);
  }

  /**
   * Validate required argument
   */
  static validateRequiredArg(arg, argName, usage) {
    if (!arg) {
      this.printError(`Missing required argument: ${argName}`);
      console.log(`Usage: ${usage}`);
      process.exit(1);
    }
  }
}

/**
 * Command handlers for agent operations
 */
class AgentCommands {
  constructor(client) {
    this.client = client;
  }

  async list() {
    const data = await this.client.listAgents();

    CLIUtils.printHeader('Registered Agents', data.count);

    for (const agent of data.agents) {
      console.log(`\n🤖 ${agent.agent_id}`);
      console.log(`   Platform: ${agent.platform}`);
      console.log(`   Capabilities: ${agent.capabilities.join(', ')}`);
      console.log(`   Status: ${agent.status}`);

      if (agent.invocation_count > 0) {
        console.log(`   Invocations: ${agent.invocation_count}`);
        console.log(`   Last invoked: ${agent.last_invoked}`);
      }
    }

    CLIUtils.printSeparator();
  }

  async register(manifestPath) {
    CLIUtils.validateRequiredArg(
      manifestPath,
      'manifest path',
      'sfs-agent-cli agent register <manifest.json>'
    );

    const manifest = await CLIUtils.readJsonFile(manifestPath);
    const data = await this.client.registerAgent(manifest);

    if (data.success) {
      CLIUtils.printSuccess(`Agent registered: ${data.agent.agent_id}`);
    } else {
      CLIUtils.printError(`Registration failed: ${data.error}`);
      process.exit(1);
    }
  }

  async info(agentId) {
    CLIUtils.validateRequiredArg(
      agentId,
      'agent ID',
      'sfs-agent-cli agent info <agent-id>'
    );

    const data = await this.client.getAgent(agentId);

    if (!data.success) {
      CLIUtils.printError(`Agent not found: ${agentId}`);
      process.exit(1);
    }

    const agent = data.agent;

    console.log(`\n🤖 ${agent.agent_id}\n`);
    console.log('─'.repeat(60));
    console.log(`Name: ${agent.name || agent.agent_id}`);
    console.log(`Platform: ${agent.platform}`);
    console.log(`Status: ${agent.status}`);

    this._printList('Capabilities', agent.capabilities);
    this._printList('Apps', agent.apps);
    this._printList('Context Files', agent.context_files);

    console.log(`\nInvocations: ${agent.invocation_count || 0}`);
    if (agent.last_invoked) {
      console.log(`Last invoked: ${agent.last_invoked}`);
    }

    CLIUtils.printSeparator();
  }

  async invoke(agentId, taskFile) {
    CLIUtils.validateRequiredArg(
      agentId,
      'agent ID',
      'sfs-agent-cli agent invoke <agent-id> [task.json]'
    );

    let task = {};
    if (taskFile) {
      task = await CLIUtils.readJsonFile(taskFile);
    }

    console.log(`🚀 Invoking agent: ${agentId}...`);

    const data = await this.client.invokeAgent(agentId, task);

    if (data.success) {
      console.log(`\n✅ Agent invocation completed\n`);
      console.log(JSON.stringify(data.result, null, 2));
    } else {
      CLIUtils.printError(`Invocation failed: ${data.error}`);
      process.exit(1);
    }
  }

  _printList(title, items) {
    if (items && items.length > 0) {
      console.log(`\n${title}:`);
      items.forEach(item => console.log(`  - ${item}`));
    }
  }
}

/**
 * Command handlers for workflow operations
 */
class WorkflowCommands {
  constructor(client) {
    this.client = client;
  }

  async list() {
    const data = await this.client.listWorkflows();

    CLIUtils.printHeader('Workflows', data.count);

    for (const workflow of data.workflows) {
      console.log(`\n⚙️  ${workflow.id}`);
      if (workflow.name) console.log(`   Name: ${workflow.name}`);
      if (workflow.description) console.log(`   Description: ${workflow.description}`);
      console.log(`   Steps: ${workflow.steps.length}`);
    }

    CLIUtils.printSeparator();
  }

  async execute(workflowFile, contextFile) {
    CLIUtils.validateRequiredArg(
      workflowFile,
      'workflow file',
      'sfs-agent-cli workflow execute <workflow.json> [context.json]'
    );

    const workflow = await CLIUtils.readJsonFile(workflowFile);

    let context = {};
    if (contextFile) {
      context = await CLIUtils.readJsonFile(contextFile);
    }

    console.log(`🚀 Executing workflow: ${workflow.id}...`);

    const data = await this.client.executeWorkflow({ ...workflow, context });

    if (data.success) {
      const result = data.result;
      console.log(`\n✅ Workflow ${result.status}\n`);
      console.log(`Started: ${result.started_at}`);
      console.log(`Completed: ${result.completed_at || 'In progress'}`);
      console.log(`Steps completed: ${result.completed_steps.length}/${result.steps.length}`);

      if (result.error) {
        CLIUtils.printError(`Error: ${result.error}`);
      }
    } else {
      CLIUtils.printError(`Workflow execution failed: ${data.error}`);
      process.exit(1);
    }
  }

  async status(workflowId) {
    CLIUtils.validateRequiredArg(
      workflowId,
      'workflow ID',
      'sfs-agent-cli workflow status <workflow-id>'
    );

    // Note: This endpoint would need to be implemented in the API
    CLIUtils.printError('Workflow status check not yet implemented');
    process.exit(1);
  }
}

/**
 * Command handlers for package operations
 */
class PackageCommands {
  constructor(client) {
    this.client = client;
  }

  async list() {
    const data = await this.client.listPackages();

    CLIUtils.printHeader('Packages', data.count);

    for (const pkg of data.packages) {
      console.log(`\n📦 ${pkg.package_id} (v${pkg.version})`);
      if (pkg.name) console.log(`   Name: ${pkg.name}`);
      if (pkg.description) console.log(`   Description: ${pkg.description}`);
      console.log(`   Agents: ${pkg.agents.join(', ')}`);

      if (pkg.capabilities) {
        console.log(`   Capabilities: ${pkg.capabilities.join(', ')}`);
      }
    }

    CLIUtils.printSeparator();
  }

  async info(packageId) {
    CLIUtils.validateRequiredArg(
      packageId,
      'package ID',
      'sfs-agent-cli package info <package-id>'
    );

    const data = await this.client.getPackage(packageId);

    if (!data.success) {
      CLIUtils.printError(`Package not found: ${packageId}`);
      process.exit(1);
    }

    const pkg = data.package;

    console.log(`\n📦 ${pkg.package_id} (v${pkg.version})\n`);
    console.log('─'.repeat(60));
    console.log(`Name: ${pkg.name || pkg.package_id}`);
    if (pkg.description) console.log(`Description: ${pkg.description}`);

    this._printList('Agents', pkg.agents);
    this._printList('Capabilities', pkg.capabilities);

    if (pkg.workflow) {
      console.log(`\nWorkflow Steps: ${pkg.workflow.length}`);
      pkg.workflow.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step.name || step.action}`);
      });
    }

    CLIUtils.printSeparator();
  }

  async execute(packageId, contextFile) {
    CLIUtils.validateRequiredArg(
      packageId,
      'package ID',
      'sfs-agent-cli package execute <package-id> [context.json]'
    );

    let context = {};
    if (contextFile) {
      context = await CLIUtils.readJsonFile(contextFile);
    }

    console.log(`🚀 Executing package: ${packageId}...`);

    const data = await this.client.executePackage(packageId, context);

    if (data.success) {
      const result = data.result;
      const workflowResult = result.workflow_result;

      console.log(`\n✅ Package execution ${workflowResult.status}\n`);
      console.log(`Package: ${result.package_id} (v${result.version})`);
      console.log(`Steps completed: ${workflowResult.completed_steps.length}`);
    } else {
      CLIUtils.printError(`Package execution failed: ${data.error}`);
      process.exit(1);
    }
  }

  _printList(title, items) {
    if (items && items.length > 0) {
      console.log(`\n${title}:`);
      items.forEach(item => console.log(`  - ${item}`));
    }
  }
}

/**
 * SFS Agent CLI - Command-line tool for managing agents, workflows, and packages
 */
class SFSAgentCLI {
  constructor() {
    this.client = new OrchestratorClient();
    this.agentCommands = new AgentCommands(this.client);
    this.workflowCommands = new WorkflowCommands(this.client);
    this.packageCommands = new PackageCommands(this.client);
  }

  /**
   * Main CLI handler with command routing
   */
  async run(args) {
    const [command, subcommand, ...remainingArgs] = args;

    try {
      switch (command) {
        case 'agent':
          await this.handleAgentCommand(subcommand, remainingArgs);
          break;

        case 'workflow':
          await this.handleWorkflowCommand(subcommand, remainingArgs);
          break;

        case 'package':
          await this.handlePackageCommand(subcommand, remainingArgs);
          break;

        case 'status':
          await this.showStatus();
          break;

        case 'help':
          this.showHelp();
          break;

        default:
          CLIUtils.printError(`Unknown command: ${command}`);
          this.showHelp();
          process.exit(1);
      }
    } catch (error) {
      CLIUtils.printError(error.message);
      process.exit(1);
    }
  }

  /**
   * Route agent subcommands to appropriate handlers
   */
  async handleAgentCommand(subcommand, args) {
    const handlers = {
      list: () => this.agentCommands.list(),
      register: () => this.agentCommands.register(args[0]),
      info: () => this.agentCommands.info(args[0]),
      invoke: () => this.agentCommands.invoke(args[0], args[1])
    };

    const handler = handlers[subcommand];

    if (handler) {
      await handler();
    } else {
      console.log('Usage: sfs-agent-cli agent [list|register|info|invoke]');
    }
  }

  /**
   * Route workflow subcommands to appropriate handlers
   */
  async handleWorkflowCommand(subcommand, args) {
    const handlers = {
      list: () => this.workflowCommands.list(),
      execute: () => this.workflowCommands.execute(args[0], args[1]),
      status: () => this.workflowCommands.status(args[0])
    };

    const handler = handlers[subcommand];

    if (handler) {
      await handler();
    } else {
      console.log('Usage: sfs-agent-cli workflow [list|execute|status]');
    }
  }

  /**
   * Route package subcommands to appropriate handlers
   */
  async handlePackageCommand(subcommand, args) {
    const handlers = {
      list: () => this.packageCommands.list(),
      info: () => this.packageCommands.info(args[0]),
      execute: () => this.packageCommands.execute(args[0], args[1])
    };

    const handler = handlers[subcommand];

    if (handler) {
      await handler();
    } else {
      console.log('Usage: sfs-agent-cli package [list|info|execute]');
    }
  }

  /**
   * Show orchestrator health and status
   */
  async showStatus() {
    const data = await this.client.getHealth();

    console.log(`\n🧠 SFS Orchestrator Status\n`);
    console.log('─'.repeat(60));
    console.log(`Service: ${data.service}`);
    console.log(`Version: ${data.version}`);
    console.log(`Status: ${data.ok ? '✅ Healthy' : '❌ Unhealthy'}`);
    console.log(`\nComponents:`);
    console.log(`  Agents: ${data.components.agents}`);
    console.log(`  Packages: ${data.components.packages.total}`);
    console.log(`  Active Workflows: ${data.components.workflows.active}`);
    console.log(`  Connectors: ${data.components.connectors.join(', ')}`);
    CLIUtils.printSeparator();
  }

  /**
   * Display CLI usage help
   */
  showHelp() {
    console.log(`
SFS Agent CLI - Manage agents, workflows, and packages

Usage: sfs-agent-cli <command> [options]

Commands:
  agent list                        List all registered agents
  agent register <manifest.json>    Register a new agent
  agent info <agent-id>             Show agent details
  agent invoke <agent-id> [task.json] Invoke an agent

  workflow list                     List all workflows
  workflow execute <workflow.json> [context.json] Execute a workflow
  workflow status <workflow-id>     Check workflow status

  package list                      List all packages
  package info <package-id>         Show package details
  package execute <package-id> [context.json] Execute a package

  status                            Show orchestrator status
  help                              Show this help message

Examples:
  sfs-agent-cli agent list
  sfs-agent-cli package execute smart-starter
  sfs-agent-cli workflow execute .sfs/workflows/client-onboard.json
`);
  }
}

// CLI entry point
if (require.main === module) {
  const cli = new SFSAgentCLI();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    cli.showHelp();
    process.exit(0);
  }

  cli.run(args).catch(error => {
    CLIUtils.printError(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = SFSAgentCLI;
