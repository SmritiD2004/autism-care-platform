// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': resolve(__dirname, 'src/components'),
      '@contexts'  : resolve(__dirname, 'src/contexts'),
      '@pages'     : resolve(__dirname, 'src/pages'),
      '@router'    : resolve(__dirname, 'src/router'),
      '@services'  : resolve(__dirname, 'src/services'),
      '@utils'     : resolve(__dirname, 'src/utils'),
      '@styles'    : resolve(__dirname, 'src/styles'),
    },
  },
});
