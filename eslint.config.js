import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off',
            eqeqeq: ['warn', 'always'],
            'no-var': 'error',
            'prefer-const': 'warn',
        },
        languageOptions: {
            globals: {
                window: 'readonly',
                document: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                Tone: 'readonly',
            },
        },
    },
];
