import { Tool, CallToolRequest, CallToolResult, TextContent } from '@modelcontextprotocol/sdk/types.js';
import { tskReference } from '../data/reference.js';
import { 
  DocumentationResult, 
  CompletionResult, 
  CompletionSuggestion,
  CommandLookupArgs,
  SyntaxLookupArgs,
  CompletionArgs,
  ExamplesArgs
} from '../types/index.js';

export const tools: Tool[] = [
  {
    name: 'tsk_lookup_command',
    description: 'Look up documentation for a specific tsk command',
    inputSchema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The tsk command to look up (e.g., "run", "list", "init")'
        }
      },
      required: ['command']
    }
  },
  {
    name: 'tsk_lookup_syntax',
    description: 'Look up TOML syntax documentation for tsk task definitions',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'The TOML key to look up (e.g., "tasks", "env", "dependencies")'
        }
      },
      required: ['key']
    }
  },
  {
    name: 'tsk_get_completion',
    description: 'Get TOML completion suggestions for tsk task files',
    inputSchema: {
      type: 'object',
      properties: {
        context: {
          type: 'string',
          description: 'The current line or context where completion is needed'
        },
        line_prefix: {
          type: 'string',
          description: 'Text before the cursor on the current line'
        }
      },
      required: ['context']
    }
  },
  {
    name: 'tsk_list_commands',
    description: 'List all available tsk commands with brief descriptions',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false
    }
  },
  {
    name: 'tsk_get_examples',
    description: 'Get example tsk.toml files with explanations',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Type of example to retrieve',
          enum: ['basic', 'advanced', 'multi-language', 'all']
        }
      }
    }
  }
];

export async function handleToolCall(request: CallToolRequest): Promise<CallToolResult> {
  try {
    switch (request.params.name) {
      case 'tsk_lookup_command':
        return await handleCommandLookup(request.params.arguments as unknown as CommandLookupArgs);
      
      case 'tsk_lookup_syntax':
        return await handleSyntaxLookup(request.params.arguments as unknown as SyntaxLookupArgs);
      
      case 'tsk_get_completion':
        return await handleCompletion(request.params.arguments as unknown as CompletionArgs);
      
      case 'tsk_list_commands':
        return await handleListCommands();
      
      case 'tsk_get_examples':
        return await handleGetExamples(request.params.arguments as unknown as ExamplesArgs);
      
      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ]
    };
  }
}

async function handleCommandLookup(args: CommandLookupArgs): Promise<CallToolResult> {
  if (!args || typeof args !== 'object') {
    return {
      content: [
        {
          type: 'text',
          text: 'Error: arguments object is required'
        }
      ]
    };
  }

  const { command } = args;
  
  if (!command || typeof command !== 'string') {
    return {
      content: [
        {
          type: 'text',
          text: 'Error: command parameter is required and must be a string'
        }
      ]
    };
  }
  
  const cmd = tskReference.commands.find(c => c.name === command);
  if (!cmd) {
    return {
      content: [
        {
          type: 'text',
          text: `Command "${command}" not found. Available commands: ${tskReference.commands.map(c => c.name).join(', ')}`
        }
      ]
    };
  }

  const optionsText = cmd.options.length > 0 
    ? '\n\n**Options:**\n' + cmd.options.map(opt => {
        const shorthand = opt.shorthand ? ` (-${opt.shorthand})` : '';
        const defaultVal = opt.default !== undefined ? ` (default: ${opt.default})` : '';
        return `- \`--${opt.name}${shorthand}\`: ${opt.description}${defaultVal}`;
      }).join('\n')
    : '';

  const examplesText = cmd.examples.length > 0
    ? '\n\n**Examples:**\n' + cmd.examples.map(ex => `\`${ex}\``).join('\n')
    : '';

  const content = `# tsk ${cmd.name}

${cmd.description}

**Usage:** \`${cmd.usage}\`${optionsText}${examplesText}`;

  return {
    content: [
      {
        type: 'text',
        text: content
      }
    ]
  };
}

async function handleSyntaxLookup(args: SyntaxLookupArgs): Promise<CallToolResult> {
  if (!args || typeof args !== 'object') {
    return {
      content: [
        {
          type: 'text',
          text: 'Error: arguments object is required'
        }
      ]
    };
  }

  const { key } = args;
  
  if (!key || typeof key !== 'string') {
    return {
      content: [
        {
          type: 'text',
          text: 'Error: key parameter is required and must be a string'
        }
      ]
    };
  }
  
  const syntaxElements = tskReference.syntax.filter(s => 
    s.key === key || s.key.includes(key) || key.includes(s.key.split('.')[0] || '')
  );

  if (syntaxElements.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: `No syntax documentation found for "${key}". Available keys: ${tskReference.syntax.map(s => s.key).join(', ')}`
        }
      ]
    };
  }

  const content = syntaxElements.map(element => {
    const requiredText = element.required ? ' *(required)*' : ' *(optional)*';
    const examplesText = element.examples.length > 0
      ? '\n\n**Examples:**\n' + element.examples.map(ex => `\`\`\`toml\n${ex}\n\`\`\``).join('\n')
      : '';

    return `## ${element.key}

**Type:** ${element.type}${requiredText}

${element.description}${examplesText}`;
  }).join('\n\n---\n\n');

  return {
    content: [
      {
        type: 'text',
        text: content
      }
    ]
  };
}

