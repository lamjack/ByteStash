import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CategoryTag from "./CategoryTag";

describe("CategoryTag", () => {
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

  it("shows a folder label without its prefix and sends the raw category on click", async () => {
    const onClick = vi.fn();
    await act(async () => {
      root.render(
        <CategoryTag
          category="folder:wiz clients"
          onClick={onClick}
          variant="removable"
        />
      );
    });

    const button = container.querySelector("button");
    expect(button?.textContent).toContain("wiz clients");
    expect(button?.textContent).not.toContain("folder:");
    expect(button?.title).toBe("folder:wiz clients");
    expect(button?.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");

    await act(async () => button?.click());
    expect(onClick.mock.calls[0][1]).toBe("folder:wiz clients");
  });

  it("renders a plain tag unchanged without a folder icon", async () => {
    await act(async () => {
      root.render(
        <CategoryTag
          category="typescript"
          onClick={() => {}}
          variant="clickable"
        />
      );
    });

    const button = container.querySelector("button");
    expect(button?.textContent).toBe("typescript");
    expect(button?.querySelector("svg")).toBeNull();
    expect(button?.hasAttribute("title")).toBe(false);
  });
});
