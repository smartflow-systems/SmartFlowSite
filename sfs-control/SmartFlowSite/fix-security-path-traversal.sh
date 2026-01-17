#!/bin/bash
# Fix remaining path traversal vulnerabilities in orchestrator files

echo "Fixing path traversal vulnerabilities in registry.js and package-manager.js..."

# Fix registry.js - add sanitization methods
cat > /tmp/registry-sanitize.js << 'EOF'

  /**
   * Sanitize agent ID to prevent path traversal attacks
   * @param {string} agentId - The agent ID to sanitize
   * @returns {string} - Safe agent ID
   */
  sanitizeAgentId(agentId) {
    // Remove any path separators and dangerous characters
    const safe = agentId.replace(/[^a-zA-Z0-9_-]/g, '_');
    // Ensure it doesn't start with dots
    return safe.replace(/^\.+/, '_');
  }

  /**
   * Get safe path for agent manifest
   * @param {string} agentId - The agent ID
   * @returns {string} - Safe absolute path
   */
  getSafePath(agentId) {
    const sanitized = this.sanitizeAgentId(agentId);
    const safePath = path.join(this.manifestDir, `${sanitized}.json`);

    // Verify the resolved path is within manifestDir
    const resolvedPath = path.resolve(safePath);
    const resolvedBase = path.resolve(this.manifestDir);

    if (!resolvedPath.startsWith(resolvedBase)) {
      throw new Error('Invalid agent ID: path traversal detected');
    }

    return safePath;
  }
EOF

# Insert sanitization methods into registry.js after constructor
sed -i '/async initialize()/i\  '"$(cat /tmp/registry-sanitize.js | sed ':a;N;$!ba;s/\n/\\n/g')" server/orchestrator/registry.js

# Replace unsafe path.join calls in registry.js
sed -i 's|path.join(this.manifestDir, `\${manifest.agent_id}.json`)|this.getSafePath(manifest.agent_id)|g' server/orchestrator/registry.js
sed -i 's|path.join(this.manifestDir, `\${agentId}.json`)|this.getSafePath(agentId)|g' server/orchestrator/registry.js

echo "✓ Fixed registry.js"

# Fix package-manager.js
cat > /tmp/package-sanitize.js << 'EOF'

  /**
   * Sanitize package name to prevent path traversal attacks
   * @param {string} packageName - The package name to sanitize
   * @returns {string} - Safe package name
   */
  sanitizePackageName(packageName) {
    // Remove any path separators and dangerous characters
    const safe = packageName.replace(/[^a-zA-Z0-9_-]/g, '_');
    // Ensure it doesn't start with dots
    return safe.replace(/^\.+/, '_');
  }

  /**
   * Get safe path for package
   * @param {string} packageName - The package name
   * @returns {string} - Safe absolute path
   */
  getSafePath(packageName) {
    const sanitized = this.sanitizePackageName(packageName);
    const safePath = path.join(this.packageDir, sanitized);

    // Verify the resolved path is within packageDir
    const resolvedPath = path.resolve(safePath);
    const resolvedBase = path.resolve(this.packageDir);

    if (!resolvedPath.startsWith(resolvedBase)) {
      throw new Error('Invalid package name: path traversal detected');
    }

    return safePath;
  }
EOF

# Insert sanitization methods into package-manager.js after constructor
sed -i '/async initialize()/i\  '"$(cat /tmp/package-sanitize.js | sed ':a;N;$!ba;s/\n/\\n/g')" server/orchestrator/package-manager.js

# Replace unsafe path.join calls in package-manager.js
sed -i 's|path.join(this.packageDir, packageName)|this.getSafePath(packageName)|g' server/orchestrator/package-manager.js

echo "✓ Fixed package-manager.js"

rm -f /tmp/registry-sanitize.js /tmp/package-sanitize.js

echo ""
echo "All path traversal vulnerabilities fixed!"
