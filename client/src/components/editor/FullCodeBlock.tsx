import React, { useEffect, useRef, useState } from "react";
import MarkdownRenderer from "../common/markdown/MarkdownRenderer";
import Editor from "@monaco-editor/react";
import {
  getLanguageLabel,
  getMonacoLanguage,
  initializeMonaco,
} from "../../utils/language/languageUtils";
import { editorPalette } from "../../utils/editor/editorTheme";
import CopyButton from "../common/buttons/CopyButton";
import { useTheme } from "../../contexts/ThemeContext";
import RawButton from "../common/buttons/RawButton";
import ExportImageButton from "./export/ExportImageButton";
import ExportImageModal from "./export/ExportImageModal";

initializeMonaco();

export interface FullCodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  isPublicView?: boolean;
  snippetId?: string;
  fragmentId?: string;
}

export const FullCodeBlock: React.FC<FullCodeBlockProps> = ({
  code,
  language = "plaintext",
  showLineNumbers = true,
  isPublicView,
  snippetId,
  fragmentId,
}) => {
  const { theme } = useTheme();
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme
  );
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        setEffectiveTheme(mediaQuery.matches ? "dark" : "light");
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      setEffectiveTheme(theme);
    }
  }, [theme]);

  const isDark = effectiveTheme === "dark";
  const palette = editorPalette(isDark);
  const isMarkdown = getLanguageLabel(language) === "markdown";
  const [highlighterHeight, setHighlighterHeight] = useState<string>("100px");
  const containerRef = useRef<HTMLDivElement>(null);
  const LINE_HEIGHT = 19;

  useEffect(() => {
    updateHighlighterHeight();
    const resizeObserver = new ResizeObserver(updateHighlighterHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [code]);

  const updateHighlighterHeight = () => {
    if (!containerRef.current) return;

    const lineCount = code.split("\n").length;
    const contentHeight = lineCount * LINE_HEIGHT + 35;
    const newHeight = Math.min(500, Math.max(100, contentHeight));
    setHighlighterHeight(`${newHeight}px`);
  };
  return (
    <div className="relative">
      <style>
        {`
          .markdown-content-full {
            color: ${palette.text};
            background-color: ${palette.surface};
            padding: 1rem;
            border-radius: 0.5rem;
            position: relative;
          }
        `}
      </style>
      <div className="relative">
        {isMarkdown ? (
          <div
            className="rounded-lg markdown-content markdown-content-full"
            style={{ backgroundColor: palette.surface }}
          >
            <MarkdownRenderer
              className={`markdown prose ${isDark ? "prose-invert" : ""
                } max-w-none`}
            >
              {code}
            </MarkdownRenderer>
          </div>
        ) : (
          <div ref={containerRef} style={{ 
            maxHeight: "500px", 
            borderRadius: "0.5rem", 
            overflow: "hidden", 
            background: palette.surface,
            border: `1px solid ${palette.border}`,
          }}>
            <Editor
              height={highlighterHeight}
              language={getMonacoLanguage(language)}
              theme={palette.monacoTheme}
              value={code}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "off",
                padding: { top: 16, bottom: 16 },
                lineNumbers: showLineNumbers ? "on" : "off",
                renderLineHighlight: "none",
                scrollbar: {
                  vertical: "visible",
                  horizontal: "visible"
                }
              }}
            />
          </div>
        )}

        <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
          <CopyButton text={code} />
          <ExportImageButton onClick={() => setIsExportModalOpen(true)} />
          {isPublicView !== undefined &&
            snippetId !== undefined &&
            fragmentId !== undefined && (
              <RawButton
                isPublicView={isPublicView}
                snippetId={snippetId}
                fragmentId={fragmentId}
              />
            )}
        </div>
      </div>

      <ExportImageModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        code={code}
        language={language}
      />
    </div>
  );
};
