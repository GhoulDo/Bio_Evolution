import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: true
    }
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'geo-vendor': ['proj4', '@turf/turf']
        }
      }
    }
  },
  
  publicDir: 'public',
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  
  optimizeDeps: {
    include: ['leaflet', 'proj4', '@turf/turf', 'react-leaflet']
  }
})
