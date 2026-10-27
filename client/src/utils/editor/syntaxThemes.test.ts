import { describe, expect, it } from "vitest";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { darkSyntaxTheme, lightSyntaxTheme } from "./syntaxThemes";

describe("syntax themes", () => {
  it("recolors low-contrast light syntax tokens", () => {
    expect(lightSyntaxTheme.number.color).toBe("#0f766e");
    expect(lightSyntaxTheme.important.color).toBe("#b45309");
  });

  it("recolors low-contrast dark tokens and preserves untouched colors", () => {
    expect(darkSyntaxTheme.cdata.color).toBe("#9d9d9d");
    expect(lightSyntaxTheme.comment.color).toBe(vs.comment.color);
  });
});
