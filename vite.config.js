import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/workExc/',  
  build: {
    outDir: 'dist', // This ensures the build output goes to the dist folder
  },
})

