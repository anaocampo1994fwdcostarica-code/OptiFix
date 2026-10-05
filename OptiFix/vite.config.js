import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // JSON Server persiste cada POST modificando db.json. Vite no debe tratar
    // esa escritura como un cambio de código ni recargar la pantalla activa.
    watch: {
      ignored: ["**/db.json"],
    },
  },
});
