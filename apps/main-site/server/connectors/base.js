/**
 * Base Connector Class
 * All platform connectors extend this
 */
class BaseConnector {
  constructor(platform, config = {}) {
    this.platform = platform;
    this.config = config;
  }

  /**
   * Initialize connector
   */
  async initialize() {
    console.log(`🔌 Initialized ${this.platform} connector`);
  }

  /**
   * Invoke an agent on this platform
   * Must be implemented by subclasses
   */
  async invoke(agentId, task) {
    throw new Error(`invoke() not implemented for ${this.platform}`);
  }

  /**
   * Test connector connection
   */
  async test() {
    try {
      await this.invoke('test', { action: 'ping' });
      return { success: true, platform: this.platform };
    } catch (error) {
      return { success: false, platform: this.platform, error: error.message };
    }
  }

  /**
   * Get connector status
   */
  getStatus() {
    return {
      platform: this.platform,
      status: 'active',
      config: Object.keys(this.config)
    };
  }
}

module.exports = BaseConnector;
