import {
  fetchAllSiteDocsContent,
  getSiteDocContent,
  updateReferenceWithSiteContent,
  tskReference,
} from "../data/reference.js";
import { SiteDoc } from "../types/index.js";

// Create test constants that aren't coupled to the actual reference data
const TEST_URL = "https://example.com/test-doc";

// Mock fetch globally
global.fetch = jest.fn();

describe("Site Documentation Functionality", () => {
  let consoleSpy: jest.SpyInstance;
  let originalDocs: SiteDoc[];

  // Store the original docs before tests
  beforeAll(() => {
    originalDocs = JSON.parse(JSON.stringify(tskReference.siteDocs));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error during tests
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    // Reset to a clean state but preserve structure
    tskReference.siteDocs = originalDocs.map((doc) => ({
      url: doc.url,
      title: doc.title,
    })) as SiteDoc[];
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  afterAll(() => {
    // Restore original docs after all tests
    tskReference.siteDocs = originalDocs as SiteDoc[];
  });

  describe("fetchAllSiteDocsContent", () => {
    it("should fetch content for all site docs successfully", async () => {
      const mockContent = "Mock documentation content";
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockContent),
      });

      const result = await fetchAllSiteDocsContent();

      expect(result).toHaveLength(tskReference.siteDocs.length);
      expect(fetch).toHaveBeenCalledTimes(tskReference.siteDocs.length);

      result.forEach((doc, index) => {
        expect(doc.url).toBe(tskReference.siteDocs[index]?.url);
        expect(doc.title).toBe(tskReference.siteDocs[index]?.title);
        expect(doc.content).toBe(mockContent);
        expect(doc.lastFetched).toBeInstanceOf(Date);
      });
    });

    it("should handle fetch errors gracefully", async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const result = await fetchAllSiteDocsContent();

      expect(result).toHaveLength(tskReference.siteDocs.length);
      result.forEach((doc) => {
        expect(doc.content).toContain("Error fetching content: Network error");
        expect(doc.lastFetched).toBeInstanceOf(Date);
      });
    });

    it("should handle HTTP error responses", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await fetchAllSiteDocsContent();

      expect(result).toHaveLength(tskReference.siteDocs.length);
      result.forEach((doc) => {
        expect(doc.content).toContain("Failed to fetch");
        expect(doc.content).toContain("404");
      });
    });

    it("should preserve original site doc properties while adding new ones", async () => {
      const mockContent = "Test content";
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockContent),
      });

      const result = await fetchAllSiteDocsContent();

      result.forEach((doc, index) => {
        const originalDoc = tskReference.siteDocs[index];
        expect(originalDoc).toBeDefined();
        // Check structure remains intact (not specific values)
        expect(doc).toHaveProperty("url");
        // Check new properties are added
        expect(doc.content).toBe(mockContent);
        expect(doc.lastFetched).toBeDefined();
      });
    });
  });

  describe("getSiteDocContent", () => {
    it("should return cached content if available", async () => {
      // Use any doc from the collection
      expect(tskReference.siteDocs.length).toBeGreaterThan(0);
      const testDoc = tskReference.siteDocs[0]!;
      const testUrl = testDoc.url;
      const cachedContent = "Cached content";

      // Set cached content using type assertion
      (testDoc as any).content = cachedContent;

      const result = await getSiteDocContent(testUrl);

      expect(result).toBe(cachedContent);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("should fetch content if not cached", async () => {
      // Use any doc, doesn't matter which one
      expect(tskReference.siteDocs.length).toBeGreaterThan(0);
      const testDoc = tskReference.siteDocs[0]!;
      const testUrl = testDoc.url;
      const fetchedContent = "Freshly fetched content";

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(fetchedContent),
      });

      const result = await getSiteDocContent(testUrl);

      expect(result).toBe(fetchedContent);
      expect(fetch).toHaveBeenCalledWith(testUrl);
      expect((testDoc as any).content).toBe(fetchedContent);
      expect((testDoc as any).lastFetched).toBeInstanceOf(Date);
    });

    it("should throw error for unknown URL", async () => {
      const unknownUrl = "https://unknown.example.com/nonexistent";

      await expect(getSiteDocContent(unknownUrl)).rejects.toThrow(
        `Site doc not found for URL: ${unknownUrl}`,
      );
    });

    it("should handle fetch errors and return undefined", async () => {
      // Use any doc from the reference
      expect(tskReference.siteDocs.length).toBeGreaterThan(0);
      const testDoc = tskReference.siteDocs[0]!;
      const testUrl = testDoc.url;

      (fetch as jest.Mock).mockRejectedValue(new Error("Fetch failed"));

      const result = await getSiteDocContent(testUrl);

      expect(result).toBeUndefined();
      // Content should not be updated on error
      expect((testDoc as any).content).toBeUndefined();
    });

    it("should handle HTTP errors and return undefined", async () => {
      // Use any doc from the collection
      expect(tskReference.siteDocs.length).toBeGreaterThan(0);
      const testDoc = tskReference.siteDocs[0]!;
      const testUrl = testDoc.url;

      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await getSiteDocContent(testUrl);

      expect(result).toBeUndefined();
    });
  });

  describe("updateReferenceWithSiteContent", () => {
    it("should update all site docs with fetched content", async () => {
      const mockContent = "Updated content";
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockContent),
      });

      await updateReferenceWithSiteContent();

      tskReference.siteDocs.forEach((doc) => {
        expect(doc.content).toBe(mockContent);
        expect(doc.lastFetched).toBeInstanceOf(Date);
      });
    });

    it("should preserve site doc array length", async () => {
      const originalLength = tskReference.siteDocs.length;

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("test content"),
      });

      await updateReferenceWithSiteContent();

      expect(tskReference.siteDocs).toHaveLength(originalLength);
    });

    it("should handle mixed success and failure responses", async () => {
      let callCount = 0;
      (fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve("Success content"),
          });
        } else {
          return Promise.reject(new Error("Fetch failed"));
        }
      });

      await updateReferenceWithSiteContent();

      expect(tskReference.siteDocs[0]?.content).toBe("Success content");
      expect(tskReference.siteDocs[1]?.content).toContain(
        "Error fetching content",
      );
    });
  });

  describe("SiteDoc interface compliance", () => {
    it("should maintain proper SiteDoc structure", async () => {
      const mockContent = "Test content";
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockContent),
      });

      const result = await fetchAllSiteDocsContent();

      expect(result.length).toBeGreaterThan(0);
      result.forEach((doc) => {
        // Check the structure conforms to SiteDoc interface
        expect(doc).toHaveProperty("url");
        expect(doc).toHaveProperty("content");
        expect(doc).toHaveProperty("lastFetched");

        // Basic type checks
        expect(typeof doc.url).toBe("string");
        expect(typeof doc.content).toBe("string");
        expect(doc.lastFetched instanceof Date).toBeTruthy();

        // Format checks
        expect(doc.url).toMatch(/^https?:\/\//);
      });
    });
  });

  describe("integration scenarios", () => {
    it("should have properly structured URLs", () => {
      // Instead of checking for specific URLs, verify the URL structure is valid
      tskReference.siteDocs.forEach((doc) => {
        expect(doc.url).toBeDefined();
        expect(typeof doc.url).toBe("string");
        expect(doc.url).toMatch(/^https?:\/\//); // Verify it's a valid URL format
      });

      // Check that at least one installation-related document exists
      const installationDoc = tskReference.siteDocs.find((doc) =>
        doc.title?.includes("Installation"),
      );
      expect(installationDoc).toBeDefined();
    });

    it("should handle concurrent fetches correctly", async () => {
      const mockContent = "Concurrent content";
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockContent),
      });

      const promises = [fetchAllSiteDocsContent(), fetchAllSiteDocsContent()];

      const results = await Promise.all(promises);

      expect(results[0]).toHaveLength(tskReference.siteDocs.length);
      expect(results[1]).toHaveLength(tskReference.siteDocs.length);
      expect(fetch).toHaveBeenCalledTimes(tskReference.siteDocs.length * 2);
    });
  });
});
