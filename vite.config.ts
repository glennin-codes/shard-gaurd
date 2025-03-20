// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
// import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { 
    allowedHosts: true,
    hmr: { overlay: false }, // Disable HMR overlay to reduce overhead
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'ethers', 'secrets.js-grempe']
  },
  build: {
    reportCompressedSize: false, // Improve build performance
  },
  logLevel: 'info', // Show more logs
});