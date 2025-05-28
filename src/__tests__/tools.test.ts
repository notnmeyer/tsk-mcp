import { handleToolCall } from '../handlers/tools';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';

describe('MCP Tool Handlers', () => {
  describe('tsk_lookup_command', () => {
    it('should return documentation for a valid command', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'tsk_lookup_command',
          arguments: { command: 'run' }
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
      expect((result.content[0] as any).text).toContain('tsk run');
      expect((result.content[0] as any).text).toContain('Run a specific task');
    });

    it('should return error for invalid command', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'tsk_lookup_command',
          arguments: { command: 'invalid' }
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      expect((result.content[0] as any).text).toContain('Command "invalid" not found');
    });
  });

  describe('tsk_lookup_syntax', () => {
    it('should return syntax documentation for a valid key', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'tsk_lookup_syntax',
          arguments: { key: 'tasks' }
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
      expect((result.content[0] as any).text).toContain('tasks');
      expect((result.content[0] as any).text).toContain('Table containing all task definitions');
    });

    it('should return error for invalid key', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'tsk_lookup_syntax',
          arguments: { key: 'nonexistent' }
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      expect((result.content[0] as any).text).toContain('No syntax documentation found');
    });
  });

  describe('tsk_list_commands', () => {
    it('should return list of all available commands', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'tsk_list_commands',
          arguments: {}
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
      expect((result.content[0] as any).text).toContain('Available tsk Commands');
      expect((result.content[0] as any).text).toContain('run');
      expect((result.content[0] as any).text).toContain('list');
      expect((result.content[0] as any).text).toContain('init');
    });
  });

  describe('tsk_get_completion', () => {
    it('should return completions for task context', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'tsk_get_completion',
          arguments: { 
            context: '[tasks.build]',
            line_prefix: ''
          }
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
      
      const completionResult = JSON.parse((result.content[0] as any).text);
      expect(completionResult.suggestions).toBeDefined();
      expect(completionResult.suggestions.length).toBeGreaterThan(0);
      expect(completionResult.suggestions.some((s: any) => s.label === 'desc')).toBe(true);
    });

    it('should return root-level completions', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'tsk_get_completion',
          arguments: { 
            context: '',
            line_prefix: ''
          }
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      
      const completionResult = JSON.parse((result.content[0] as any).text);
      expect(completionResult.suggestions).toBeDefined();
      expect(completionResult.suggestions.some((s: any) => s.label === 'tasks')).toBe(true);
      expect(completionResult.suggestions.some((s: any) => s.label === 'env')).toBe(true);
    });
  });

  describe('tsk_get_examples', () => {
    it('should return all examples by default', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'tsk_get_examples',
          arguments: {}
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
      expect((result.content[0] as any).text).toContain('Basic Task File');
      expect((result.content[0] as any).text).toContain('Advanced Configuration');
    });

    it('should return specific example type', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'tsk_get_examples',
          arguments: { type: 'basic' }
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      expect((result.content[0] as any).text).toContain('Basic Task File');
      expect((result.content[0] as any).text).not.toContain('Advanced Configuration');
    });
  });

  describe('error handling', () => {
    it('should handle unknown tool names', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'unknown_tool',
          arguments: {}
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      expect((result.content[0] as any).text).toContain('Unknown tool');
    });

    it('should handle missing arguments for command lookup', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'tsk_lookup_command',
          arguments: {}
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      expect((result.content[0] as any).text).toContain('command parameter is required');
    });

    it('should handle invalid argument types', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'tsk_lookup_command',
          arguments: { command: 123 }
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      expect((result.content[0] as any).text).toContain('must be a string');
    });

    it('should handle null arguments object', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'tsk_lookup_syntax',
          arguments: null as any
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      expect((result.content[0] as any).text).toContain('arguments object is required');
    });

    it('should handle invalid type parameter in examples', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'tsk_get_examples',
          arguments: { type: 123 }
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      expect((result.content[0] as any).text).toContain('type parameter must be a string');
    });
  });

  describe('advanced completion scenarios', () => {
    it('should provide task-specific completions for tasks section', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'tsk_get_completion',
          arguments: { 
            context: '[tasks]',
            line_prefix: ''
          }
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      
      const completionResult = JSON.parse((result.content[0] as any).text);
      expect(completionResult.suggestions).toBeDefined();
      expect(completionResult.suggestions.some((s: any) => s.type === 'task')).toBe(true);
    });

    it('should handle line prefix context', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'tsk_get_completion',
          arguments: { 
            context: '[tasks]',
            line_prefix: '[tasks.'
          }
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      
      const completionResult = JSON.parse((result.content[0] as any).text);
      expect(completionResult.suggestions).toBeDefined();
      expect(completionResult.suggestions.some((s: any) => s.type === 'task')).toBe(true);
    });
  });

  describe('syntax lookup variations', () => {
    it('should find partial key matches', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'tsk_lookup_syntax',
          arguments: { key: 'env' }
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      expect((result.content[0] as any).text).toContain('env');
    });

    it('should handle nested key lookup', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'tsk_lookup_syntax',
          arguments: { key: 'dependencies' }
        }
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      expect((result.content[0] as any).text).toContain('dependencies');
    });
  });
});