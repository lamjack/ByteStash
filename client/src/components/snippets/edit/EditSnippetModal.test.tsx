import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "../../../contexts/ToastContext";
import type { Snippet } from "../../../types/snippets";
import { resources } from "../../../i18n/resources";
import EditSnippetModal from "./EditSnippetModal";

vi.mock("../../editor/CodeEditor", () => ({
  CodeEditor: () => null,
}));

const i18n = createInstance();

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: { en: resources.en },
    interpolation: { escapeValue: false },
  });
});

describe("EditSnippetModal", () => {
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

  it("keeps all existing fragment filenames after opening the editor", async () => {
    const snippet: Snippet = {
      id: "57",
      title: "Push Notification",
      description: "",
      updated_at: "2026-10-23T00:00:00.000Z",
      categories: [],
      fragments: [
        {
          file_name: "push-topic-language-flip.md",
          code: "# Existing first fragment",
          language: "markdown",
          position: 0,
        },
        {
          file_name: "extract_table.py",
          code: "print('second')",
          language: "python",
          position: 1,
        },
        {
          file_name: "daily_scan.py",
          code: "print('third')",
          language: "python",
          position: 2,
        },
      ],
      share_count: 0,
      is_public: 0,
      is_pinned: 0,
      is_favorite: 0,
    };

    await act(async () => {
      root.render(
        <ToastProvider>
          <I18nextProvider i18n={i18n}>
            <EditSnippetModal
              isOpen
              onClose={() => {}}
              onSubmit={() => {}}
              snippetToEdit={snippet}
              showLineNumbers={false}
              allCategories={[]}
            />
          </I18nextProvider>
        </ToastProvider>
      );
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const editors = Array.from(
      container.querySelectorAll('[role="dialog"] div.border.rounded-lg.shadow-lg')
    );
    const fileNames = editors.map((editor) =>
      editor.querySelector<HTMLInputElement>('input[placeholder]')?.value
    );
    expect(fileNames).toEqual([
      "push-topic-language-flip.md",
      "extract_table.py",
      "daily_scan.py",
    ]);
  });
});
