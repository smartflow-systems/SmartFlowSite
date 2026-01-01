const BaseConnector = require('./base');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

/**
 * Claude Connector - Integrates with Claude via API or CLI
 */
class ClaudeConnector extends BaseConnector {
  constructor(config = {}) {
    super('claude', config);
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    this.useApi = config.useApi !== false; // Default to API if available
  }

  /**
   * Initialize Claude connector
   */
  async initialize() {
    // Check if API key is available
    if (!this.apiKey && this.useApi) {
      console.warn('⚠️  No Claude API key found, will use CLI mode');
      this.useApi = false;
    }

    await super.initialize();
  }

  /**
   * Invoke Claude agent
   */
  async invoke(agentId, task) {
    // task object contains action, input, context - available if needed

    console.log(`🤖 Invoking Claude agent: ${agentId}`);

    if (this.useApi) {
      return await this.invokeViaApi(agentId, task);
    } else {
      return await this.invokeViaCli(agentId, task);
    }
  }

  /**
   * Invoke via Claude API
   */
  async invokeViaApi(agentId, task) {
    try {
      // Prepare the prompt
      const prompt = this.buildPrompt(agentId, task);

      // Make API request
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        output: data.content[0].text,
        usage: data.usage,
        model: data.model
      };
    } catch (error) {
      console.error('❌ Claude API invocation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Invoke via Claude CLI (for local Claude Code)
   */
  async invokeViaCli(agentId, task) {
    try {
      // Create a temporary task file
      const taskFile = path.join('/tmp', `claude-task-${Date.now()}.json`);
      await fs.writeFile(taskFile, JSON.stringify(task, null, 2));

      // Execute Claude CLI command
      const { stdout, stderr } = await execAsync(
        `claude --task-file ${taskFile}`,
        { timeout: 60000 }
      );

      // Clean up task file
      await fs.unlink(taskFile).catch(() => {});

      return {
        success: true,
        output: stdout,
        stderr: stderr || null
      };
    } catch (error) {
      console.error('❌ Claude CLI invocation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build prompt for Claude
   */
  buildPrompt(agentId, task) {
    const { action, input, context } = task;

    let prompt = `You are agent: ${agentId}\n\n`;
    prompt += `Action: ${action}\n\n`;

    if (input) {
      prompt += `Input:\n${JSON.stringify(input, null, 2)}\n\n`;
    }

    if (context) {
      prompt += `Context:\n${JSON.stringify(context, null, 2)}\n\n`;
    }

    prompt += `Please execute this task and return structured output.`;

    return prompt;
  }

  /**
   * Sync files to Claude project
   */
  async syncFiles(files, projectPath) {
    try {
      for (const file of files) {
        const sourcePath = file.source || file;
        const destPath = path.join(projectPath, file.destination || path.basename(file));

        await fs.copyFile(sourcePath, destPath);
        console.log(`📄 Synced: ${sourcePath} -> ${destPath}`);
      }

      return { success: true, synced: files.length };
    } catch (error) {
      console.error('❌ File sync failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Read agent context files
   */
  async loadContextFiles(contextFiles) {
    const context = {};

    for (const file of contextFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        context[path.basename(file)] = content;
      } catch (error) {
        console.warn(`⚠️  Could not load context file: ${file}`);
      }
    }

    return context;
  }

  /**
   * Test Claude connection
   */
  async test() {
    try {
      const result = await this.invoke('test-agent', {
        action: 'ping',
        input: { message: 'Hello from SFS Orchestrator' }
      });

      return {
        success: result.success,
        platform: this.platform,
        mode: this.useApi ? 'api' : 'cli'
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: error.message
      };
    }
  }
}

module.exports = ClaudeConnector;
