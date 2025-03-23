import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import vueDevTools from 'vite-plugin-vue-devtools';
import svgLoader from 'vite-svg-loader';

// https://vite.dev/config/
export default defineConfig({
  appType: 'custom',
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    svgLoader(),
    dts({
      insertTypesEntry: true, // Create a `types` entry in package.json
      rollupTypes: true, // Bundle .d.ts files into a single declaration file
    }),
  ],
  build: {
    sourcemap: true,
    minify: 'esbuild',
    emptyOutDir: true,
    target: 'modules',
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        composables: resolve(__dirname, 'src/composables/index.ts'),
      },
    },
    rollupOptions: {
      external: ['vue', 'rxjs', 'livekit-client', '@livekit/components-core'],
      output: [
        {
          format: 'es',
          entryFileNames: '[name].mjs', // Use .mjs for ESM
          chunkFileNames: '[name]-[hash].mjs',
          manualChunks: {
            contexts: ['src/context/index.ts'],
            composables: ['src/composables/index.ts'],
            components: ['src/components/index.ts'],
          },
        },
        {
          format: 'cjs',
          entryFileNames: '[name].js', // Use .js for CJS
          chunkFileNames: 'shared-[hash].js',
          dir: 'dist',
        },
      ],
    },
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
