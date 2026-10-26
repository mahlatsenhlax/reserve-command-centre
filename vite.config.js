import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base must match the GitHub repo name so assets load on GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/reserve-command-centre/',
});
