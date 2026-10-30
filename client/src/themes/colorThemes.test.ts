import { describe, expect, it } from "vitest";
import {
  COLOR_THEMES,
  COLOR_THEME_IDS,
  colorThemeCssVariables,
  getColorTheme,
  hexToRgbChannels,
} from "./colorThemes";
import { sanitizeSettings } from "../types/settings";
import { editorPalette } from "../utils/editor/editorTheme";
import { syntaxThemeFor, darkSyntaxTheme } from "../utils/editor/syntaxThemes";

const HEX = /^#[0-9a-f]{6}$/;

describe("color themes", () => {
  it("ships ten themes with complete, valid palettes", () => {
    expect(COLOR_THEME_IDS).toHaveLength(10);
    for (const id of COLOR_THEME_IDS) {
      const theme = COLOR_THEMES[id];
      expect(theme.id).toBe(id);
      for (const group of [theme.ui, theme.editor, theme.syntax]) {
        for (const color of Object.values(group)) {
          expect(color).toMatch(HEX);
        }
      }
    }
  });

  it("converts hex colors to Tailwind rgb channels", () => {
    expect(hexToRgbChannels("#282a36")).toBe("40 42 54");
  });

  it("points both light and dark CSS variables at the theme palette", () => {
    const vars = colorThemeCssVariables(COLOR_THEMES.dracula);
    expect(vars["--color-light-bg"]).toBe("33 34 44");
    expect(vars["--color-dark-bg"]).toBe("33 34 44");
    expect(vars["--color-dark-text-secondary"]).toBe(hexToRgbChannels("#a4a9c8"));
  });

  it("only resolves known theme ids", () => {
    expect(getColorTheme("nord")?.label).toBe("Nord");
    expect(getColorTheme("dark")).toBeNull();
    expect(getColorTheme("nope")).toBeNull();
  });

  it("accepts color theme ids as a saved theme setting", () => {
    expect(sanitizeSettings({ theme: "tokyo-night" })).toEqual({ theme: "tokyo-night" });
    expect(sanitizeSettings({ theme: "not-a-theme" })).toEqual({});
  });

  it("uses theme colors for the editor and syntax highlighting", () => {
    const palette = editorPalette(true, COLOR_THEMES.monokai);
    expect(palette.surface).toBe("#272822");
    expect(palette.monacoTheme).toBe("bytestash-monokai");

    const syntax = syntaxThemeFor(true, COLOR_THEMES.monokai);
    expect(syntax.keyword.color).toBe("#f92672");
    expect(syntax.string.color).toBe("#e6db74");
    expect(syntaxThemeFor(true, null)).toBe(darkSyntaxTheme);
  });
});
