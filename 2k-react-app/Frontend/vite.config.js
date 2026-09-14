import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
   if (command === 'build') {
      const apiBaseUrl = loadEnv(mode, process.cwd(), '').VITE_API_BASE_URL?.trim();

      if (!apiBaseUrl || new URL(apiBaseUrl).protocol !== 'https:') {
         throw new Error('VITE_API_BASE_URL must be configured with an HTTPS URL for production builds');
      }
   }

   return {
      base: './',
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
   };
});
