import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async () => {
  const plugins = [react()];
  const runtimeErrorOverlayModule: string =
    "@replit/vite-plugin-runtime-error-modal";
  const cartographerModule: string = "@replit/vite-plugin-cartographer";

  try {
    const { default: runtimeErrorOverlay } = await import(
      runtimeErrorOverlayModule
    );
    plugins.push(runtimeErrorOverlay());
  } catch {
    // Keep config loadable in environments where the Replit plugin is absent.
  }

  if (
    process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
  ) {
    try {
      const { cartographer } = await import(cartographerModule);
      plugins.push(cartographer());
    } catch {
      // Keep the config usable without the optional cartographer plugin.
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
