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
      // ✅ تعطيل HMR في الإنتاج
      hmr: !isProduction,
      // ✅ تعطيل المراقبة في الإنتاج لتجنب EMFILE
      watch: isProduction ? null : {
        usePolling: false,
        ignored: ['**/node_modules/**', '**/dist/**', '**/*.log'],
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : false,
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      } : {},
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'ui-vendor': ['@react-three/fiber', '@react-three/drei'],
            'utils-vendor': ['axios', 'zustand', 'i18next', 'react-i18next'],
          },
        },
      },
      chunkSizeWarningLimit: 300,
    },
    optimizeDeps: {
      exclude: ['@react-three/fiber', '@react-three/drei', 'three'],
    },
    // ✅ تجاهل الملفات أثناء البناء
    define: {
      __DEV__: !isProduction,
    },
  };
});
