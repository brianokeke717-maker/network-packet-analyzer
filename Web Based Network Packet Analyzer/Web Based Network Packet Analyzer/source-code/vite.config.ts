import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Inline the sql-wasm.wasm binary as a base64 data URL so the build is
 * 100% self-contained and works completely offline.
 */
function inlineWasmPlugin(): Plugin {
  return {
    name: "inline-wasm",
    generateBundle(_opts, bundle) {
      const wasmPath = path.resolve(
        __dirname,
        "node_modules/sql.js/dist/sql-wasm.wasm"
      );
      const wasmBase64 = fs.readFileSync(wasmPath).toString("base64");
      const dataUrl = `data:application/wasm;base64,${wasmBase64}`;

      // Replace the /sql-wasm.wasm path reference with the inline data URL
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === "chunk" && chunk.code.includes("/sql-wasm.wasm")) {
          chunk.code = chunk.code.split('"/sql-wasm.wasm"').join(
            JSON.stringify(dataUrl)
          );
        }
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), inlineWasmPlugin(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    assetsInlineLimit: 100_000_000,
  },
});
