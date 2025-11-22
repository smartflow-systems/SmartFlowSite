#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * SFS Agent CLI - Command-line tool for managing agents, workflows, and packages
 */
class SFSAgentCLI {
  constructor() {
    this.baseUrl = process.env.ORCHESTRATOR_URL || 'http://localhost:5001';
  }

  /**
   * Main CLI handler
   */
  async run(args) {
    const command = args[0];
    const subcommand = args[1];

    try {
      switch (command) {
        case 'agent':
          await this.handleAgent(subcommand, args.slice(2));
          break;

        case 'workflow':
          await this.handleWorkflow(subcommand, args.slice(2));
          break;

        case 'package':
          await this.handlePackage(subcommand, args.slice(2));
          break;

        case 'status':
          await this.showStatus();
          break;

        case 'help':
          this.showHelp();
          break;

        default:
          console.log(`Unknown command: ${command}`);
          this.showHelp();
          process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Handle agent commands
   */
  async handleAgent(subcommand, args) {
    switch (subcommand) {
      case 'list':
        await this.listAgents();
        break;

      case 'register':
        await this.registerAgent(args[0]);
        break;

      case 'info':
        await this.agentInfo(args[0]);
        break;

      case 'invoke':
        await this.invokeAgent(args[0], args[1]);
        break;

      default:
        console.log('Usage: sfs-agent-cli agent [list|register|info|invoke]');
    }
  }

  /**
   * Handle workflow commands
   */
  async handleWorkflow(subcommand, args) {
    switch (subcommand) {
      case 'list':
        await this.listWorkflows();
        break;

      case 'execute':
        await this.executeWorkflow(args[0], args[1]);
        break;

      case 'status':
        await this.workflowStatus(args[0]);
        break;

      default:
        console.log('Usage: sfs-agent-cli workflow [list|execute|status]');
    }
  }

  /**
   * Handle package commands
   */
  async handlePackage(subcommand, args) {
    switch (subcommand) {
      case 'list':
        await this.listPackages();
        break;

      case 'info':
        await this.packageInfo(args[0]);
        break;

      case 'execute':
        await this.executePackage(args[0], args[1]);
        break;

      default:
        console.log('Usage: sfs-agent-cli package [list|info|execute]');
    }
  }

  /**
   * List all agents
   */
  async listAgents() {
    const response = await fetch(`${this.baseUrl}/api/agents`);
    const data = await response.json();

    console.log(`\n📋 Registered Agents (${data.count})\n`);
    console.log('─'.repeat(60));

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

    console.log('\n' + '─'.repeat(60) + '\n');
  }

  /**
   * Register an agent from manifest file
   */
  async registerAgent(manifestPath) {
    const content = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(content);

    const response = await fetch(`${this.baseUrl}/api/agents/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(manifest)
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✅ Agent registered: ${data.agent.agent_id}`);
    } else {
      console.error(`❌ Registration failed: ${data.error}`);
      process.exit(1);
    }
  }

  /**
   * Show agent info
   */
  async agentInfo(agentId) {
    const response = await fetch(`${this.baseUrl}/api/agents/${agentId}`);
    const data = await response.json();

    if (!data.success) {
      console.error(`❌ Agent not found: ${agentId}`);
      process.exit(1);
    }

    const agent = data.agent;

    console.log(`\n🤖 ${agent.agent_id}\n`);
    console.log('─'.repeat(60));
    console.log(`Name: ${agent.name || agent.agent_id}`);
    console.log(`Platform: ${agent.platform}`);
    console.log(`Status: ${agent.status}`);
    console.log(`\nCapabilities:`);
    agent.capabilities.forEach(cap => console.log(`  - ${cap}`));

    if (agent.apps && agent.apps.length > 0) {
      console.log(`\nApps:`);
      agent.apps.forEach(app => console.log(`  - ${app}`));
    }

    if (agent.context_files && agent.context_files.length > 0) {
      console.log(`\nContext Files:`);
      agent.context_files.forEach(file => console.log(`  - ${file}`));
    }

    console.log(`\nInvocations: ${agent.invocation_count || 0}`);
    if (agent.last_invoked) {
      console.log(`Last invoked: ${agent.last_invoked}`);
    }

    console.log('─'.repeat(60) + '\n');
  }

  /**
   * Invoke an agent
   */
  async invokeAgent(agentId, taskFile) {
    let task = {};

    if (taskFile) {
      const content = await fs.readFile(taskFile, 'utf8');
      task = JSON.parse(content);
    }

    console.log(`🚀 Invoking agent: ${agentId}...`);

    const response = await fetch(`${this.baseUrl}/api/agents/${agentId}/invoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });

    const data = await response.json();

    if (data.success) {
      console.log(`\n✅ Agent invocation completed\n`);
      console.log(JSON.stringify(data.result, null, 2));
    } else {
      console.error(`❌ Invocation failed: ${data.error}`);
      process.exit(1);
    }
  }

  /**
   * List workflows
   */
  async listWorkflows() {
    const response = await fetch(`${this.baseUrl}/api/workflows`);
    const data = await response.json();

    console.log(`\n📋 Workflows (${data.count})\n`);
    console.log('─'.repeat(60));

    for (const workflow of data.workflows) {
      console.log(`\n⚙️  ${workflow.id}`);
      if (workflow.name) console.log(`   Name: ${workflow.name}`);
      if (workflow.description) console.log(`   Description: ${workflow.description}`);
      console.log(`   Steps: ${workflow.steps.length}`);
    }

    console.log('\n' + '─'.repeat(60) + '\n');
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowFile, contextFile) {
    const workflowContent = await fs.readFile(workflowFile, 'utf8');
    const workflow = JSON.parse(workflowContent);

    let context = {};
    if (contextFile) {
      const contextContent = await fs.readFile(contextFile, 'utf8');
      context = JSON.parse(contextContent);
    }

    console.log(`🚀 Executing workflow: ${workflow.id}...`);

    const response = await fetch(`${this.baseUrl}/api/workflows/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...workflow, context })
    });

