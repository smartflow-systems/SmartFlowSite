const BaseConnector = require('./base');
const fs = require('fs').promises;
const path = require('path');

/**
 * ChatGPT Connector - Integrates with ChatGPT via OpenAI API
 */
class ChatGPTConnector extends BaseConnector {
  constructor(config = {}) {
    super('chatgpt', config);
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.defaultModel = config.model || 'gpt-4o';
  }

  /**
   * Initialize ChatGPT connector
   */
  async initialize() {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not found');
    }

    await super.initialize();
  }

  /**
   * Invoke ChatGPT agent
   */
  async invoke(agentId, task) {
    const { action, input, context } = task;

    console.log(`🤖 Invoking ChatGPT agent: ${agentId}`);

    try {
      // Build messages
      const messages = await this.buildMessages(agentId, task);

      // Make API request
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: task.model || this.defaultModel,
          messages: messages,
          temperature: task.temperature || 0.7,
          max_tokens: task.max_tokens || 2048
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        output: data.choices[0].message.content,
        usage: data.usage,
        model: data.model,
        finish_reason: data.choices[0].finish_reason
      };
    } catch (error) {
      console.error('❌ ChatGPT invocation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build messages for ChatGPT
   */
  async buildMessages(agentId, task) {
    const { action, input, context, system_prompt } = task;

    const messages = [];

    // System message
    const systemMessage = system_prompt || this.buildSystemPrompt(agentId, task);
    messages.push({
      role: 'system',
      content: systemMessage
    });

    // User message
    let userMessage = `Action: ${action}\n\n`;

    if (input) {
      userMessage += `Input:\n${JSON.stringify(input, null, 2)}\n\n`;
    }

    if (context) {
      userMessage += `Context:\n${JSON.stringify(context, null, 2)}\n\n`;
    }

    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
  }

  /**
   * Build system prompt for agent
   */
  buildSystemPrompt(agentId, task) {
    let prompt = `You are ${agentId}, a specialized AI agent in the SmartFlow Systems ecosystem.\n\n`;
    prompt += `Your role is to execute tasks with precision and return structured, actionable outputs.\n\n`;
    prompt += `Brand Guidelines:\n`;
    prompt += `- Colors: Black (#0D0D0D), Brown (#3B2F2F), Gold (#FFD700)\n`;
    prompt += `- Style: Professional, modern, efficient\n`;
    prompt += `- Tone: Clear, concise, helpful\n\n`;
    prompt += `Always return outputs in a structured format (JSON when applicable).`;

    return prompt;
  }

  /**
   * Invoke with custom GPT
   */
  async invokeCustomGPT(gptId, task) {
    // For custom GPTs, we use the Assistants API
    try {
      // Create a thread
      const threadResponse = await fetch(`${this.baseUrl}/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({})
      });

      const thread = await threadResponse.json();

      // Add message to thread
      const messageResponse = await fetch(`${this.baseUrl}/threads/${thread.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          role: 'user',
          content: JSON.stringify(task)
        })
      });

      // Run the assistant
      const runResponse = await fetch(`${this.baseUrl}/threads/${thread.id}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          assistant_id: gptId
        })
      });

      const run = await runResponse.json();

      // Poll for completion
      const result = await this.pollRunCompletion(thread.id, run.id);

      return {
        success: true,
        output: result,
        thread_id: thread.id
      };
    } catch (error) {
      console.error('❌ Custom GPT invocation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Poll for run completion
   */
  async pollRunCompletion(threadId, runId, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch(`${this.baseUrl}/threads/${threadId}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      const run = await response.json();

      if (run.status === 'completed') {
        // Get messages
        const messagesResponse = await fetch(`${this.baseUrl}/threads/${threadId}/messages`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });

        const messages = await messagesResponse.json();
        return messages.data[0].content[0].text.value;
      } else if (run.status === 'failed' || run.status === 'cancelled') {
        throw new Error(`Run ${run.status}: ${run.last_error?.message || 'Unknown error'}`);
      }
    }

    throw new Error('Run timeout');
  }

  /**
   * Upload context files to ChatGPT
   */
  async uploadContextFiles(files) {
    const uploadedFiles = [];

    for (const file of files) {
      try {
        const fileContent = await fs.readFile(file, 'utf8');
        const formData = new FormData();
        formData.append('file', new Blob([fileContent]), path.basename(file));
        formData.append('purpose', 'assistants');

        const response = await fetch(`${this.baseUrl}/files`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: formData
        });

        const data = await response.json();
        uploadedFiles.push(data);

        console.log(`📤 Uploaded: ${file} (ID: ${data.id})`);
      } catch (error) {
        console.warn(`⚠️  Failed to upload ${file}:`, error.message);
      }
    }

    return uploadedFiles;
  }

  /**
   * Test ChatGPT connection
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
        model: this.defaultModel
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

module.exports = ChatGPTConnector;
