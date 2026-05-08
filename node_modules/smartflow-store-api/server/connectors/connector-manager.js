/**
 * Connector Manager - Manages all platform connectors
 */
class ConnectorManager {
  constructor() {
    this.connectors = new Map();
  }

  /**
   * Register a connector
   */
  register(platform, connector) {
    this.connectors.set(platform, connector);
    console.log(`✅ Registered ${platform} connector`);
  }

  /**
   * Get connector by platform
   */
  get(platform) {
    return this.connectors.get(platform);
  }

  /**
   * Initialize all connectors
   */
  async initializeAll() {
    for (const [platform, connector] of this.connectors.entries()) {
      try {
        await connector.initialize();
      } catch (error) {
        console.error(`❌ Failed to initialize ${platform} connector:`, error.message);
      }
    }
  }

  /**
   * Test all connectors
   */
  async testAll() {
    const results = {};

    for (const [platform, connector] of this.connectors.entries()) {
      results[platform] = await connector.test();
    }

    return results;
  }

  /**
   * Get all connector statuses
   */
  getAllStatuses() {
    const statuses = {};

    for (const [platform, connector] of this.connectors.entries()) {
      statuses[platform] = connector.getStatus();
    }

    return statuses;
  }

  /**
   * List all platforms
   */
  list() {
    return Array.from(this.connectors.keys());
  }
}

module.exports = ConnectorManager;