    const data = await response.json();

    if (data.success) {
      console.log(`\n✅ Workflow ${data.result.status}\n`);
      console.log(`Started: ${data.result.started_at}`);
      console.log(`Completed: ${data.result.completed_at || 'In progress'}`);
      console.log(`Steps completed: ${data.result.completed_steps.length}/${data.result.steps.length}`);

      if (data.result.error) {
        console.log(`\n❌ Error: ${data.result.error}`);
      }
    } else {
      console.error(`❌ Workflow execution failed: ${data.error}`);
      process.exit(1);
    }
  }

  /**
   * List packages
   */
  async listPackages() {
    const response = await fetch(`${this.baseUrl}/api/packages`);
    const data = await response.json();

    console.log(`\n📦 Packages (${data.count})\n`);
    console.log('─'.repeat(60));

    for (const pkg of data.packages) {
      console.log(`\n📦 ${pkg.package_id} (v${pkg.version})`);
      if (pkg.name) console.log(`   Name: ${pkg.name}`);
      if (pkg.description) console.log(`   Description: ${pkg.description}`);
      console.log(`   Agents: ${pkg.agents.join(', ')}`);
      if (pkg.capabilities) {
        console.log(`   Capabilities: ${pkg.capabilities.join(', ')}`);
      }
    }

    console.log('\n' + '─'.repeat(60) + '\n');
  }

  /**
   * Show package info
   */
  async packageInfo(packageId) {
    const response = await fetch(`${this.baseUrl}/api/packages/${packageId}`);
    const data = await response.json();

    if (!data.success) {
      console.error(`❌ Package not found: ${packageId}`);
      process.exit(1);
    }

    const pkg = data.package;

    console.log(`\n📦 ${pkg.package_id} (v${pkg.version})\n`);
    console.log('─'.repeat(60));
    console.log(`Name: ${pkg.name || pkg.package_id}`);
    if (pkg.description) console.log(`Description: ${pkg.description}`);

    console.log(`\nAgents:`);
    pkg.agents.forEach(agent => console.log(`  - ${agent}`));

    if (pkg.capabilities) {
      console.log(`\nCapabilities:`);
      pkg.capabilities.forEach(cap => console.log(`  - ${cap}`));
    }

    if (pkg.workflow) {
      console.log(`\nWorkflow Steps: ${pkg.workflow.length}`);
      pkg.workflow.forEach((step, i) => {
        console.log(`  ${i + 1}. ${step.name || step.action}`);
      });
    }

    console.log('─'.repeat(60) + '\n');
  }

  /**
   * Execute a package
   */
  async executePackage(packageId, contextFile) {
    let context = {};
    if (contextFile) {
      const content = await fs.readFile(contextFile, 'utf8');
      context = JSON.parse(content);
    }

    console.log(`🚀 Executing package: ${packageId}...`);

    const response = await fetch(`${this.baseUrl}/api/packages/${packageId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context })
    });

    const data = await response.json();

    if (data.success) {
      console.log(`\n✅ Package execution ${data.result.workflow_result.status}\n`);
      console.log(`Package: ${data.result.package_id} (v${data.result.version})`);
      console.log(`Steps completed: ${data.result.workflow_result.completed_steps.length}`);
    } else {
      console.error(`❌ Package execution failed: ${data.error}`);
      process.exit(1);
    }
  }

  /**
   * Show orchestrator status
   */
  async showStatus() {
    const response = await fetch(`${this.baseUrl}/health`);
    const data = await response.json();

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
    console.log('─'.repeat(60) + '\n');
  }

  /**
   * Show help
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

// Run CLI
if (require.main === module) {
  const cli = new SFSAgentCLI();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    cli.showHelp();
    process.exit(0);
  }

  cli.run(args).catch(error => {
    console.error(`❌ Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = SFSAgentCLI;
