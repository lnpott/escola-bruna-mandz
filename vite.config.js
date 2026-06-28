import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    base: './',
    server: {
        port: 5173,
        host: true,
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                // Painel admin escondido — precisa ser listado aqui para o Vite
                // incluí-lo no build. Se você renomear o arquivo, atualize aqui também.
                painel: resolve(__dirname, 'painel-x9k2f.html'),
            },
        },
    },
});

