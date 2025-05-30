// MCP tool response types

// Site documentation interface
export interface SiteDoc {
  url: string;
  title?: string;
  content?: string;
  lastFetched?: Date;
}

// Reference data structure
export interface TskReference {
  siteDocs: SiteDoc[];
}
