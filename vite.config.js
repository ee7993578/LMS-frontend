import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Target modern browsers — smaller output
    target: 'es2020',
    // Raise chunk size warning limit (recharts is large)
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Manual chunk splitting — vendor libs load once and cache forever
        manualChunks: {
          // React core
          'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
          // Charts — heaviest library, split out
          'vendor-charts':  ['recharts'],
          // UI libs
          'vendor-ui':      ['framer-motion', 'lucide-react', 'react-hot-toast'],
          // Utils
          'vendor-utils':   ['axios', 'jwt-decode', 'date-fns', 'clsx'],
        },
      },
    },
    // Generate source maps only in dev
    sourcemap: false,
    // Minify with esbuild (default, fast)
    minify: 'esbuild',
  },

  // Optimize deps — pre-bundle heavy libs so dev server starts faster
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      'recharts', 'axios', 'lucide-react',
      'react-hot-toast', 'jwt-decode', 'clsx', 'date-fns',
    ],
  },

  server: {
    port: 5173,
    // Proxy API calls to backend in dev — no CORS issues
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
