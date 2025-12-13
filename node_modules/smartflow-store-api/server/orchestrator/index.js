const express = require('express');
const cors = require('cors');
const AgentRegistry = require('./registry');
const StateStore = require('./state-store');
const WorkflowEngine = require('./workflow-engine');
const PackageManager = require('./package-manager');
const ConnectorManager = require('../connectors/connector-manager');
const ClaudeConnector = require('../connectors/claude');
const ChatGPTConnector = require('../connectors/chatgpt');

/**
 * SFS Orchestrator - Main service
 */
class SFSOrchestrator {
  constructor(config = {}) {
    this.config = {
      port: config.port || process.env.ORCHESTRATOR_PORT || 5001,
      host: config.host || '0.0.0.0',
      ...config
    };

    // Initialize components
    this.app = express();
    this.registry = new AgentRegistry();
    this.stateStore = new StateStore();
    this.connectorManager = new ConnectorManager();
    this.workflowEngine = new WorkflowEngine(
      this.registry,
      this.stateStore,
      this.connectorManager
    );
    this.packageManager = new PackageManager(
      this.registry,
      this.workflowEngine
    );
  }

  /**
   * Initialize orchestrator
   */
  async initialize() {
    console.log('🧠 SFS Orchestrator initializing...\n');

    // Initialize middleware
    this.app.use(cors());
    this.app.use(express.json());

    // Initialize components
    await this.stateStore.initialize();
    await this.registry.initialize();
    await this.workflowEngine.initialize();
    await this.packageManager.initialize();

    // Initialize connectors
    this.setupConnectors();
    await this.connectorManager.initializeAll();

    // Setup routes
    this.setupRoutes();

    console.log('\n✅ SFS Orchestrator ready\n');
  }

