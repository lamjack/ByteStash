import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { resources } from "../../../i18n/resources";
import Modal from "./Modal";

const i18n = createInstance();

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: { en: resources.en },
    interpolation: { escapeValue: false },
  });
});

describe("Modal", () => {
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

  const renderModal = async (isOpen: boolean, onClose = () => {}) => {
    await act(async () => {
      root.render(
        <I18nextProvider i18n={i18n}>
          <Modal isOpen={isOpen} onClose={onClose} title="Test modal">
            <input aria-label="First field" />
          </Modal>
        </I18nextProvider>
      );
    });
  };

  it("renders nothing when closed", async () => {
    await renderModal(false);
    expect(container.innerHTML).toBe("");
  });

  it("renders the open panel as a modal dialog", async () => {
    await renderModal(true);

    const panel = container.querySelector('[role="dialog"]');
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute("aria-modal")).toBe("true");
    expect(panel?.getAttribute("aria-labelledby")).toBe(
      panel?.querySelector("[id]")?.getAttribute("id")
    );
  });

  it("calls onClose once when Escape is pressed", async () => {
    const onClose = vi.fn();
    await renderModal(true, onClose);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
