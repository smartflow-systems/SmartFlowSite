const fs = require('fs').promises;
const path = require('path');

/**
 * Agent Registry - Manages agent discovery, registration, and lifecycle
 */
class AgentRegistry {
  constructor() {
    this.agents = new Map();
    this.manifestDir = path.join(process.cwd(), '.sfs', 'agents');
  }

  /**
   * Sanitize agent ID to prevent path traversal attacks
   */
  sanitizeAgentId(agentId) {
    const safe = agentId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return safe.replace(/^\.+/, '_');
  }

  /**
   * Get safe path for agent manifest
   */
  getSafePath(agentId) {
    const sanitized = this.sanitizeAgentId(agentId);
    const safePath = path.join(this.manifestDir, `${sanitized}.json`);
    const resolvedPath = path.resolve(safePath);
    const resolvedBase = path.resolve(this.manifestDir);
    if (!resolvedPath.startsWith(resolvedBase)) {
      throw new Error('Invalid agent ID: path traversal detected');
    }
    return safePath;
  }

  /**
   * Initialize registry by loading all agent manifests
   */
  async initialize() {
    try {
      await fs.mkdir(this.manifestDir, { recursive: true });
      const files = await fs.readdir(this.manifestDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const manifestPath = path.join(this.manifestDir, file);
          await this.loadManifest(manifestPath);
        }
      }

      console.log(`✅ Loaded ${this.agents.size} agents from manifests`);
      return this.agents.size;
    } catch (error) {
      console.error('❌ Failed to initialize registry:', error.message);
      throw error;
    }
  }

  /**
   * Load an agent manifest from file
   */
  async loadManifest(manifestPath) {
    try {
      const content = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(content);

      // Validate manifest
      this.validateManifest(manifest);

      // Register agent
      this.agents.set(manifest.agent_id, {
        ...manifest,
        status: 'ready',
        last_invoked: null,
        invocation_count: 0
      });

      console.log(`📝 Registered agent: ${manifest.agent_id}`);
      return manifest;
    } catch (error) {
      console.error(`❌ Failed to load manifest ${manifestPath}:`, error.message);
      throw error;
    }
  }

  /**
   * Register a new agent (runtime or from manifest)
   */
  async register(manifest) {
    this.validateManifest(manifest);

    // Save manifest to disk
    const manifestPath = this.getSafePath(manifest.agent_id);
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    // Add to registry
    this.agents.set(manifest.agent_id, {
      ...manifest,
      status: 'ready',
      last_invoked: null,
      invocation_count: 0
    });

    console.log(`✅ Registered new agent: ${manifest.agent_id}`);
    return this.agents.get(manifest.agent_id);
  }

  /**
   * Validate agent manifest structure
   */
  validateManifest(manifest) {
    const required = ['agent_id', 'platform', 'capabilities'];
    for (const field of required) {
      if (!manifest[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(manifest.capabilities)) {
      throw new Error('capabilities must be an array');
    }

    return true;
  }

  /**
   * Get agent by ID
   */
  get(agentId) {
    return this.agents.get(agentId);
  }

  /**
   * Find agents by capability
   */
  findByCapability(capability) {
    const matches = [];
    for (const [, agent] of this.agents.entries()) {
      if (agent.capabilities.includes(capability)) {
        matches.push(agent);
      }
    }
    return matches;
  }

  /**
   * Find agents by platform
   */
  findByPlatform(platform) {
    const matches = [];
    for (const [, agent] of this.agents.entries()) {
      if (agent.platform === platform) {
        matches.push(agent);
      }
    }
    return matches;
  }

  /**
   * Find agents that support a specific app
   */
  findByApp(appName) {
    const matches = [];
    for (const [, agent] of this.agents.entries()) {
      if (agent.apps && agent.apps.includes(appName)) {
        matches.push(agent);
      }
    }
    return matches;
  }

  /**
   * Update agent status
   */
  updateStatus(agentId, status) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      return true;
    }
    return false;
  }

  /**
   * Record agent invocation
   */
  recordInvocation(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.last_invoked = new Date().toISOString();
      agent.invocation_count += 1;
      return true;
    }
    return false;
  }

  /**
   * List all agents
   */
  list() {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent count
   */
  count() {
    return this.agents.size;
  }

  /**
   * Unregister an agent
   */
  async unregister(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Remove from registry
    this.agents.delete(agentId);

    // Remove manifest file
    const manifestPath = this.getSafePath(agentId);
    try {
      await fs.unlink(manifestPath);
    } catch (error) {
      console.warn(`⚠️  Could not delete manifest file: ${manifestPath}`);
    }

    console.log(`🗑️  Unregistered agent: ${agentId}`);
    return true;
  }

  /**
   * Get registry stats
   */
  getStats() {
    const stats = {
      total: this.agents.size,
      by_platform: {},
      by_status: {},
      total_invocations: 0
    };

    for (const agent of this.agents.values()) {
      // Count by platform
      stats.by_platform[agent.platform] = (stats.by_platform[agent.platform] || 0) + 1;

      // Count by status
      stats.by_status[agent.status] = (stats.by_status[agent.status] || 0) + 1;

      // Total invocations
      stats.total_invocations += agent.invocation_count || 0;
    }

    return stats;
  }
}

module.exports = AgentRegistry;
