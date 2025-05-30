# tsk MCP Server

A Model Context Protocol (MCP) server that provides feature and syntax reference for the "tsk" task runner CLI and TOML-based task definitions.

## Features

- **Official Documentation Access**: Direct access to the official tsk documentation from the website
- **Search Capability**: Search through documentation content for specific topics
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

#### `tsk_get_site_docs`

Access official tsk documentation from the website with search capability.

```javascript
// Example usage - get all documentation
{}

// Example usage - filter by title
{
  "title": "Installation"
}

// Example usage - search for specific content
{
  "search": "init"
}

// Example usage - filter and search
{
  "title": "Usage",
  "search": "tasks.toml"
}
```

## Development

### Commands

See `packages.json` or with `notnmeyer/tsk`, `tsk --list`.

### Testing

The project uses Jest for testing. Run tests with:

```bash
npm test
tsk test
```

### Updating Documentation

The server fetches documentation from the official tsk website on startup. The documentation URLs are defined in `src/data/reference.ts`.

## License

MIT
