import { describe, expect, it } from "vitest";
import {
  partitionSnippetCategories,
  partitionSnippetFacets,
} from "./categoryUtils";

describe("partitionSnippetCategories", () => {
  it("separates folder categories from tags while preserving filter values", () => {
    expect(
      partitionSnippetCategories([
        "folder:Backend/API",
        "react",
        "folder:Infrastructure",
        "typescript",
      ])
    ).toEqual({
      categories: [
        { value: "folder:Backend/API", label: "Backend/API" },
        { value: "folder:Infrastructure", label: "Infrastructure" },
      ],
      tags: [
        { value: "react", label: "react" },
        { value: "typescript", label: "typescript" },
      ],
    });
  });

  it("preserves counts when partitioning metadata facets", () => {
    expect(
      partitionSnippetFacets([
        { value: "folder:Backend", count: 4 },
        { value: "react", count: 7 },
      ])
    ).toEqual({
      categories: [{ value: "folder:Backend", label: "Backend", count: 4 }],
      tags: [{ value: "react", label: "react", count: 7 }],
    });
  });
});
