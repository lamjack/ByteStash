import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CategoryList from "./CategoryList";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("CategoryList", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get() {
        return this.tagName === "DIV" ? 260 : 80;
      },
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("renders every category without an overflow control", async () => {
    await act(async () => {
      root.render(
        <CategoryList
          categories={["alpha", "beta", "gamma"]}
          onCategoryClick={() => {}}
          variant="clickable"
        />
      );
    });

    const visibleRow = container.firstElementChild?.firstElementChild;
    expect(visibleRow?.textContent).toContain("alpha");
    expect(visibleRow?.textContent).toContain("beta");
    expect(visibleRow?.textContent).toContain("gamma");
    expect(visibleRow?.textContent).not.toContain("categoryList.moreCount");
  });
});
