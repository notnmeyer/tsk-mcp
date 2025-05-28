#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { tools, handleToolCall } from './dist/handlers/tools.js';

// Demo function to test all MCP server capabilities
async function demo() {
  console.log('🚀 tsk MCP Server Demo\n');

  // Test 1: List all commands
  console.log('1. Listing all tsk commands:');
  const listResult = await handleToolCall({
    method: 'tools/call',
    params: {
      name: 'tsk_list_commands',
      arguments: {}
    }
  });
  console.log(listResult.content[0].text);
  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Look up specific command
  console.log('2. Looking up "run" command:');
  const runResult = await handleToolCall({
    method: 'tools/call',
    params: {
      name: 'tsk_lookup_command',
      arguments: { command: 'run' }
    }
  });
  console.log(runResult.content[0].text);
  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Look up syntax
  console.log('3. Looking up "tasks" syntax:');
  const syntaxResult = await handleToolCall({
    method: 'tools/call',
    params: {
      name: 'tsk_lookup_syntax',
      arguments: { key: 'tasks' }
    }
  });
  console.log(syntaxResult.content[0].text);
  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Get completions
  console.log('4. Getting completions for task context:');
  const completionResult = await handleToolCall({
    method: 'tools/call',
    params: {
      name: 'tsk_get_completion',
      arguments: { 
        context: '[tasks.build]',
        line_prefix: ''
      }
    }
  });
  const completions = JSON.parse(completionResult.content[0].text);
  console.log('Available completions:');
  completions.suggestions.forEach(suggestion => {
    console.log(`  - ${suggestion.label}: ${suggestion.description}`);
  });
  console.log('\n' + '='.repeat(50) + '\n');

  // Test 5: Get example
  console.log('5. Getting basic example:');
  const exampleResult = await handleToolCall({
    method: 'tools/call',
    params: {
      name: 'tsk_get_examples',
      arguments: { type: 'basic' }
    }
  });
  console.log(exampleResult.content[0].text);

  console.log('\n✅ Demo completed successfully!');
}

// Run demo if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demo().catch(console.error);
}

export { demo };