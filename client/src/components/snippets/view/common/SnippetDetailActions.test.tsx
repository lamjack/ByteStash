import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { resources } from "../../../../i18n/resources";
import { SnippetDetailActions } from "./SnippetDetailActions";

const i18n = createInstance();

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: { en: resources.en },
    interpolation: { escapeValue: false },
  });
});

describe("SnippetDetailActions", () => {
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

  it("renders named edit, share, and delete actions and calls each handler", async () => {
    const onEdit = vi.fn();
    const onShare = vi.fn();
    const onDelete = vi.fn();

    await act(async () => {
      root.render(
        <I18nextProvider i18n={i18n}>
          <SnippetDetailActions
            onEdit={onEdit}
            onShare={onShare}
            onDelete={onDelete}
          />
        </I18nextProvider>
      );
    });

    const buttons = Array.from(container.querySelectorAll("button"));
    expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual([
      "Edit snippet",
      "Share snippet",
      "Delete snippet",
    ]);

    await act(async () => buttons.forEach((button) => button.click()));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onShare).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
