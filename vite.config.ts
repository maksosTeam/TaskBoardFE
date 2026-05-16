/// <reference types="node" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {


  const API = process.env.SERVER_API_URL;

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: API,
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
      host: "0.0.0.0",
      port: 5173,
      protocol: 'wss',
      allowedHosts: [
        "project-domain.ru",
        "localhost",
      ],
      hmr: true,
    },
  };
});
