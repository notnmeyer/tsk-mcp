#!/usr/bin/env node

import { handleToolCall } from "./dist/handlers/tools.js";

// Demo function to test MCP server capabilities
async function demo() {
  console.log("🚀 tsk MCP Server Demo\n");

  // Test 1: Get Core Concepts documentation
  console.log("1. Getting Core Concepts documentation:");
  const coreConceptsResult = await handleToolCall({
    method: "tools/call",
    params: {
      name: "tsk_get_site_docs",
      arguments: { title: "Core Concepts" },
    },
  });
  console.log(coreConceptsResult.content[0].text);
  console.log("\n" + "=".repeat(50) + "\n");

  // Test 2: Get Installation Guide
  console.log("2. Getting Installation Guide:");
  const installationResult = await handleToolCall({
    method: "tools/call",
    params: {
      name: "tsk_get_site_docs",
      arguments: { title: "Installation Guide" },
    },
  });
  console.log(installationResult.content[0].text);
  console.log("\n" + "=".repeat(50) + "\n");

  // Test 3: Get Usage Documentation
  console.log("3. Getting Usage Documentation:");
  const usageResult = await handleToolCall({
    method: "tools/call",
    params: {
      name: "tsk_get_site_docs",
      arguments: { title: "Usage Documentation" },
    },
  });
  console.log(usageResult.content[0].text);
  console.log("\n" + "=".repeat(50) + "\n");

  // Test 4: Search in documentation
  console.log("4. Searching for 'install' in documentation:");
  const searchResult = await handleToolCall({
    method: "tools/call",
    params: {
      name: "tsk_get_site_docs",
      arguments: { search: "install" },
    },
  });
  console.log(searchResult.content[0].text);
  console.log("\n" + "=".repeat(50) + "\n");

  // Test 5: Get all documentation
  console.log("5. Getting all documentation:");
  const allDocsResult = await handleToolCall({
    method: "tools/call",
    params: {
      name: "tsk_get_site_docs",
      arguments: {},
    },
  });
  console.log(allDocsResult.content[0].text);

  console.log("\n✅ Demo completed successfully!");
}

// Run demo if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demo().catch(console.error);
}

export { demo };
