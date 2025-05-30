import { TskReference, SiteDoc } from "../types/index.js";

/**
 * TSK Reference Data with Site Documentation Fetching
 *
 * This module provides site documentation fetching for the tsk task runner.
 * Site documentation is fetched from the official tsk documentation website.
 *
 * Usage Examples:
 *
 * // Fetch all site documentation content
 * const updatedSiteDocs = await fetchAllSiteDocsContent();
 *
 * // Get content for a specific URL
 * const content = await getSiteDocContent("https://notnmeyer.github.io/tsk-docs/docs/installation");
 *
 * // Update the reference data with fetched content
 * await updateReferenceWithSiteContent();
 * console.log(tskReference.siteDocs[0].content); // Now contains fetched content
 *
 * // Access cached content (if already fetched)
 * const installationDoc = tskReference.siteDocs.find(doc => doc.title === "Installation Guide");
 * if (installationDoc?.content) {
 *   console.log("Installation instructions:", installationDoc.content);
 * }
 */

// Utility function to fetch content for all site docs
export async function fetchAllSiteDocsContent(): Promise<SiteDoc[]> {
  const fetchPromises = tskReference.siteDocs.map(async (siteDoc) => {
    try {
      const response = await fetch(siteDoc.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${siteDoc.url}: ${response.status}`);
      }
      const content = await response.text();
      return {
        ...siteDoc,
        content,
        lastFetched: new Date(),
      };
    } catch (error) {
      console.error(`Error fetching ${siteDoc.url}:`, error);
      return {
        ...siteDoc,
        content: `Error fetching content: ${error instanceof Error ? error.message : String(error)}`,
        lastFetched: new Date(),
      };
    }
  });

  return Promise.all(fetchPromises);
}

// Utility function to get cached content or fetch if not available
export async function getSiteDocContent(
  url: string,
): Promise<string | undefined> {
  const siteDoc = tskReference.siteDocs.find((doc) => doc.url === url);
  if (!siteDoc) {
    throw new Error(`Site doc not found for URL: ${url}`);
  }

  if (siteDoc.content) {
    return siteDoc.content;
  }

  // If no cached content, fetch it
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    const content = await response.text();

    // Update the cached content
    siteDoc.content = content;
    siteDoc.lastFetched = new Date();

    return content;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return undefined;
  }
}

// Function to update the reference data with fetched content
export async function updateReferenceWithSiteContent(): Promise<void> {
  const updatedSiteDocs = await fetchAllSiteDocsContent();

  // Update the existing siteDocs array with fetched content
  updatedSiteDocs.forEach((updatedDoc, index) => {
    if (tskReference.siteDocs[index]) {
      tskReference.siteDocs[index] = updatedDoc;
    }
  });
}

export const tskReference: TskReference = {
  // the markdown files are the smallest by far compared to json or html
  siteDocs: [
    {
      url: "https://raw.githubusercontent.com/notnmeyer/tsk-docs/refs/heads/main/docs/home.md",
      title: "Core Concepts",
    },
    {
      url: "https://raw.githubusercontent.com/notnmeyer/tsk-docs/refs/heads/main/docs/installation.md",
      title: "Installation Guide",
    },
    {
      url: "https://raw.githubusercontent.com/notnmeyer/tsk-docs/refs/heads/main/docs/usage.md",
      title: "Usage Documentation",
    },
  ],
};
