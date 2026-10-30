// Named color themes modelled on popular developer editor themes. Each one
// drives the app UI (via CSS variables consumed by the Tailwind palette), the
// Monaco editor and the Prism highlighter used for image export.

export const COLOR_THEME_IDS = [
  'dracula',
  'one-dark',
  'monokai',
  'nord',
  'solarized-dark',
  'solarized-light',
  'gruvbox-dark',
  'tokyo-night',
  'catppuccin-mocha',
  'github-light',
] as const;

export type ColorThemeId = (typeof COLOR_THEME_IDS)[number];

export interface ColorTheme {
  id: ColorThemeId;
  label: string;
  base: 'light' | 'dark';
  ui: {
    bg: string;
    surface: string;
    border: string;
    text: string;
    textSecondary: string;
    primary: string;
    hover: string;
    hoverMore: string;
  };
  editor: {
    surface: string;
    lineHighlight: string;
    lineNumber: string;
    activeLineNumber: string;
    selection: string;
  };
  syntax: {
    comment: string;
    keyword: string;
    string: string;
    number: string;
    function: string;
    type: string;
    variable: string;
    constant: string;
    operator: string;
    punctuation: string;
    tag: string;
    attribute: string;
    regexp: string;
  };
}

export const COLOR_THEMES: Record<ColorThemeId, ColorTheme> = {
  dracula: {
    id: 'dracula',
    label: 'Dracula',
    base: 'dark',
    ui: {
      bg: '#21222c',
      surface: '#282a36',
      border: '#44475a',
      text: '#f8f8f2',
      textSecondary: '#a4a9c8',
      primary: '#8b5fd9',
      hover: '#44475a',
      hoverMore: '#565a73',
    },
    editor: {
      surface: '#282a36',
      lineHighlight: '#343746',
      lineNumber: '#6272a4',
      activeLineNumber: '#f8f8f2',
      selection: '#44475a',
    },
    syntax: {
      comment: '#6272a4',
      keyword: '#ff79c6',
      string: '#f1fa8c',
      number: '#bd93f9',
      function: '#50fa7b',
      type: '#8be9fd',
      variable: '#f8f8f2',
      constant: '#bd93f9',
      operator: '#ff79c6',
      punctuation: '#f8f8f2',
      tag: '#ff79c6',
      attribute: '#50fa7b',
      regexp: '#ff5555',
    },
  },
  'one-dark': {
    id: 'one-dark',
    label: 'One Dark',
    base: 'dark',
    ui: {
      bg: '#21252b',
      surface: '#282c34',
      border: '#3e4451',
      text: '#d7dae0',
      textSecondary: '#9da5b4',
      primary: '#4d78cc',
      hover: '#3e4451',
      hoverMore: '#4b5263',
    },
    editor: {
      surface: '#282c34',
      lineHighlight: '#2c313c',
      lineNumber: '#636d83',
      activeLineNumber: '#abb2bf',
      selection: '#3e4451',
    },
    syntax: {
      comment: '#7f848e',
      keyword: '#c678dd',
      string: '#98c379',
      number: '#d19a66',
      function: '#61afef',
      type: '#e5c07b',
      variable: '#e06c75',
      constant: '#d19a66',
      operator: '#56b6c2',
      punctuation: '#abb2bf',
      tag: '#e06c75',
      attribute: '#d19a66',
      regexp: '#56b6c2',
    },
  },
  monokai: {
    id: 'monokai',
    label: 'Monokai',
    base: 'dark',
    ui: {
      bg: '#1e1f1c',
      surface: '#272822',
      border: '#3e3d32',
      text: '#f8f8f2',
      textSecondary: '#a59f85',
      primary: '#c7215d',
      hover: '#3e3d32',
      hoverMore: '#49483e',
    },
    editor: {
      surface: '#272822',
      lineHighlight: '#3e3d32',
      lineNumber: '#90908a',
      activeLineNumber: '#f8f8f2',
      selection: '#49483e',
    },
    syntax: {
      comment: '#88846f',
      keyword: '#f92672',
      string: '#e6db74',
      number: '#ae81ff',
      function: '#a6e22e',
      type: '#66d9ef',
      variable: '#f8f8f2',
      constant: '#ae81ff',
      operator: '#f92672',
      punctuation: '#f8f8f2',
      tag: '#f92672',
      attribute: '#a6e22e',
      regexp: '#e6db74',
    },
  },
  nord: {
    id: 'nord',
    label: 'Nord',
    base: 'dark',
    ui: {
      bg: '#2e3440',
      surface: '#3b4252',
      border: '#4c566a',
      text: '#eceff4',
      textSecondary: '#b6bfcf',
      primary: '#5e81ac',
      hover: '#434c5e',
      hoverMore: '#4c566a',
    },
    editor: {
      surface: '#2e3440',
      lineHighlight: '#3b4252',
      lineNumber: '#616e88',
      activeLineNumber: '#d8dee9',
      selection: '#434c5e',
    },
    syntax: {
      comment: '#7b88a1',
      keyword: '#81a1c1',
      string: '#a3be8c',
      number: '#b48ead',
      function: '#88c0d0',
      type: '#8fbcbb',
      variable: '#d8dee9',
      constant: '#b48ead',
      operator: '#81a1c1',
      punctuation: '#eceff4',
      tag: '#81a1c1',
      attribute: '#8fbcbb',
      regexp: '#ebcb8b',
    },
  },
  'solarized-dark': {
    id: 'solarized-dark',
    label: 'Solarized Dark',
    base: 'dark',
    ui: {
      bg: '#002b36',
      surface: '#073642',
      border: '#1d4f5c',
      text: '#eee8d5',
      textSecondary: '#93a1a1',
      primary: '#268bd2',
      hover: '#11434f',
      hoverMore: '#1d5866',
    },
    editor: {
      surface: '#002b36',
      lineHighlight: '#073642',
      lineNumber: '#586e75',
      activeLineNumber: '#93a1a1',
      selection: '#274642',
    },
    syntax: {
      comment: '#6b8289',
      keyword: '#859900',
      string: '#2aa198',
      number: '#d33682',
      function: '#268bd2',
      type: '#b58900',
      variable: '#93a1a1',
      constant: '#cb4b16',
      operator: '#859900',
      punctuation: '#93a1a1',
      tag: '#268bd2',
      attribute: '#b58900',
      regexp: '#dc322f',
    },
  },
  'solarized-light': {
    id: 'solarized-light',
    label: 'Solarized Light',
    base: 'light',
    ui: {
      bg: '#fdf6e3',
      surface: '#eee8d5',
      border: '#d9d2bc',
      text: '#073642',
      textSecondary: '#586e75',
      primary: '#268bd2',
      hover: '#e2dbc4',
      hoverMore: '#f6f0dd',
    },
    editor: {
      surface: '#fdf6e3',
      lineHighlight: '#eee8d5',
      lineNumber: '#93a1a1',
      activeLineNumber: '#586e75',
      selection: '#e6dfc8',
    },
    syntax: {
      comment: '#93a1a1',
      keyword: '#859900',
      string: '#2aa198',
      number: '#d33682',
      function: '#268bd2',
      type: '#b58900',
      variable: '#657b83',
      constant: '#cb4b16',
      operator: '#859900',
      punctuation: '#657b83',
      tag: '#268bd2',
      attribute: '#b58900',
      regexp: '#dc322f',
    },
  },
  'gruvbox-dark': {
    id: 'gruvbox-dark',
    label: 'Gruvbox Dark',
    base: 'dark',
    ui: {
      bg: '#1d2021',
      surface: '#282828',
      border: '#3c3836',
      text: '#ebdbb2',
      textSecondary: '#a89984',
      primary: '#d65d0e',
      hover: '#3c3836',
      hoverMore: '#504945',
    },
    editor: {
      surface: '#282828',
      lineHighlight: '#32302f',
      lineNumber: '#7c6f64',
      activeLineNumber: '#ebdbb2',
      selection: '#504945',
    },
    syntax: {
      comment: '#928374',
      keyword: '#fb4934',
      string: '#b8bb26',
      number: '#d3869b',
      function: '#fabd2f',
      type: '#83a598',
      variable: '#ebdbb2',
      constant: '#d3869b',
      operator: '#fe8019',
      punctuation: '#a89984',
      tag: '#fb4934',
      attribute: '#8ec07c',
      regexp: '#fe8019',
    },
  },
  'tokyo-night': {
    id: 'tokyo-night',
    label: 'Tokyo Night',
    base: 'dark',
    ui: {
      bg: '#16161e',
      surface: '#1a1b26',
      border: '#292e42',
      text: '#c0caf5',
      textSecondary: '#9aa5ce',
      primary: '#3d59a1',
      hover: '#292e42',
      hoverMore: '#3b4261',
    },
    editor: {
      surface: '#1a1b26',
      lineHighlight: '#1f2335',
      lineNumber: '#565f89',
      activeLineNumber: '#c0caf5',
      selection: '#283457',
    },
    syntax: {
      comment: '#565f89',
      keyword: '#bb9af7',
      string: '#9ece6a',
      number: '#ff9e64',
      function: '#7aa2f7',
      type: '#2ac3de',
      variable: '#c0caf5',
      constant: '#ff9e64',
      operator: '#89ddff',
      punctuation: '#a9b1d6',
      tag: '#f7768e',
      attribute: '#bb9af7',
      regexp: '#b4f9f8',
    },
  },
  'catppuccin-mocha': {
    id: 'catppuccin-mocha',
    label: 'Catppuccin Mocha',
    base: 'dark',
    ui: {
      bg: '#181825',
      surface: '#1e1e2e',
      border: '#313244',
      text: '#cdd6f4',
      textSecondary: '#a6adc8',
      primary: '#8839ef',
      hover: '#313244',
      hoverMore: '#45475a',
    },
    editor: {
      surface: '#1e1e2e',
      lineHighlight: '#2a2b3c',
      lineNumber: '#6c7086',
      activeLineNumber: '#b4befe',
      selection: '#45475a',
    },
    syntax: {
      comment: '#9399b2',
      keyword: '#cba6f7',
      string: '#a6e3a1',
      number: '#fab387',
      function: '#89b4fa',
      type: '#f9e2af',
      variable: '#cdd6f4',
      constant: '#fab387',
      operator: '#89dceb',
      punctuation: '#9399b2',
      tag: '#89b4fa',
      attribute: '#f9e2af',
      regexp: '#f5c2e7',
    },
  },
  'github-light': {
    id: 'github-light',
    label: 'GitHub Light',
    base: 'light',
    ui: {
      bg: '#ffffff',
      surface: '#f6f8fa',
      border: '#d0d7de',
      text: '#1f2328',
      textSecondary: '#59636e',
      primary: '#0969da',
      hover: '#d8dee4',
      hoverMore: '#eef1f4',
    },
    editor: {
      surface: '#f6f8fa',
      lineHighlight: '#eaeef2',
      lineNumber: '#8c959f',
      activeLineNumber: '#1f2328',
      selection: '#cce4ff',
    },
    syntax: {
      comment: '#59636e',
      keyword: '#cf222e',
      string: '#0a3069',
      number: '#0550ae',
      function: '#8250df',
      type: '#953800',
      variable: '#1f2328',
      constant: '#0550ae',
      operator: '#cf222e',
      punctuation: '#1f2328',
      tag: '#116329',
      attribute: '#0550ae',
      regexp: '#116329',
    },
  },
};

