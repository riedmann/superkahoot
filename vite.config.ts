import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    host: true, // Allow connections from external devices
    port: 5173, // Specify port (optional, but good to be explicit)
  },
});
