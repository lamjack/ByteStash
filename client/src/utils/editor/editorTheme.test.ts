import { describe, expect, it } from "vitest";
import {
  EDITOR_BORDER,
  EDITOR_SURFACE,
  EDITOR_TEXT,
  MONACO_THEME,
  editorPalette,
} from "./editorTheme";

describe("editorPalette", () => {
  it("returns the light slate editor palette", () => {
    expect(editorPalette(false)).toEqual({
      surface: EDITOR_SURFACE.light,
      border: EDITOR_BORDER.light,
      text: EDITOR_TEXT.light,
      monacoTheme: MONACO_THEME.light,
    });
  });

  it("returns the dark slate editor palette", () => {
    expect(editorPalette(true)).toEqual({
      surface: EDITOR_SURFACE.dark,
      border: EDITOR_BORDER.dark,
      text: EDITOR_TEXT.dark,
      monacoTheme: MONACO_THEME.dark,
    });
  });
});
