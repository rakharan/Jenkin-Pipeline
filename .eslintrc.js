// .eslintrc.js

module.exports = {
    root: true,
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser for TypeScript
    plugins: [
        '@typescript-eslint', // Adds TypeScript-specific linting rules
    ],
    extends: [
        'eslint:recommended', // Use the recommended base rules from ESLint
        'plugin:@typescript-eslint/recommended', // Use the recommended rules from the @typescript-eslint/eslint-plugin
    ],
    env: {
        node: true, // Enable Node.js global variables and Node.js scoping.
        es2021: true, // Add globals for ES2021.
    },
};