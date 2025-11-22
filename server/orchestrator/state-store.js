const fs = require('fs').promises;
const path = require('path');

/**
 * State Store - Manages shared state and context between agents
 * Uses file-based storage (SQLite can be added later)
 */
class StateStore {
  constructor() {
    this.stateDir = path.join(process.cwd(), '.sfs', 'state');
    this.cache = new Map();
  }

  /**
   * Sanitize namespace to prevent path traversal attacks
   * @param {string} namespace - The namespace to sanitize
   * @returns {string} - Safe namespace
   */
  sanitizeNamespace(namespace) {
    // Remove any path separators and dangerous characters
    const safe = namespace.replace(/[^a-zA-Z0-9_-]/g, '_');
    // Ensure it doesn't start with dots
    return safe.replace(/^\.+/, '_');
  }

  /**
   * Get safe path for namespace file
   * @param {string} namespace - The namespace
   * @returns {string} - Safe absolute path
   */
  getSafePath(namespace) {
    const sanitized = this.sanitizeNamespace(namespace);
    const safePath = path.join(this.stateDir, `${sanitized}.json`);

    // Verify the resolved path is within stateDir
    const resolvedPath = path.resolve(safePath);
    const resolvedBase = path.resolve(this.stateDir);

    if (!resolvedPath.startsWith(resolvedBase)) {
      throw new Error('Invalid namespace: path traversal detected');
    }

    return safePath;
  }

  /**
   * Initialize state store
   */
  async initialize() {
    await fs.mkdir(this.stateDir, { recursive: true});
    console.log('✅ State store initialized');
  }

  /**
   * Set a value in the store
   */
  async set(key, value, options = {}) {
    const { ttl, namespace = 'global' } = options;

    const entry = {
      key,
      value,
      namespace,
      created_at: new Date().toISOString(),
      expires_at: ttl ? new Date(Date.now() + ttl * 1000).toISOString() : null,
      metadata: options.metadata || {}
    };

    // Update cache
    const cacheKey = `${namespace}:${key}`;
    this.cache.set(cacheKey, entry);

    // Persist to disk
    await this.persist(namespace);

    return entry;
  }

  /**
   * Get a value from the store
   */
  async get(key, namespace = 'global') {
    const cacheKey = `${namespace}:${key}`;

    // Check cache first
    let entry = this.cache.get(cacheKey);

    // Load from disk if not in cache
    if (!entry) {
      await this.loadNamespace(namespace);
      entry = this.cache.get(cacheKey);
    }

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expires_at && new Date(entry.expires_at) < new Date()) {
      await this.delete(key, namespace);
      return null;
    }

    return entry.value;
  }

  /**
   * Delete a value from the store
   */
  async delete(key, namespace = 'global') {
    const cacheKey = `${namespace}:${key}`;
    this.cache.delete(cacheKey);
    await this.persist(namespace);
    return true;
  }

  /**
   * Get all keys in a namespace
   */
  async keys(namespace = 'global') {
    await this.loadNamespace(namespace);
    const prefix = `${namespace}:`;
    const keys = [];

    for (const cacheKey of this.cache.keys()) {
      if (cacheKey.startsWith(prefix)) {
        keys.push(cacheKey.substring(prefix.length));
      }
    }

    return keys;
  }

  /**
   * Get all values in a namespace
   */
  async getAll(namespace = 'global') {
    await this.loadNamespace(namespace);
    const prefix = `${namespace}:`;
    const values = {};

    for (const [cacheKey, entry] of this.cache.entries()) {
      if (cacheKey.startsWith(prefix)) {
        const key = cacheKey.substring(prefix.length);

        // Skip expired entries
        if (entry.expires_at && new Date(entry.expires_at) < new Date()) {
          continue;
        }

        values[key] = entry.value;
      }
    }

    return values;
  }

  /**
   * Clear all values in a namespace
   */
  async clear(namespace = 'global') {
    const prefix = `${namespace}:`;
    const keysToDelete = [];

    for (const cacheKey of this.cache.keys()) {
      if (cacheKey.startsWith(prefix)) {
        keysToDelete.push(cacheKey);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    await this.persist(namespace);
    return keysToDelete.length;
  }

  /**
   * Persist namespace to disk
   */
  async persist(namespace) {
    const prefix = `${namespace}:`;
    const data = {};

    for (const [cacheKey, entry] of this.cache.entries()) {
      if (cacheKey.startsWith(prefix)) {
        const key = cacheKey.substring(prefix.length);
        data[key] = entry;
      }
    }

    const filePath = this.getSafePath(namespace);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Load namespace from disk
   */
  async loadNamespace(namespace) {
    const filePath = this.getSafePath(namespace);

    try {
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);

      for (const [key, entry] of Object.entries(data)) {
        const cacheKey = `${namespace}:${key}`;
        this.cache.set(cacheKey, entry);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`❌ Failed to load namespace ${namespace}:`, error.message);
      }
    }
  }

  /**
   * Set agent context (shared data for an agent)
   */
  async setAgentContext(agentId, context) {
    return this.set(agentId, context, { namespace: 'agent-context' });
  }

  /**
   * Get agent context
   */
  async getAgentContext(agentId) {
    return this.get(agentId, 'agent-context');
  }

  /**
   * Set workflow state
   */
  async setWorkflowState(workflowId, state) {
    return this.set(workflowId, state, { namespace: 'workflows' });
  }

  /**
   * Get workflow state
   */
  async getWorkflowState(workflowId) {
    return this.get(workflowId, 'workflows');
  }

  /**
   * Store agent output for cross-agent communication
   */
  async storeAgentOutput(agentId, output, metadata = {}) {
    const key = `${agentId}:${Date.now()}`;
    return this.set(key, output, {
      namespace: 'agent-outputs',
      metadata: {
        agent_id: agentId,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });
  }

  /**
   * Get recent agent outputs
   */
  async getAgentOutputs(agentId, limit = 10) {
    const allOutputs = await this.getAll('agent-outputs');
    const outputs = [];

    for (const [key, value] of Object.entries(allOutputs)) {
      if (key.startsWith(`${agentId}:`)) {
        outputs.push(value);
      }
    }

    return outputs.slice(-limit);
  }

  /**
   * Get store statistics
   */
  async getStats() {
    const stats = {
      total_keys: this.cache.size,
      namespaces: {},
      total_size: 0
    };

    for (const [cacheKey, entry] of this.cache.entries()) {
      const namespace = cacheKey.split(':')[0];
      stats.namespaces[namespace] = (stats.namespaces[namespace] || 0) + 1;

      // Rough size estimate
      const size = JSON.stringify(entry).length;
      stats.total_size += size;
    }

    return stats;
  }
}

module.exports = StateStore;