export const isColorThemeId = (value: unknown): value is ColorThemeId =>
  typeof value === 'string' && (COLOR_THEME_IDS as readonly string[]).includes(value);

export const getColorTheme = (value: unknown): ColorTheme | null =>
  isColorThemeId(value) ? COLOR_THEMES[value] : null;

export const monacoThemeName = (id: ColorThemeId) => `bytestash-${id}`;

const UI_VARIABLES: Record<keyof ColorTheme['ui'], string> = {
  bg: 'bg',
  surface: 'surface',
  border: 'border',
  text: 'text',
  textSecondary: 'text-secondary',
  primary: 'primary',
  hover: 'hover',
  hoverMore: 'hover-more',
};

// "#rrggbb" -> "r g b", the format Tailwind's <alpha-value> placeholder needs.
export const hexToRgbChannels = (hex: string): string => {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
};

// The CSS custom properties a theme overrides. Both the light-* and dark-*
// palettes are pointed at the theme so every `x dark:y` class pair resolves to
// the same color no matter which half applies.
export const colorThemeCssVariables = (theme: ColorTheme): Record<string, string> => {
  const variables: Record<string, string> = {};
  for (const [key, name] of Object.entries(UI_VARIABLES)) {
    const channels = hexToRgbChannels(theme.ui[key as keyof ColorTheme['ui']]);
    variables[`--color-light-${name}`] = channels;
    variables[`--color-dark-${name}`] = channels;
  }
  return variables;
};
