#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * ChatGPT <-> Claude File Sync Service
 * Keeps context files synchronized between platforms
 */
class FileSyncService {
  constructor(config = {}) {
    this.config = config;
    this.syncConfigPath = path.join(process.cwd(), '.sfs', 'chatgpt-bridge-config.json');
    this.lastSyncPath = path.join(process.cwd(), '.sfs', 'state', 'last-sync.json');
  }

  /**
   * Initialize sync service
   */
  async initialize() {
    try {
      const configContent = await fs.readFile(this.syncConfigPath, 'utf8');
      this.syncConfig = JSON.parse(configContent);
      console.log('✅ File sync service initialized');
    } catch (error) {
      console.error('❌ Failed to load sync config:', error.message);
      throw error;
    }
  }

  /**
   * Run sync operation
   */
  async sync() {
    console.log('🔄 Starting file sync...');

    const syncResults = {
      timestamp: new Date().toISOString(),
      synced_files: [],
      errors: []
    };

    try {
      // Get files that need syncing
      const filesToSync = await this.getFilesToSync();

      console.log(`📁 Found ${filesToSync.length} files to sync`);

      for (const file of filesToSync) {
        try {
          await this.syncFile(file);
          syncResults.synced_files.push(file);
          console.log(`✅ Synced: ${file.source} -> ${file.destination}`);
        } catch (error) {
          syncResults.errors.push({
            file: file.source,
            error: error.message
          });
          console.error(`❌ Failed to sync ${file.source}:`, error.message);
        }
      }

      // Save sync results
      await fs.writeFile(this.lastSyncPath, JSON.stringify(syncResults, null, 2));

      console.log(`✅ Sync completed: ${syncResults.synced_files.length} files synced, ${syncResults.errors.length} errors`);

      return syncResults;
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Get files that need syncing
   */
  async getFilesToSync() {
    const files = [];

    // Get last sync timestamp
    let lastSyncTime = 0;
    try {
      const lastSync = await fs.readFile(this.lastSyncPath, 'utf8');
      const data = JSON.parse(lastSync);
      lastSyncTime = new Date(data.timestamp).getTime();
    } catch (error) {
      // No previous sync
    }

    // Check each file in sync config
    for (const project of this.syncConfig.chatgpt_projects || []) {
      for (const filePattern of project.sync_files || []) {
        const matchedFiles = await this.expandFilePattern(filePattern);

        for (const file of matchedFiles) {
          const stats = await fs.stat(file);

          // Only sync if modified since last sync
          if (stats.mtimeMs > lastSyncTime || lastSyncTime === 0) {
            files.push({
              source: file,
              destination: file,
              project: project.name,
              modified: stats.mtime
            });
          }
        }
      }
    }

    return files;
  }

  /**
   * Expand file pattern (supports globs)
   */
  async expandFilePattern(pattern) {
    const files = [];

    try {
      if (pattern.includes('*')) {
        // Use glob pattern matching
        const { stdout } = await execAsync(`find . -path "${pattern}" -type f`);
        const matches = stdout.trim().split('\n').filter(f => f);
        files.push(...matches.map(f => path.resolve(f)));
      } else {
        // Single file
        const filePath = path.resolve(pattern);
        try {
          await fs.access(filePath);
          files.push(filePath);
        } catch (error) {
          // File doesn't exist
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not expand pattern: ${pattern}`);
    }

    return files;
  }

  /**
   * Sync a single file
   */
  async syncFile(file) {
    const { source, destination } = file;

    // Read source file
    const content = await fs.readFile(source, 'utf8');

    // Ensure destination directory exists
    const destDir = path.dirname(destination);
    await fs.mkdir(destDir, { recursive: true });

    // Write to destination
    await fs.writeFile(destination, content);

    return true;
  }

  /**
   * Watch for file changes and auto-sync
   */
  async watch() {
    console.log('👀 Watching for file changes...');

    const interval = (this.syncConfig.sync_interval || '5m');
    const intervalMs = this.parseInterval(interval);

    setInterval(async () => {
      try {
        await this.sync();
      } catch (error) {
        console.error('❌ Auto-sync failed:', error.message);
      }
    }, intervalMs);

    console.log(`✅ Auto-sync enabled (interval: ${interval})`);
  }

  /**
   * Parse interval string (e.g., "5m", "1h")
   */
  parseInterval(interval) {
    const match = interval.match(/^(\d+)([smh])$/);

    if (!match) {
      return 300000; // Default: 5 minutes
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers = {
      s: 1000,
      m: 60000,
      h: 3600000
    };

    return value * multipliers[unit];
  }

  /**
   * Get sync status
   */
  async getStatus() {
    try {
      const lastSync = await fs.readFile(this.lastSyncPath, 'utf8');
      const data = JSON.parse(lastSync);

      return {
        last_sync: data.timestamp,
        synced_files: data.synced_files.length,
        errors: data.errors.length,
        config: this.syncConfig
      };
    } catch (error) {
      return {
        last_sync: null,
        synced_files: 0,
        errors: 0,
        config: this.syncConfig
      };
    }
  }
}

// CLI Usage
if (require.main === module) {
  const service = new FileSyncService();

  const command = process.argv[2];

  (async () => {
    await service.initialize();

    switch (command) {
      case 'sync':
        await service.sync();
        break;

      case 'watch':
        await service.watch();
        // Keep process running
        await new Promise(() => {});
        break;

      case 'status':
        const status = await service.getStatus();
        console.log(JSON.stringify(status, null, 2));
        break;

      default:
        console.log('Usage: sync-chatgpt-claude.js [sync|watch|status]');
        process.exit(1);
    }
  })();
}

module.exports = FileSyncService;
