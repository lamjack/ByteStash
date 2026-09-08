import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import MarkdownRenderer from "./MarkdownRenderer";

describe("MarkdownRenderer", () => {
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

  it("renders a single newline as a line break", async () => {
    await act(async () => {
      root.render(<MarkdownRenderer>{"first line\nsecond line"}</MarkdownRenderer>);
    });

    const paragraph = container.querySelector("p");
    expect(paragraph).not.toBeNull();
    expect(paragraph?.querySelector("br")).not.toBeNull();
  });

  it("keeps newlines inside code blocks untouched", async () => {
    const markdown = "```bash\nfirst\nsecond\n```";
    await act(async () => {
      root.render(<MarkdownRenderer>{markdown}</MarkdownRenderer>);
    });

    const codeElement = container.querySelector("pre code");
    expect(codeElement).not.toBeNull();
    expect(codeElement?.querySelector("br")).toBeNull();
    expect(codeElement?.textContent).toContain("first\nsecond");
  });

  it("uses readable table header colors in light and dark themes", async () => {
    const markdown = "| Environment | URL |\n| --- | --- |\n| prod | https://example.com |";
    await act(async () => {
      root.render(<MarkdownRenderer>{markdown}</MarkdownRenderer>);
    });

    const tableHeader = container.querySelector("th");
    expect(tableHeader).not.toBeNull();
    expect(Array.from(tableHeader?.classList || [])).toEqual(
      expect.arrayContaining([
        "bg-light-hover",
        "text-light-text",
        "dark:bg-dark-hover",
        "dark:text-dark-text",
      ])
    );
  });
});
