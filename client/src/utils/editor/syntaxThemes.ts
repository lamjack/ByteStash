import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";

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
