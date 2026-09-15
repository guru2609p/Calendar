import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 59985, // Retains your exact port assignment
        https: false // Forces the protocol back to HTTP
    }
});
