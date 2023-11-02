module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    settings: {
        react: {
            version: 'detect',
        },
        'import/resolver': {
            node: {
                paths: ['src'],
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    },
    env: {
        browser: true,
        amd: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:prettier/recommended', // Make sure this is always the last element in the array.
    ],
    plugins: ['prettier'],
    rules: {
        'prettier/prettier': ['warn', {}, { usePrettierrc: true }],
        'react/react-in-jsx-scope': 'warn',
        'react/prop-types': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off',
        'no-unused-vars': 'off', // use @typescript-eslint/no-unused-vars, not base rule
        '@typescript-eslint/no-unused-vars': 'warn',
    },
};
