import * as path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: 'build',
        rollupOptions: {
            external: ['@cloudscape-design/{}-styles/index.css', '@cloudscape-design/{}-styles'],
        },
    },
    plugins: [react()],
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
