import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    plugins: [react(), tailwindcss()],
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
      minify: isProduction ? 'terser' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'utils-vendor': ['axios', 'zustand', 'i18next', 'react-i18next'],
          },
        },
      },
    },
    // ✅ إضافة axios إلى optimizeDeps
    optimizeDeps: {
      include: ['axios', 'react', 'react-dom', 'react-router-dom'],
      exclude: ['@react-three/fiber', '@react-three/drei'],
    },
    define: {
      __DEV__: !isProduction,
    },
  };
});
