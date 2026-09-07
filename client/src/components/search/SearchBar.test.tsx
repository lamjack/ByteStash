import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchBar } from "./SearchBar";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const getStackingLevel = (element: Element) => {
  const stackingClass = Array.from(element.classList).find((className) =>
    /^z-\d+$/.test(className)
  );

  return Number(stackingClass?.slice(2) ?? 0);
};

describe("SearchBar", () => {
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

  it("keeps hashtag suggestions above snippet card controls", async () => {
    await act(async () => {
      root.render(
        <>
          <SearchBar
            value="#git"
            onChange={() => {}}
            onCategorySelect={() => {}}
            existingCategories={["gitignore"]}
            selectedCategories={[]}
          />
          <div data-testid="snippet-controls" className="relative z-20" />
        </>
      );
    });

    const input = container.querySelector("input");
    expect(input).not.toBeNull();

    await act(async () => {
      input!.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });

    const suggestions = container.querySelector('[role="listbox"]');
    const snippetControls = container.querySelector(
      '[data-testid="snippet-controls"]'
    );
    expect(suggestions).not.toBeNull();
    expect(snippetControls).not.toBeNull();
    expect(getStackingLevel(suggestions!)).toBeGreaterThan(
      getStackingLevel(snippetControls!)
    );
  });
});
