export const languages = {
  register: () => {},
  setMonarchTokensProvider: () => {},
  setLanguageConfiguration: () => {},
  registerCompletionItemProvider: () => ({ dispose() {} }),
  getLanguages: () => [],
};

export const editor = {
  defineTheme: () => {},
  setTheme: () => {},
};

export default { languages, editor };