async function handleCompletion(args: CompletionArgs): Promise<CallToolResult> {
  if (!args || typeof args !== 'object') {
    return {
      content: [
        {
          type: 'text',
          text: 'Error: arguments object is required'
        }
      ]
    };
  }

  const { context, line_prefix = '' } = args;
  
  if (typeof context !== 'string') {
    return {
      content: [
        {
          type: 'text',
          text: 'Error: context parameter must be a string'
        }
      ]
    };
  }
  
  const suggestions: CompletionSuggestion[] = [];
  
  // Determine context and provide appropriate completions
  if (context.includes('[tasks]') || line_prefix.startsWith('[tasks.')) {
    // Task name completion
    suggestions.push({
      label: 'build',
      insertText: '[tasks.build]\ndesc = "Build the project"\ncmds = ["npm run build"]',
      description: 'Common build task',
      type: 'task'
    });
    
    suggestions.push({
      label: 'test',
      insertText: '[tasks.test]\ndesc = "Run tests"\ncmds = ["npm test"]',
      description: 'Common test task',
      type: 'task'
    });
    
    suggestions.push({
      label: 'clean',
      insertText: '[tasks.clean]\ndesc = "Clean build artifacts"\ncmds = ["rm -rf dist"]',
      description: 'Common clean task',
      type: 'task'
    });
  } else if (context.includes('[tasks.')) {
    // Inside a task definition
    const taskKeys = ['desc', 'description', 'cmds', 'deps', 'env', 'dir', 'dotenv'];
    
    taskKeys.forEach(key => {
      const syntaxElement = tskReference.syntax.find(s => s.key.includes(key));
      if (syntaxElement) {
        suggestions.push({
          label: key,
          insertText: `${key} = `,
          description: syntaxElement.description,
          type: 'property'
        });
      }
    });
  } else {
    // Root level completions
    const rootKeys = ['env', 'dotenv', 'script_dir', 'tasks'];
    
    rootKeys.forEach(key => {
      const syntaxElement = tskReference.syntax.find(s => s.key === key);
      if (syntaxElement) {
        let insertText = `${key} = `;
        if (key === 'tasks') {
          insertText = '[tasks]';
        } else if (key === 'env') {
          insertText = 'env = {}';
        } else if (key === 'dotenv') {
          insertText = 'dotenv = ".env"';
        } else if (key === 'script_dir') {
          insertText = 'script_dir = "scripts"';
        }
        
        suggestions.push({
          label: key,
          insertText,
          description: syntaxElement.description,
          type: 'property'
        });
      }
    });
  }

  const result: CompletionResult = {
    suggestions,
    context: context
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }
    ]
  };
}

async function handleListCommands(): Promise<CallToolResult> {
  const commandsList = tskReference.commands.map(cmd => `- **${cmd.name}**: ${cmd.description}`).join('\n');
  
  const content = `# Available tsk Commands

${commandsList}

Use \`tsk_lookup_command\` with a specific command name to get detailed documentation.`;

  return {
    content: [
      {
        type: 'text',
        text: content
      }
    ]
  };
}

async function handleGetExamples(args?: ExamplesArgs): Promise<CallToolResult> {
  const { type = 'all' } = args || {};
  
  if (type && typeof type !== 'string') {
    return {
      content: [
        {
          type: 'text',
          text: 'Error: type parameter must be a string'
        }
      ]
    };
  }
  
  let examples = tskReference.examples;
  
  if (type !== 'all') {
    const typeMap: Record<string, string> = {
      'basic': 'Basic Task File',
      'advanced': 'Advanced Configuration',
      'multi-language': 'Multi-language Project'
    };
    
    const targetName = typeMap[type];
    if (targetName) {
      examples = examples.filter(ex => ex.name === targetName);
    }
  }

  if (examples.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: `No examples found for type "${type}". Available types: basic, advanced, multi-language, all`
        }
      ]
    };
  }

  const content = examples.map(example => `# ${example.name}

${example.description}

\`\`\`toml
${example.content}
\`\`\``).join('\n\n---\n\n');

  return {
    content: [
      {
        type: 'text',
        text: content
      }
    ]
  };
}