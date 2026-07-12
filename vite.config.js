import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    root: '.',
    base: './',
    resolve: {
        alias: {
            '@': resolve(__dirname, 'app/src'),
        },
    },
    server: {
        port: 5173,
        host: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
        },
    },

    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                app: resolve(__dirname, 'app/index.html'),
                painel: resolve(__dirname, 'painel-x9k2f.html'),
                academic: resolve(__dirname, 'academic/index.html'),
                commercial: resolve(__dirname, 'commercial/index.html'),
            },
        },
    },
});
