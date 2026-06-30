import js from '@eslint/js';

const browserGlobals = {
    window: 'readonly',
    document: 'readonly',
    navigator: 'readonly',
    localStorage: 'readonly',
    sessionStorage: 'readonly',
    fetch: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    requestAnimationFrame: 'readonly',
    CustomEvent: 'readonly',
    console: 'readonly',
    Tone: 'readonly',
};

const nodeGlobals = {
    process: 'readonly',
    console: 'readonly',
    Response: 'readonly',
    Request: 'readonly',
    fetch: 'readonly',
    URL: 'readonly',
};

export default [
    js.configs.recommended,
    {
        files: ['**/*.js'],
        ignores: ['api/**/*.js'],
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off',
            eqeqeq: ['warn', 'always'],
            'no-var': 'error',
            'prefer-const': 'warn',
        },
        languageOptions: {
            globals: browserGlobals,
        },
    },
    {
        files: ['api/**/*.js'],
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off',
            eqeqeq: ['warn', 'always'],
            'no-var': 'error',
            'prefer-const': 'warn',
        },
        languageOptions: {
            globals: nodeGlobals,
        },
    },
];

