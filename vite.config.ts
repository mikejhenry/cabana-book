import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ============================================================
// VITE CONFIG — CabanaBook
// Sets up React, path aliases (@/ → src/), and build output.
// ============================================================
export default defineConfig({
  plugins: [react()],
  resolve: {
    // "@/components/..." resolves to "src/components/..."
    // This keeps imports clean and avoids deep relative paths.
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Output to "dist" — what Netlify will deploy
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production for security
  },
  server: {
    port: 3000, // Dev server runs on http://localhost:3000
  },
})
