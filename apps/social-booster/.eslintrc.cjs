module.exports = {
 root: true,
 env: {
 browser: true,
 es2022: true,
 node: true,
 },
 parser: "@typescript-eslint/parser",
 parserOptions: {
 ecmaVersion: "latest",
 sourceType: "module",
 },
 plugins: ["@typescript-eslint"],
 extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
 ignorePatterns: ["dist/", "build/", "node_modules/"],
 rules: {
 "@typescript-eslint/no-explicit-any": "off",
 "@typescript-eslint/no-unused-vars": [
 "warn",
 {
 argsIgnorePattern: "^_",
 varsIgnorePattern: "^_"
 }
 ]
 }
};
