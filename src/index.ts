#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { tools, handleToolCall } from "./handlers/tools.js";
import { updateReferenceWithSiteContent } from "./data/reference.js";

class TskMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "tsk-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: tools,
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return await handleToolCall(request);
    });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    // Fetch all site documentation content at startup
    console.error("Fetching site documentation...");
    try {
      await updateReferenceWithSiteContent();
      console.error("Site documentation fetched successfully");
    } catch (error) {
      console.error("Warning: Failed to fetch site documentation:", error);
      // Continue running even if fetch fails
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Tsk MCP server running on stdio");
  }
}

async function main(): Promise<void> {
  const server = new TskMcpServer();
  await server.run();
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
