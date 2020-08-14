module.exports = {
  endOfLine: 'lf',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: "all",
  printWidth: 120,
  overrides: [
    {
      files: ".editorconfig",
      options: { parser: "yaml" },
    },
    {
      files: ["CODE-OF-CONDUCT.md", "CONTRIBUTING.md", "LICENSE.md", "README.md"],
      options: { parser: "markdown" },
    },
  ],
}