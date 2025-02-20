import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import dotenv from 'dotenv';
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDirectory = path.join(__dirname, "src/frontend");
const isDevelopment = process.env.DFX_NETWORK !== "ic";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/frontend/src"),
    },
  },
  root: frontendDirectory,
  define: {
    global: 'globalThis',
    'import.meta.env.VITE_DFX_NETWORK': JSON.stringify(isDevelopment ? "local" : "ic"),
    // Use the actual canister IDs from dfx deploy output
    'import.meta.env.VITE_INTERNET_IDENTITY_CANISTER_ID': JSON.stringify("bkyz2-fmaaa-aaaaa-qaaaq-cai"),
    'import.meta.env.VITE_CHAINCYCLE_BACKEND_CANISTER_ID': JSON.stringify("be2us-64aaa-aaaaa-qaabq-cai"),
    'import.meta.env.VITE_CHAINCYCLE_FRONTEND_CANISTER_ID': JSON.stringify("br5f7-7uaaa-aaaaa-qaaca-cai"),
    'import.meta.env.VITE_GTK_TOKEN_CANISTER_ID': JSON.stringify("bw4dl-smaaa-aaaaa-qaacq-cai"),
    'import.meta.env.VITE_MARKETPLACE_CANISTER_ID': JSON.stringify("b77ix-eeaaa-aaaaa-qaada-cai"),
    'import.meta.env.VITE_USER_PROFILE_CANISTER_ID': JSON.stringify("by6od-j4aaa-aaaaa-qaadq-cai"),
  },
  server: {
    host: 'localhost',
    port: 5173,
    proxy: isDevelopment
      ? {
          "/api": {
            target: "http://127.0.0.1:4943",
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, '')
          },
          "/.well-known/ii-alternative-origins": {
            target: "http://127.0.0.1:4943",
            changeOrigin: true,
          },
          "/api/v2/canister": {
            target: "http://127.0.0.1:4943",
            changeOrigin: true,
          },
          "/authorize": {
            target: "http://127.0.0.1:4943",
            changeOrigin: true,
          },
          "/?canisterId=bkyz2-fmaaa-aaaaa-qaaaq-cai": {
            target: "http://127.0.0.1:4943",
            changeOrigin: true,
          }
        }
      : undefined,
    strictPort: true,
    hmr: {
      clientPort: 5173
    }
  },
  build: {
    outDir: path.join(__dirname, "dist", "frontend"),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'auth': ['@dfinity/auth-client', '@dfinity/agent', '@dfinity/principal'],
          'react': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
});
