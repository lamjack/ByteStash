import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createInstance } from "i18next";
import { MemoryRouter } from "react-router-dom";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Snippet } from "../../../types/snippets";
import { resources } from "../../../i18n/resources";
import { SnippetCard } from "./SnippetCard";
import SnippetCardLink from "./SnippetCardLink";

const i18n = createInstance();

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: { en: resources.en },
    interpolation: { escapeValue: false },
  });
});

describe("SnippetCardLink", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("exposes a same-tab standalone detail link", async () => {
    await act(async () => {
      root.render(
        <MemoryRouter
          initialEntries={["/?categories=react"]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <SnippetCardLink snippetId="1" title="Drawer state" />
        </MemoryRouter>
      );
    });

    const detailLink = container.querySelector('a[href="/snippets/1"]');
    expect(detailLink).not.toBeNull();
    expect(detailLink?.getAttribute("target")).toBeNull();
  });
});

describe("SnippetCard", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const createSnippet = (overrides: Partial<Snippet> = {}): Snippet => ({
    id: "1",
    title: "Snippet title",
    description: "Snippet description",
    updated_at: "2025-01-01T00:00:00.000Z",
    categories: [],
    fragments: [{ file_name: "main.sh", code: "echo ok", language: "bash", position: 0 }],
    share_count: 0,
    is_public: 0,
    is_pinned: 0,
    is_favorite: 0,
    ...overrides,
  });

  const renderSnippetCard = async (
    snippet: Snippet,
    viewMode: "grid" | "list" = "grid"
  ) => {
    await act(async () => {
      root.render(
        <I18nextProvider i18n={i18n}>
          <MemoryRouter
            initialEntries={["/"]}
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <SnippetCard
              snippet={snippet}
              viewMode={viewMode}
              onDelete={() => {}}
              onRestore={() => {}}
              onEdit={() => {}}
              onShare={() => {}}
              onDuplicate={() => {}}
              onCategoryClick={() => {}}
              compactView={false}
              showCodePreview={false}
              previewLines={4}
              showCategories={false}
              showLineNumbers={false}
              isPublicView={false}
              isRecycleView={false}
              isAuthenticated={false}
            />
          </MemoryRouter>
        </I18nextProvider>
      );
    });
  };

  it("shows a plural file count for multiple fragments", async () => {
    const fragments = [
      { file_name: "one.sh", code: "", language: "bash", position: 0 },
      { file_name: "two.sh", code: "", language: "bash", position: 1 },
      { file_name: "three.sh", code: "", language: "bash", position: 2 },
    ];
    await renderSnippetCard(createSnippet({ fragments }));
    expect(container.textContent).toContain("3 files");
  });

  it("does not show a file count for a single fragment", async () => {
    await renderSnippetCard(createSnippet());
    expect(container.textContent).not.toContain("file");
  });

  it("renders the full title without line clamping", async () => {
    const title = "x".repeat(120);
    await renderSnippetCard(createSnippet({ title }));

    const heading = container.querySelector("h3");
    expect(heading?.textContent).toBe(title);
    expect(heading?.classList.contains("line-clamp-2")).toBe(false);
  });

  it("does not render fallback text for an empty description", async () => {
    await renderSnippetCard(createSnippet({ description: "" }));
    expect(container.textContent).not.toContain("No description available");
  });

  it("renders compact rows without the card body in list mode", async () => {
    await renderSnippetCard(createSnippet(), "list");

    const article = container.querySelector("article");
    expect(article?.classList.contains("py-2.5")).toBe(true);
    expect(article?.querySelector(".p-4")).toBeNull();
    expect(article?.querySelector("h3")?.textContent).toBe("Snippet title");
  });

  it("shows a muted accessible pinned status without the old badge color", async () => {
    await renderSnippetCard(createSnippet({ is_pinned: 1 }));

    expect(container.querySelector('[role="img"][aria-label="Pinned"]')).not.toBeNull();
    expect(container.querySelector(".bg-orange-100")).toBeNull();
  });
});
