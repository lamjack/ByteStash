export const EDITOR_SURFACE = { light: "#f1f5f9", dark: "#0f172a" } as const;
export const EDITOR_BORDER = { light: "#cbd5e1", dark: "#334155" } as const;
export const EDITOR_TEXT = { light: "#1e293b", dark: "#e2e8f0" } as const;
export const EDITOR_LINE_HIGHLIGHT = { light: "#e2e8f0", dark: "#1e293b" } as const;
export const EDITOR_LINE_NUMBER = "#64748b" as const;
export const EDITOR_ACTIVE_LINE_NUMBER = { light: "#334155", dark: "#cbd5e1" } as const;
export const MONACO_THEME = { light: "bytestash-light", dark: "bytestash-dark" } as const;

export const editorPalette = (isDark: boolean) => ({
  surface: isDark ? EDITOR_SURFACE.dark : EDITOR_SURFACE.light,
  border: isDark ? EDITOR_BORDER.dark : EDITOR_BORDER.light,
  text: isDark ? EDITOR_TEXT.dark : EDITOR_TEXT.light,
  monacoTheme: isDark ? MONACO_THEME.dark : MONACO_THEME.light,
});
