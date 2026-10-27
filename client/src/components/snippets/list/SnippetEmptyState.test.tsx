import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { resources } from "../../../i18n/resources";
import SnippetEmptyState from "./SnippetEmptyState";

const i18n = createInstance();

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: { en: resources.en },
    interpolation: { escapeValue: false },
  });
});

describe("SnippetEmptyState", () => {
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

  const renderEmptyState = async (
    hasActiveFilters: boolean,
    onClearFilters: () => void,
    onCreate: () => void
  ) => {
    await act(async () => {
      root.render(
        <I18nextProvider i18n={i18n}>
          <SnippetEmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreate={onCreate}
          />
        </I18nextProvider>
      );
    });
  };

  it("shows the clear-filters action when filters are active", async () => {
    const onClearFilters = vi.fn();
    const onCreate = vi.fn();
    await renderEmptyState(true, onClearFilters, onCreate);

    expect(container.textContent).toContain("No snippets match the current filters");
    const button = container.querySelector("button");
    expect(button?.textContent).toBe("Clear filters");

    await act(async () => button?.click());
    expect(onClearFilters).toHaveBeenCalledTimes(1);
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("shows the create action for an empty library", async () => {
    const onClearFilters = vi.fn();
    const onCreate = vi.fn();
    await renderEmptyState(false, onClearFilters, onCreate);

    expect(container.textContent).toContain("No snippets yet");
    expect(container.textContent).toContain("Save your first snippet to start building the library.");
    const button = container.querySelector("button");
    expect(button?.textContent).toContain("New snippet");
    expect(button?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();

    await act(async () => button?.click());
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onClearFilters).not.toHaveBeenCalled();
  });
});
