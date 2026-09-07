import type { SnippetFacet } from "../../types/metadata";

export interface TaxonomyItem {
  value: string;
  label: string;
}

export interface SnippetTaxonomy {
  categories: TaxonomyItem[];
  tags: TaxonomyItem[];
}

export interface TaxonomyFacet extends TaxonomyItem {
  count: number;
}

export interface FacetedSnippetTaxonomy {
  categories: TaxonomyFacet[];
  tags: TaxonomyFacet[];
}

const FOLDER_PREFIX = "folder:";

export const partitionSnippetCategories = (values: string[]): SnippetTaxonomy =>
  values.reduce<SnippetTaxonomy>(
    (result, value) => {
      const target = value.startsWith(FOLDER_PREFIX) ? result.categories : result.tags;
      target.push({
        value,
        label: value.startsWith(FOLDER_PREFIX) ? value.slice(FOLDER_PREFIX.length) : value,
      });
      return result;
    },
    { categories: [], tags: [] }
  );

export const partitionSnippetFacets = (
  facets: SnippetFacet[]
): FacetedSnippetTaxonomy =>
  facets.reduce<FacetedSnippetTaxonomy>(
    (result, facet) => {
      const target = facet.value.startsWith(FOLDER_PREFIX)
        ? result.categories
        : result.tags;
      target.push({
        ...facet,
        label: facet.value.startsWith(FOLDER_PREFIX)
          ? facet.value.slice(FOLDER_PREFIX.length)
          : facet.value,
      });
      return result;
    },
    { categories: [], tags: [] }
  );
