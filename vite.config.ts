import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // El dominio es puro: los tests corren en Node, sin DOM.
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
