# tsk MCP Server

A Model Context Protocol (MCP) server that provides feature and syntax reference for the "tsk" task runner CLI and TOML-based task definitions.

## Features

- **Command Documentation**: Look up detailed documentation for all tsk CLI commands
- **TOML Syntax Reference**: Get syntax help for tsk.toml task definition files
- **Code Completion**: Intelligent completion suggestions for TOML task files
- **Examples**: Access to comprehensive example configurations
- **Real-time Help**: Integration with MCP-compatible editors and AI assistants

## Installation

```bash
npm install
npm run build
```

## Usage

### As an MCP Server

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "tsk": {
      "command": "node",
      "args": ["/path/to/tsk-mcp/dist/index.js"]
    }
  }
}
```

### Available Tools

#### `tsk_lookup_command`
Get detailed documentation for a specific tsk command.

```javascript
// Example usage
{
  "command": "run"
}
```

#### `tsk_lookup_syntax`
Look up TOML syntax documentation for task definitions.

```javascript
// Example usage
{
  "key": "tasks.dependencies"
}
```

#### `tsk_get_completion`
Get intelligent completion suggestions for TOML files.

```javascript
// Example usage
{
  "context": "[tasks.build]",
  "line_prefix": ""
}
```

#### `tsk_list_commands`
List all available tsk commands with descriptions.

```javascript
// No parameters required
{}
```

#### `tsk_get_examples`
Get example tsk.toml configurations.

```javascript
// Example usage
{
  "type": "basic" // Options: "basic", "advanced", "multi-language", "all"
}
```

## Development

### Project Structure

```
src/
├── index.ts          # Main MCP server entry point
├── handlers/         # MCP tool handlers
│   └── tools.ts      # Tool implementations
├── data/             # Reference data
│   └── reference.ts  # tsk commands and syntax data
├── types/            # TypeScript type definitions
│   └── index.ts      # Core types
└── __tests__/        # Test files
    └── tools.test.ts # Tool handler tests
```

### Commands

```bash
# Build the project
npm run build

# Run in development mode (watch)
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Clean build artifacts
npm run clean
```

### Testing

The project uses Jest for testing. Run tests with:

```bash
npm test
```

### Adding New Commands

1. Add command definition to `src/data/reference.ts`
2. Update types in `src/types/index.ts` if needed
3. Add tests in `src/__tests__/tools.test.ts`

### Adding New Syntax Elements

1. Add syntax element to `src/data/reference.ts`
2. Update completion logic in `src/handlers/tools.ts` if needed
3. Add corresponding tests

## Example tsk.toml Reference

The server includes comprehensive examples for different use cases:

### Basic Task File
```toml
version = "1.0"
default_task = "build"

[tasks.build]
description = "Build the project"
script = "npm run build"

[tasks.test]
description = "Run tests"
dependencies = ["build"]
script = "npm test"
```

### Advanced Configuration
```toml
version = "1.0"
default_task = "dev"

[env]
NODE_ENV = "development"

[tasks.setup]
description = "Initial project setup"
script = "npm install"
timeout = 300

[tasks.dev]
description = "Start development server"
dependencies = ["setup"]
command = "npm"
args = ["run", "dev"]
env = { PORT = "3000" }
workdir = "./app"
```

## Supported tsk Features

### Commands
- `run` - Execute tasks
- `list` - List available tasks
- `init` - Initialize new task file
- `validate` - Validate task file syntax
- `graph` - Show task dependency graph

### TOML Syntax
- Task definitions with dependencies
- Environment variables (global and task-specific)
- Command execution (script vs command/args)
- Working directory specification
- Timeout configuration
- Parallel execution settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT