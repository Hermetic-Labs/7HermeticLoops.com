import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-identifier'

const isProd = process.env.BUILD_MODE === 'prod'
// In production, the app is mounted on the 7hermeticloops.com apex domain, so we use the root path
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    sourceIdentifierPlugin({
      enabled: !isProd,
      attributePrefix: 'data-matrix',
      includeProps: true,
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Deduplicate Three.js and related packages to prevent "Multiple instances" warning
    dedupe: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/xr',
      'react',
      'react-dom',
    ],
  },
  server: {
    port: 5174,
    strictPort: true,
  },
  preview: {
    port: 5174,
  },
})
