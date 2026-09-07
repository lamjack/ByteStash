import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SnippetMetadata } from "../../types/metadata";
import CategoryDrawer from "./CategoryDrawer";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const metadata: SnippetMetadata = {
  categories: ["folder:Backend", "react"],
  languages: [],
  counts: { total: 7 },
  facets: [
    { value: "folder:Backend", count: 3 },
    { value: "react", count: 5 },
  ],
};

describe("CategoryDrawer", () => {
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

  it("filters facets and toggles the selected value", async () => {
    const onToggle = vi.fn();

    await act(async () => {
      root.render(
        <CategoryDrawer
          isOpen
          metadata={metadata}
          selectedValues={[]}
          onToggle={onToggle}
          onClear={() => {}}
          onClose={() => {}}
        />
      );
    });

    const input = container.querySelector("input");
    expect(input).not.toBeNull();

    await act(async () => {
      const setValue = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )?.set;
      setValue?.call(input, "react");
      input!.dispatchEvent(new Event("input", { bubbles: true }));
    });

    expect(container.textContent).toContain("react");
    expect(container.textContent).toContain("5");
    expect(container.textContent).not.toContain("Backend");

    const reactButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("react")
    );
    expect(reactButton).not.toBeUndefined();

    await act(async () => reactButton!.click());
    expect(onToggle).toHaveBeenCalledWith("react");
  });
});
