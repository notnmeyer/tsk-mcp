import {
  updateReferenceWithSiteContent,
  tskReference,
} from "./data/reference.js";

async function testFetch() {
  console.log("Testing site documentation fetch...\n");

  // Show initial state
  console.log("Initial state:");
  tskReference.siteDocs.forEach((doc: any) => {
    console.log(
      `- ${doc.title}: ${doc.content ? "Has content" : "No content"}`,
    );
  });

  console.log("\nFetching documentation...");
  const startTime = Date.now();

  try {
    await updateReferenceWithSiteContent();
    const duration = Date.now() - startTime;
    console.log(`\nFetch completed in ${duration}ms\n`);

    // Show updated state
    console.log("Updated state:");
    tskReference.siteDocs.forEach((doc: any) => {
      console.log(`- ${doc.title}:`);
      console.log(`  URL: ${doc.url}`);
      console.log(
        `  Content: ${doc.content ? `${doc.content.length} characters` : "No content"}`,
      );
      console.log(
        `  Last fetched: ${doc.lastFetched ? doc.lastFetched.toISOString() : "Never"}`,
      );
      if (doc.content && doc.content.includes("Error fetching")) {
        console.log(`  Error: ${doc.content}`);
      }
    });
  } catch (error) {
    console.error("Failed to fetch documentation:", error);
  }
}

testFetch().catch(console.error);
