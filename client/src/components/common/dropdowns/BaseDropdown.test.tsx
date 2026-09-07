import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BaseDropdown from "./BaseDropdown";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const getStackingLevel = (element: Element) => {
  const stackingClass = Array.from(element.classList).find((className) =>
    /^z-\d+$/.test(className)
  );

  return Number(stackingClass?.slice(2) ?? 0);
};

describe("BaseDropdown", () => {
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

  it("renders suggestions above interactive page content", async () => {
    await act(async () => {
      root.render(
        <>
          <BaseDropdown
            value="#git"
            onChange={() => {}}
            onSelect={() => {}}
            getSections={() => [
              { title: "Categories", items: ["gitignore"] },
            ]}
          />
          <div data-testid="page-content" className="relative z-20" />
        </>
      );
    });

    const input = container.querySelector("input");
    expect(input).not.toBeNull();

    await act(async () => {
      input!.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });

    const suggestions = container.querySelector('[role="listbox"]');
    const pageContent = container.querySelector('[data-testid="page-content"]');
    expect(suggestions).not.toBeNull();
    expect(pageContent).not.toBeNull();
    expect(getStackingLevel(suggestions!)).toBeGreaterThan(
      getStackingLevel(pageContent!)
    );
  });
});
