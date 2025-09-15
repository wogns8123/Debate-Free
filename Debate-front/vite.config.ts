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
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            // '/api' 경로는 이미 설정되어 있으니, '/ws'도 동일하게 처리
            '/ws': {
                // 🟢 '/ws' 경로도 프록시 설정 추가
                target: 'http://localhost:8080',
                changeOrigin: true,
                ws: true, // WebSocket 프록시를 위해 true로 설정
            },
            '/api': {
                // 기존 API 프록시 설정 유지
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
        },
    },
});
