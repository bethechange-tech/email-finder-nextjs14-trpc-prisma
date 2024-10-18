import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        setupFiles: './test/setup.ts', // Setup file to initialize Testcontainers
        environment: 'node',
    },
});
