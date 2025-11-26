import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/server.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  outfile: "dist/index.js",
  format: "esm",
  sourcemap: false,
  minify: false,
  packages: "external",
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
  },
  alias: {
    "@": "./src",
  },
});

console.log("Build successful: dist/index.js created");
