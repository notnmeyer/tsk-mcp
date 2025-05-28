// Core tsk types
export interface TskTask {
  name: string;
  description?: string;
  dependencies?: string[];
  script?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  workdir?: string;
  timeout?: number;
  parallel?: boolean;
}

export interface TskConfig {
  version?: string;
  default_task?: string;
  env?: Record<string, string>;
  tasks: Record<string, TskTask>;
}

// tsk CLI command types
export interface TskCommand {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  options: TskCommandOption[];
}

export interface TskCommandOption {
  name: string;
  shorthand?: string;
  description: string;
  type: 'string' | 'boolean' | 'number';
  required?: boolean;
  default?: string | boolean | number;
  validValues?: string[];
}

// TOML syntax and completion types
export interface TomlSyntaxElement {
  key: string;
  type: 'string' | 'array' | 'table' | 'boolean' | 'number';
  description: string;
  required?: boolean;
  examples: string[];
  validValues?: string[];
}

export interface CompletionSuggestion {
  label: string;
  insertText: string;
  description: string;
  type: 'property' | 'value' | 'task' | 'command';
}

// MCP tool arguments interfaces
export interface CommandLookupArgs {
  command: string;
}

export interface SyntaxLookupArgs {
  key: string;
}

export interface CompletionArgs {
  context: string;
  line_prefix?: string;
}

export interface ExamplesArgs {
  type?: 'basic' | 'advanced' | 'multi-language' | 'all';
}

// MCP tool response types
export interface DocumentationResult {
  title: string;
  content: string;
  examples?: string[];
  relatedTopics?: string[];
}

export interface CompletionResult {
  suggestions: CompletionSuggestion[];
  context: string;
}

// Reference data structure
export interface TskReference {
  commands: TskCommand[];
  syntax: TomlSyntaxElement[];
  examples: {
    name: string;
    description: string;
    content: string;
  }[];
}