export interface SnippetFacet {
  value: string;
  count: number;
}

export interface SnippetMetadata {
  categories: string[];
  languages: string[];
  counts: {
    total: number;
  };
  facets: SnippetFacet[];
}

export const EMPTY_SNIPPET_METADATA: SnippetMetadata = {
  categories: [],
  languages: [],
  counts: { total: 0 },
  facets: [],
};
