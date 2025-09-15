import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // '/api' 요청을 Spring Boot 서버로 프록시
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // WebSocket 연결을 위한 '/ws' 경로도 프록시 설정
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true, // WebSocket 프록시 활성화
      },
    },
  },
});