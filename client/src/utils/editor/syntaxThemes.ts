import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ColorTheme } from "../../themes/colorThemes";

type PrismTheme = typeof vs;

const recolor = (
  theme: PrismTheme,
  colorMap: Record<string, string>
): PrismTheme =>
  Object.fromEntries(
    Object.entries(theme).map(([key, value]) => {
      const style = value as PrismTheme[keyof PrismTheme];
      if (!style || typeof style !== "object" || typeof style.color !== "string") {
        return [key, value];
      }

      const replacement = colorMap[style.color.toLowerCase()];
      return [key, replacement ? { ...style, color: replacement } : style];
    })
  ) as PrismTheme;

export const lightSyntaxTheme = recolor(vs, {
  "#36acaa": "#0f766e",
  "#e90": "#b45309",
  "#ee9900": "#b45309",
  "#2b91af": "#1d6f8a",
  "#ff0000": "#b91c1c",
});

export const darkSyntaxTheme = recolor(vscDarkPlus, {
  "#808080": "#9d9d9d",
});

// Builds a Prism style for a named color theme on top of the matching base
// style, so layout rules (fonts, padding, etc.) stay identical.
const buildColorThemeSyntax = (theme: ColorTheme): PrismTheme => {
  const base = theme.base === "dark" ? darkSyntaxTheme : lightSyntaxTheme;
  const { syntax } = theme;
  const tokenColors: Record<string, string> = {
    comment: syntax.comment,
    prolog: syntax.comment,
    doctype: syntax.comment,
    cdata: syntax.comment,
    punctuation: syntax.punctuation,
    namespace: syntax.type,
    property: syntax.attribute,
    tag: syntax.tag,
    boolean: syntax.constant,
    number: syntax.number,
    constant: syntax.constant,
    symbol: syntax.constant,
    deleted: syntax.regexp,
    selector: syntax.tag,
    "attr-name": syntax.attribute,
    "attr-value": syntax.string,
    string: syntax.string,
    char: syntax.string,
    builtin: syntax.type,
    inserted: syntax.string,
    operator: syntax.operator,
    entity: syntax.operator,
    url: syntax.string,
    atrule: syntax.keyword,
    keyword: syntax.keyword,
    function: syntax.function,
    "class-name": syntax.type,
    regex: syntax.regexp,
    important: syntax.keyword,
    variable: syntax.variable,
  };

  const style: Record<string, Record<string, unknown>> = Object.fromEntries(
    Object.entries(base).map(([key, value]) => [key, { ...(value as object) }])
  );
  for (const [token, color] of Object.entries(tokenColors)) {
    style[token] = { ...(style[token] ?? {}), color };
  }
  for (const key of ['code[class*="language-"]', 'pre[class*="language-"]']) {
    style[key] = { ...(style[key] ?? {}), color: theme.ui.text, background: theme.editor.surface };
  }
  return style as PrismTheme;
};

const colorThemeSyntaxCache = new Map<string, PrismTheme>();

export const syntaxThemeFor = (isDark: boolean, colorTheme?: ColorTheme | null): PrismTheme => {
  if (!colorTheme) return isDark ? darkSyntaxTheme : lightSyntaxTheme;

  let style = colorThemeSyntaxCache.get(colorTheme.id);
  if (!style) {
    style = buildColorThemeSyntax(colorTheme);
    colorThemeSyntaxCache.set(colorTheme.id, style);
  }
  return style;
};
