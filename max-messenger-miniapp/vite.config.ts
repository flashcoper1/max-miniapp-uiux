// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    // --- КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ ---
    // Эта секция принудительно заставляет Vite использовать
    // только одну копию указанных пакетов.
    resolve: {
        dedupe: ['react', 'react-dom'],
    },
})