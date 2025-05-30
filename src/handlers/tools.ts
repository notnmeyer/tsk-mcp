import {
  Tool,
  CallToolRequest,
  CallToolResult,
  TextContent,
} from "@modelcontextprotocol/sdk/types.js";
import { tskReference } from "../data/reference.js";

export const tools: Tool[] = [
  {
    name: "tsk_get_site_docs",
    description: "Get tsk documentation from the official site",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            'Optional title filter to get specific documentation (e.g., "Installation Guide", "Usage Documentation")',
        },
        search: {
          type: "string",
          description:
            "Optional search term to find in the documentation content",
        },
      },
    },
  },
];

export async function handleToolCall(
  request: CallToolRequest,
): Promise<CallToolResult> {
  try {
    switch (request.params.name) {
      case "tsk_get_site_docs":
        return await handleGetSiteDocs(
          request.params.arguments as unknown as {
            title?: string;
            search?: string;
          },
        );

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

async function handleGetSiteDocs(args?: {
  title?: string;
  search?: string;
}): Promise<CallToolResult> {
  const { title, search } = args || {};

  let docs = tskReference.siteDocs;

  // Filter by title if provided
  if (title && typeof title === "string") {
    docs = docs.filter((doc) =>
      doc.title?.toLowerCase().includes(title.toLowerCase()),
    );
  }

  // If no docs match the title filter
  if (docs.length === 0) {
    const availableTitles = tskReference.siteDocs
      .map((d) => d.title)
      .join(", ");
    return {
      content: [
        {
          type: "text",
          text: `No documentation found matching title "${title}". Available: ${availableTitles}`,
        },
      ],
    };
  }

  // Build response content
  let content = "";

  for (const doc of docs) {
    let docContent = `# ${doc.title}\n\nURL: ${doc.url}\n\n`;

    if (doc.content) {
      // If we have fetched content
      let displayContent = doc.content;

      // Apply search filter if provided
      if (search && typeof search === "string") {
        const searchLower = search.toLowerCase();
        const lines = displayContent.split("\n");
        const matchingLines: string[] = [];

        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(searchLower)) {
            // Include some context
            const start = Math.max(0, index - 2);
            const end = Math.min(lines.length, index + 3);
            const contextLines = lines.slice(start, end);
            matchingLines.push(
              `...line ${start + 1}-${end}:\n${contextLines.join("\n")}\n...`,
            );
          }
        });

        if (matchingLines.length > 0) {
          docContent += `**Search results for "${search}":**\n\n${matchingLines.join("\n\n")}`;
        } else {
          docContent += `No matches found for search term "${search}" in this document.`;
        }
      } else {
        // Show full content or truncated if too long
        if (displayContent.length > 2000) {
          docContent += `${displayContent.substring(0, 2000)}\n\n[Content truncated - ${displayContent.length} total characters]`;
        } else {
          docContent += displayContent;
        }
      }

      if (doc.lastFetched) {
        docContent += `\n\n*Last fetched: ${doc.lastFetched.toISOString()}*`;
      }
    } else {
      docContent +=
        "*Content not yet fetched. The documentation should be loaded when the server starts.*";
    }

    content += docContent + "\n\n---\n\n";
  }

  // Remove trailing separator
  content = content.replace(/\n\n---\n\n$/, "");

  return {
    content: [
      {
        type: "text",
        text: content,
      },
    ],
  };
}