  /**
   * Setup platform connectors
   */
  setupConnectors() {
    // Claude connector
    const claudeConnector = new ClaudeConnector({
      apiKey: process.env.ANTHROPIC_API_KEY,
      useApi: true
    });
    this.connectorManager.register('claude', claudeConnector);

    // ChatGPT connector
    const chatgptConnector = new ChatGPTConnector({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o'
    });
    this.connectorManager.register('chatgpt', chatgptConnector);

    // Custom connector (for future platforms)
    this.connectorManager.register('custom', {
      platform: 'custom',
      initialize: async () => {},
      invoke: async (agentId, task) => ({
        success: true,
        output: 'Custom connector placeholder'
      }),
      test: async () => ({ success: true }),
      getStatus: () => ({ platform: 'custom', status: 'active' })
    });

    console.log(`🔌 Registered ${this.connectorManager.list().length} connectors`);
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        ok: true,
        service: 'SFS Orchestrator',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        components: {
          agents: this.registry.count(),
          workflows: this.workflowEngine.getStats(),
          packages: this.packageManager.getStats(),
          connectors: this.connectorManager.list()
        }
      });
    });

    // ====================
    // Agent Routes
    // ====================

    // Register agent
    this.app.post('/api/agents/register', async (req, res) => {
      try {
        const agent = await this.registry.register(req.body);
        res.json({ success: true, agent });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
    });

    // List agents
    this.app.get('/api/agents', (req, res) => {
      const agents = this.registry.list();
      res.json({ success: true, agents, count: agents.length });
    });

    // Get agent by ID
    this.app.get('/api/agents/:agentId', (req, res) => {
      const agent = this.registry.get(req.params.agentId);

      if (!agent) {
        return res.status(404).json({ success: false, error: 'Agent not found' });
      }

      res.json({ success: true, agent });
    });

    // Find agents by capability
    this.app.get('/api/agents/capability/:capability', (req, res) => {
      const agents = this.registry.findByCapability(req.params.capability);
      res.json({ success: true, agents, count: agents.length });
    });

    // Invoke agent
    this.app.post('/api/agents/:agentId/invoke', async (req, res) => {
      try {
        const agent = this.registry.get(req.params.agentId);

        if (!agent) {
          return res.status(404).json({ success: false, error: 'Agent not found' });
        }

        const connector = this.connectorManager.get(agent.platform);

        if (!connector) {
          return res.status(500).json({
            success: false,
            error: `No connector for platform: ${agent.platform}`
          });
        }

        const result = await connector.invoke(req.params.agentId, req.body);

        this.registry.recordInvocation(req.params.agentId);

        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Unregister agent
    this.app.delete('/api/agents/:agentId', async (req, res) => {
      try {
        await this.registry.unregister(req.params.agentId);
        res.json({ success: true });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
    });

    // Get agent stats
    this.app.get('/api/agents/stats', (req, res) => {
      const stats = this.registry.getStats();
      res.json({ success: true, stats });
    });

    // ====================
    // Workflow Routes
    // ====================

    // Execute workflow
    this.app.post('/api/workflows/execute', async (req, res) => {
      try {
        const result = await this.workflowEngine.execute(req.body, req.body.context);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // List workflows
    this.app.get('/api/workflows', async (req, res) => {
      try {
        const workflows = await this.workflowEngine.listWorkflows();
        res.json({ success: true, workflows, count: workflows.length });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get active workflows
    this.app.get('/api/workflows/active', (req, res) => {
      const active = this.workflowEngine.getActive();
      res.json({ success: true, workflows: active, count: active.length });
    });

    // Save workflow
    this.app.post('/api/workflows', async (req, res) => {
      try {
        await this.workflowEngine.saveWorkflow(req.body);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ====================
    // Package Routes
    // ====================

    // Register package
    this.app.post('/api/packages/register', async (req, res) => {
      try {
        const pkg = await this.packageManager.register(req.body);
        res.json({ success: true, package: pkg });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
    });

    // List packages
    this.app.get('/api/packages', (req, res) => {
      const packages = this.packageManager.list();
      res.json({ success: true, packages, count: packages.length });
    });

    // Get package by ID
    this.app.get('/api/packages/:packageId', (req, res) => {
      const pkg = this.packageManager.get(req.params.packageId);

      if (!pkg) {
        return res.status(404).json({ success: false, error: 'Package not found' });
      }

      res.json({ success: true, package: pkg });
    });

    // Execute package
    this.app.post('/api/packages/:packageId/execute', async (req, res) => {
      try {
        const result = await this.packageManager.execute(
          req.params.packageId,
          req.body.context || {}
        );
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get package dependencies
    this.app.get('/api/packages/:packageId/dependencies', (req, res) => {
      try {
        const deps = this.packageManager.getDependencies(req.params.packageId);
        res.json({ success: true, dependencies: deps });
      } catch (error) {
        res.status(404).json({ success: false, error: error.message });
      }
    });

    // ====================
    // State Routes
    // ====================

    // Set state
    this.app.post('/api/state/:namespace/:key', async (req, res) => {
      try {
        await this.stateStore.set(req.params.key, req.body.value, {
          namespace: req.params.namespace,
          ...req.body.options
        });
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get state
    this.app.get('/api/state/:namespace/:key', async (req, res) => {
      try {
        const value = await this.stateStore.get(req.params.key, req.params.namespace);
        res.json({ success: true, value });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get all state in namespace
    this.app.get('/api/state/:namespace', async (req, res) => {
      try {
        const values = await this.stateStore.getAll(req.params.namespace);
        res.json({ success: true, values });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ====================
    // Connector Routes
    // ====================

    // List connectors
    this.app.get('/api/connectors', (req, res) => {
      const statuses = this.connectorManager.getAllStatuses();
      res.json({ success: true, connectors: statuses });
    });

    // Test connectors
    this.app.get('/api/connectors/test', async (req, res) => {
      const results = await this.connectorManager.testAll();
      res.json({ success: true, results });
    });

    // Orchestrator Dashboard (root)
    this.app.get('/', (req, res) => {
      res.sendFile('dashboard/index.html', { root: './public' });
    });

    // SmartFlowSite website (at /site)
    this.app.get('/site', (req, res) => {
      res.sendFile('index.html', { root: './public' });
    });

    // Serve static files for assets (CSS, JS, images, etc.)
    // This comes AFTER routes so dashboard index.html takes priority
    this.app.use(express.static('public'));

    console.log('🛣️  API routes configured');
  }

  /**
   * Start orchestrator server
   */
  async start() {
    await this.initialize();

    return new Promise((resolve) => {
      this.server = this.app.listen(this.config.port, this.config.host, () => {
        console.log('╔════════════════════════════════════════════════════╗');
        console.log('║  🧠 SFS ORCHESTRATOR RUNNING                      ║');
        console.log('╠════════════════════════════════════════════════════╣');
        console.log(`║  URL: http://localhost:${this.config.port.toString().padEnd(28)} ║`);
        console.log(`║  Agents: ${this.registry.count().toString().padEnd(34)} ║`);
        console.log(`║  Packages: ${this.packageManager.getStats().total.toString().padEnd(32)} ║`);
        console.log(`║  Connectors: ${this.connectorManager.list().length.toString().padEnd(30)} ║`);
        console.log('╚════════════════════════════════════════════════════╝');
        console.log('');
        resolve(this.server);
      });
    });
  }

  /**
   * Stop orchestrator server
   */
  async stop() {
    if (this.server) {
      await new Promise((resolve) => this.server.close(resolve));
      console.log('👋 SFS Orchestrator stopped');
    }
  }
}

// Start server if run directly
if (require.main === module) {
  const orchestrator = new SFSOrchestrator();
  orchestrator.start().catch(error => {
    console.error('❌ Failed to start orchestrator:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down...');
    await orchestrator.stop();
    process.exit(0);
  });
}

module.exports = SFSOrchestrator;
