import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url"; // Required to calculate the directory path safely
import path from "path";

// Manually compute __dirname for modern ES Module compliance
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load environment variables from `.env`, `.env.local`, etc.
  const env = loadEnv(mode, process.cwd(), "");

  // Safe handling of allowed hosts
  const allowedHosts = env.VITE_ALLOWED_HOSTS
    ? env.VITE_ALLOWED_HOSTS.split(",")
    : "testing-universal-qr.ai.dkcexportstna.in,vishal.local,universal-qr.ai.dkcexportstna.in,**.trycloudflare.com"; // fallback to allow all if not set

  // Log allowed hosts to verify
  console.log("Vite allowed hosts:", allowedHosts);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"), // Now works perfectly!
      },
    },

    server: {
      port: 3001,
      allowedHosts,
    },
  };
});