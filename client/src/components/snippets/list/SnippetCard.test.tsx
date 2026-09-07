import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import SnippetCardLink from "./SnippetCardLink";

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
