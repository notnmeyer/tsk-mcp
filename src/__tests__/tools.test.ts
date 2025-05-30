import { handleToolCall } from "../handlers/tools";
import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { tskReference } from "../data/reference";
import { SiteDoc } from "../types/index.js";

describe("MCP Tool Handlers", () => {
  describe("tsk_get_site_docs", () => {
    // Store original docs to restore after tests
    let originalDocs: SiteDoc[] = [];

    beforeAll(() => {
      // Save original docs
      originalDocs = JSON.parse(JSON.stringify(tskReference.siteDocs));

      // Replace with test data that we control
      tskReference.siteDocs = [
        {
          url: "https://example.com/doc1",
          title: "Test Doc 1",
          content:
            "This is test document 1 with information about init command.",
          lastFetched: new Date("2023-01-01"),
        },
        {
          url: "https://example.com/doc2",
          title: "Installation Guide",
          content:
            "Installation guide content here. Use brew install or download from releases.",
          lastFetched: new Date("2023-01-01"),
        },
        {
          url: "https://example.com/doc3",
          title: "Usage Documentation",
        },
      ] as SiteDoc[];
    });

    afterAll(() => {
      // Restore original docs
      tskReference.siteDocs = originalDocs as SiteDoc[];
    });

    it("should return all site documentation when no filters provided", async () => {
      const request: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "tsk_get_site_docs",
          arguments: {},
        },
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe("text");
      const text = (result.content[0] as any).text;

      // Test for all doc titles in our test data
      tskReference.siteDocs.forEach((doc) => {
        if (doc.title) {
          expect(text).toContain(doc.title);
        }
      });
    });

    it("should filter documentation by title", async () => {
      const targetTitle = "Installation Guide";
      const request: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "tsk_get_site_docs",
          arguments: { title: "Installation" },
        },
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      const text = (result.content[0] as any).text;

      // Should contain the matched title
      expect(text).toContain(targetTitle);

      // Should contain some content from that doc
      const matchedDoc = tskReference.siteDocs.find(
        (doc) => doc.title === targetTitle,
      );
      expect(text).toContain(matchedDoc?.content);

      // Should not contain other titles
      const otherTitles = tskReference.siteDocs
        .filter((doc) => doc.title !== targetTitle)
        .map((doc) => doc.title);

      otherTitles.forEach((title) => {
        if (title) expect(text).not.toContain(title);
      });
    });

    it("should search for content within documentation", async () => {
      const searchTerm = "init";
      const request: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "tsk_get_site_docs",
          arguments: { search: searchTerm },
        },
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      const text = (result.content[0] as any).text;

      // Should indicate search was performed
      expect(text).toContain(`Search results for "${searchTerm}"`);

      // Should contain docs with the search term
      const docsWithSearchTerm = tskReference.siteDocs.filter(
        (doc) =>
          typeof doc.content === "string" && doc.content.includes(searchTerm),
      );

      expect(docsWithSearchTerm.length).toBeGreaterThan(0);
      docsWithSearchTerm.forEach((doc) => {
        if (doc.title) expect(text).toContain(doc.title);
      });
    });

    it("should filter by title and search content", async () => {
      const titleFilter = "Installation";
      const searchTerm = "brew";

      const request: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "tsk_get_site_docs",
          arguments: {
            title: titleFilter,
            search: searchTerm,
          },
        },
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      const text = (result.content[0] as any).text;

      // Should contain the title that matches
      expect(text).toContain("Installation Guide");

      // Should show search was performed
      expect(text).toContain(`Search results for "${searchTerm}"`);

      // Should have content with the search term
      const matchedDoc = tskReference.siteDocs.find(
        (doc) => doc.title === "Installation Guide",
      );
      expect(matchedDoc?.content).toContain(searchTerm);
      expect(text).toContain(searchTerm);
    });

    it("should return error message when no docs match title filter", async () => {
      const request: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "tsk_get_site_docs",
          arguments: { title: "NonExistent" },
        },
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      const text = (result.content[0] as any).text;
      expect(text).toContain(
        'No documentation found matching title "NonExistent"',
      );
    });

    it("should show message when no search results found", async () => {
      const request: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "tsk_get_site_docs",
          arguments: { search: "xyznonexistent" },
        },
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      const text = (result.content[0] as any).text;
      expect(text).toContain(
        'No matches found for search term "xyznonexistent"',
      );
    });

    it("should handle documentation without content", async () => {
      // Temporarily remove content to test this case
      const originalContent = tskReference.siteDocs[2]?.content;
      if (tskReference.siteDocs[2]) {
        delete tskReference.siteDocs[2].content;
      }

      const request: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "tsk_get_site_docs",
          arguments: { title: "Usage" },
        },
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      const text = (result.content[0] as any).text;
      expect(text).toContain("Content not yet fetched");

      // Restore content
      if (tskReference.siteDocs[2] && originalContent !== undefined) {
        tskReference.siteDocs[2].content = originalContent;
      }
    });

    it("should handle unknown tool name", async () => {
      const request: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "unknown_tool",
          arguments: {},
        },
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      const text = (result.content[0] as any).text;
      expect(text).toContain("Error: Unknown tool: unknown_tool");
    });

    it("should handle invalid argument types gracefully", async () => {
      const request: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "tsk_get_site_docs",
          arguments: {
            title: 123 as any,
            search: true as any,
          },
        },
      };

      const result = await handleToolCall(request);
      // Should still work but treat non-strings as undefined
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe("text");
    });

    it("should include lastFetched timestamp when available", async () => {
      // Use a doc we know has a lastFetched date in our test data
      const docWithTimestamp = tskReference.siteDocs.find(
        (doc) => doc.lastFetched,
      );
      expect(docWithTimestamp).toBeDefined();

      const request: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "tsk_get_site_docs",
          arguments: { title: docWithTimestamp?.title },
        },
      };

      const result = await handleToolCall(request);
      expect(result.content).toHaveLength(1);
      const text = (result.content[0] as any).text;

      // Should include the lastFetched timestamp in some format
      expect(text).toMatch(/Last fetched: .+/);

      // The timestamp should include the year from our test data
      expect(text).toContain("2023");
    });
  });
});
