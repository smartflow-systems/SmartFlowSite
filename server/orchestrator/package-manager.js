const fs = require('fs').promises;
const path = require('path');

/**
 * Package Manager - Manages agent capability bundles
 */
class PackageManager {
  constructor(registry, workflowEngine) {
    this.registry = registry;
    this.workflowEngine = workflowEngine;
    this.packageDir = path.join(process.cwd(), '.sfs', 'packages');
    this.packages = new Map();
  }

  /**
   * Sanitize package name to prevent path traversal attacks
   */
  sanitizePackageName(packageName) {
    const safe = packageName.replace(/[^a-zA-Z0-9_-]/g, '_');
    return safe.replace(/^\.+/, '_');
  }

  /**
   * Get safe path for package
   */
  getSafePath(packageName) {
    const sanitized = this.sanitizePackageName(packageName);
    const safePath = path.join(this.packageDir, `${sanitized}.json`);
    const resolvedPath = path.resolve(safePath);
    const resolvedBase = path.resolve(this.packageDir);
    if (!resolvedPath.startsWith(resolvedBase)) {
      throw new Error('Invalid package name: path traversal detected');
    }
    return safePath;
  }

  /**
   * Initialize package manager
   */
  async initialize() {
    await fs.mkdir(this.packageDir, { recursive: true });

    // Load all packages
    const files = await fs.readdir(this.packageDir);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const packagePath = path.join(this.packageDir, file);
        await this.loadPackage(packagePath);
      }
    }

    console.log(`✅ Loaded ${this.packages.size} packages`);
  }

  /**
   * Load a package from file
   */
  async loadPackage(packagePath) {
    try {
      const content = await fs.readFile(packagePath, 'utf8');
      const pkg = JSON.parse(content);

      this.validatePackage(pkg);

      this.packages.set(pkg.package_id, pkg);

      console.log(`📦 Loaded package: ${pkg.package_id}`);
      return pkg;
    } catch (error) {
      console.error(`❌ Failed to load package ${packagePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Validate package structure
   */
  validatePackage(pkg) {
    const required = ['package_id', 'version', 'agents'];

    for (const field of required) {
      if (!pkg[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(pkg.agents)) {
      throw new Error('agents must be an array');
    }

    return true;
  }

  /**
   * Register a new package
   */
  async register(pkg) {
    this.validatePackage(pkg);

    // Save package to disk
    const packagePath = this.getSafePath(pkg.package_id);
    await fs.writeFile(packagePath, JSON.stringify(pkg, null, 2));

    // Add to registry
    this.packages.set(pkg.package_id, pkg);

    console.log(`✅ Registered package: ${pkg.package_id}`);
    return pkg;
  }

  /**
   * Execute a package
   */
  async execute(packageId, context = {}) {
    const pkg = this.packages.get(packageId);

    if (!pkg) {
      throw new Error(`Package not found: ${packageId}`);
    }

    console.log(`🚀 Executing package: ${packageId}`);

    // Check if all required agents are available
    const missingAgents = await this.checkAgentAvailability(pkg.agents);
    if (missingAgents.length > 0) {
      throw new Error(`Missing agents: ${missingAgents.join(', ')}`);
    }

    // Convert package to workflow
    const workflow = this.packageToWorkflow(pkg, context);

    // Execute workflow
    const result = await this.workflowEngine.execute(workflow, context);

    return {
      package_id: packageId,
      version: pkg.version,
      workflow_result: result
    };
  }

  /**
   * Convert package to workflow
   */
  packageToWorkflow(pkg, context) {
    // If package has explicit workflow, use it
    if (pkg.workflow) {
      return {
        id: `${pkg.package_id}-${Date.now()}`,
        name: pkg.name || pkg.package_id,
        steps: pkg.workflow
      };
    }

    // Otherwise, create a simple sequential workflow
    const steps = pkg.agents.map((agentId, index) => ({
      name: `step_${index}`,
      agent: agentId,
      action: pkg.default_action || 'execute',
      input: context,
      depends_on: index > 0 ? [`step_${index - 1}`] : []
    }));

    return {
      id: `${pkg.package_id}-${Date.now()}`,
      name: pkg.name || pkg.package_id,
      steps
    };
  }

  /**
   * Check if all agents in package are available
   */
  async checkAgentAvailability(agentIds) {
    const missing = [];

    for (const agentId of agentIds) {
      const agent = this.registry.get(agentId);
      if (!agent) {
        missing.push(agentId);
      }
    }

    return missing;
  }

  /**
   * Get package dependencies
   */
  getDependencies(packageId) {
    const pkg = this.packages.get(packageId);

    if (!pkg) {
      throw new Error(`Package not found: ${packageId}`);
    }

    const deps = new Set();

    // Add direct agent dependencies
    for (const agentId of pkg.agents) {
      deps.add(agentId);

      const agent = this.registry.get(agentId);
      if (agent && agent.dependencies) {
        for (const dep of agent.dependencies) {
          deps.add(dep);
        }
      }
    }

    // Add package dependencies
    if (pkg.dependencies) {
      for (const depPkg of pkg.dependencies) {
        deps.add(depPkg);

        // Recursively get dependencies
        try {
          const subDeps = this.getDependencies(depPkg);
          for (const subDep of subDeps) {
            deps.add(subDep);
          }
        } catch (error) {
          console.warn(`⚠️  Could not resolve dependency: ${depPkg}`);
        }
      }
    }

    return Array.from(deps);
  }

  /**
   * Resolve package execution order based on dependencies
   */
  resolveExecutionOrder(packageIds) {
    const order = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (packageId) => {
      if (visited.has(packageId)) {
        return;
      }

      if (visiting.has(packageId)) {
        throw new Error(`Circular dependency detected: ${packageId}`);
      }

      visiting.add(packageId);

      const pkg = this.packages.get(packageId);
      if (pkg && pkg.dependencies) {
        for (const dep of pkg.dependencies) {
          visit(dep);
        }
      }

      visiting.delete(packageId);
      visited.add(packageId);
      order.push(packageId);
    };

    for (const packageId of packageIds) {
      visit(packageId);
    }

    return order;
  }

  /**
   * Get package info
   */
  get(packageId) {
    return this.packages.get(packageId);
  }

  /**
   * List all packages
   */
  list() {
    return Array.from(this.packages.values());
  }

  /**
   * Find packages by capability
   */
  findByCapability(capability) {
    const matches = [];

    for (const pkg of this.packages.values()) {
      if (pkg.capabilities && pkg.capabilities.includes(capability)) {
        matches.push(pkg);
      }
    }

    return matches;
  }

  /**
   * Unregister a package
   */
  async unregister(packageId) {
    const pkg = this.packages.get(packageId);

    if (!pkg) {
      throw new Error(`Package not found: ${packageId}`);
    }

    // Remove from registry
    this.packages.delete(packageId);

    // Remove package file
    const packagePath = this.getSafePath(packageId);
    try {
      await fs.unlink(packagePath);
    } catch (error) {
      console.warn(`⚠️  Could not delete package file: ${packagePath}`);
    }

    console.log(`🗑️  Unregistered package: ${packageId}`);
    return true;
  }

  /**
   * Get package stats
   */
  getStats() {
    const stats = {
      total: this.packages.size,
      by_capability: {},
      total_agents: 0
    };

    for (const pkg of this.packages.values()) {
      stats.total_agents += pkg.agents.length;

      if (pkg.capabilities) {
        for (const cap of pkg.capabilities) {
          stats.by_capability[cap] = (stats.by_capability[cap] || 0) + 1;
        }
      }
    }

    return stats;
  }
}

module.exports = PackageManager;
