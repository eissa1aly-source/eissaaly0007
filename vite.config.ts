import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: !isProduction,
      watch: isProduction ? null : {
        usePolling: false,
        ignored: ['**/node_modules/**', '**/dist/**'],
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      // ✅ تعطيل minify لتجنب مشكلة terser
      minify: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'utils-vendor': ['axios', 'zustand', 'i18next', 'react-i18next'],
          },
        },
      },
      chunkSizeWarningLimit: 300,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'axios'],
    },
    define: {
      __DEV__: !isProduction,
    },
  };
});
