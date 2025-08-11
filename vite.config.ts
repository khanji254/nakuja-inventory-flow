import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins = [react()];

  if (mode === "development") {
    try {
      const taggerPkg = "lovable-tagger"; // use variable so bundlers don't rewrite to require()
      const { componentTagger } = await import(taggerPkg);
      plugins.push(componentTagger());
    } catch (err) {
      console.warn("Skipping lovable-tagger (dev-only).", (err as any)?.message || err);
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
