import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import * as process from 'process';

dotenv.config();

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async runAiWithMcpTool(): Promise<string> {
    const client = new MultiServerMCPClient({
      math: {
        transport: "sse",
        url: process.env.MCP_ENDPOINT,
        headers: {
          "x-api-key": process.env.X_API_KEY,
        },
      },
    });

    try {
      const tools = await client.getTools();
      console.log(`Found ${tools.length} tools`);
      
      const model = new ChatOpenAI({ 
        modelName: process.env.DEFAULT_MODEL || "gpt-4o-mini" 
      });
      console.log("Model loaded");
      
      const prompt = process.env.AI_PROMPT;
      console.log("Prompt loaded");
      
      const agent = createReactAgent({ llm: model, tools });
      console.log("Agent created");
      
      const response = await agent.invoke({
        messages: [{ role: "user", content: prompt }],
      });
      
      const lastMessage = response.messages[response.messages.length - 1];
      if (!lastMessage) {
        return "No response";
      }

      // Handle different types of message content
      const content = lastMessage.content;
      if (typeof content === 'string') {
        return content;
      } else if (Array.isArray(content)) {
        return content
          .filter(item => item.type === 'text')
          .map(item => 'text' in item ? item.text : '')
          .join('\n') || "No text content";
      }
      return "No response";
    } catch (error) {
      console.error('Error running AI with MCP tool:', error);
      return `Error: ${error.message}`;
    } finally {
      // Ensure the client connection is closed to allow the process to terminate
      await client.close();
    }
  }
}
