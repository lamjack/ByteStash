import { forwardRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useTheme } from '../../../contexts/ThemeContext';
import { syntaxThemeFor } from '../../../utils/editor/syntaxThemes';

export interface CarbonExportPreviewProps {
  code: string;
  language: string;
  showLineNumbers: boolean;
}

export const CarbonExportPreview = forwardRef<HTMLDivElement, CarbonExportPreviewProps>(
  ({ code, language, showLineNumbers }, ref) => {
    const { effectiveTheme, colorTheme } = useTheme();
    const isDark = effectiveTheme === 'dark';
    const syntaxTheme = syntaxThemeFor(isDark, colorTheme);
    const windowBackground = colorTheme ? colorTheme.editor.surface : isDark ? '#1E1E1E' : '#ffffff';
    const titleBarBackground = colorTheme ? colorTheme.ui.bg : isDark ? '#2D2D2D' : '#f5f5f5';
    const titleBarBorder = colorTheme ? colorTheme.ui.border : isDark ? '#404040' : '#e5e5e5';

    return (
      <div 
        ref={ref} 
        className="p-8 flex items-center justify-center font-sans"
        style={{
          background: 'linear-gradient(140deg, rgb(142, 197, 252), rgb(224, 195, 252))',
          width: 'max-content',
          minWidth: '600px',
        }}
      >
        <div 
          className="rounded-xl overflow-hidden shadow-2xl flex flex-col w-full"
          style={{
            backgroundColor: windowBackground,
            boxShadow: 'rgba(0, 0, 0, 0.55) 0px 20px 68px'
          }}
        >
          {/* macOS window controls */}
          <div 
            className="flex items-center h-10 px-4"
            style={{ 
              backgroundColor: titleBarBackground,
              borderBottom: `1px solid ${titleBarBorder}`
            }}
          >
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            </div>
          </div>
          
          {/* Code content */}
          <div className="p-4 text-sm" style={{ maxHeight: 'none', overflow: 'visible' }}>
            <SyntaxHighlighter
              language={language.toLowerCase()}
              style={syntaxTheme}
              showLineNumbers={showLineNumbers}
              customStyle={{
                margin: 0,
                padding: 0,
                background: 'transparent',
                overflow: 'visible'
              }}
              codeTagProps={{
                style: {
                  fontFamily: '"SF Mono", "Fira Code", format, Consolas, "Liberation Mono", Menlo, Courier, monospace',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    );
  }
);

CarbonExportPreview.displayName = 'CarbonExportPreview';
