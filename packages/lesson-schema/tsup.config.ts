import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["cjs", "esm"],
  outDir: "./dist",
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  external: ["zod"],
  minify: false,
});
