import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- This is what is failing

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})