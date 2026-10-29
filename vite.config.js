import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy third-party libraries into their own vendor chunks.
        // These libs are large enough on their own to blow the entry chunk
        // past Vite's 500kB warning; pulling them out means:
        //  - the entry chunk (App shell: Navbar/Footer/SmoothScroll/
        //    CustomCursor/AuthContext, all mounted unconditionally) shrinks
        //  - vendor code changes far less often than app code, so these
        //    chunks stay cached across deploys instead of being re-fetched
        //    every time app code changes
        //  - libs only used by lazy routes (recharts, jspdf) stay lazy —
        //    manualChunks just gives them a stable, predictable chunk name
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('framer-motion')) return 'vendor-framer-motion';
          if (id.includes('/gsap/')) return 'vendor-gsap';
          if (id.includes('/lenis/') || id.includes('@studio-freight')) return 'vendor-lenis';
          if (id.includes('lucide-react')) return 'vendor-lucide';

          // Deliberately NOT forcing recharts/d3/jspdf into manual chunks:
          // both are only ever reached via dynamic import() (lazy routes /
          // an on-demand PDF export), so Rollup already gives them their
          // own chunk boundaries and — better — splits recharts' internals
          // per actual usage overlap between pages (e.g. it inlines
          // page-specific chart modules directly into that page's chunk
          // when no other chunk shares them, instead of one shared blob).
          // Forcing a single 'vendor-recharts' bucket here was tried and
          // made things worse: it merged usage-specific slices back into
          // one ~530kB chunk, larger than any of the pieces Rollup split
          // out on its own.
          return undefined;
        },
      },
    },
  },
});
