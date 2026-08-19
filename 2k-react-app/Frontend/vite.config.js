import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
   plugins: [react()],
   server: {
      host: '0.0.0.0',
      port: 5173,
      watch: {
         usePolling: true,
         ignored: ['**/Screenshot_2026-08-13_171825.png'],
      },
   },
   preview: {
      host: '0.0.0.0',
      port: 4173,
   },
});
