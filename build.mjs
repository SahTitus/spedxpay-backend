import esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/server.ts'],     // ← your entry point
  bundle: true,
  platform: 'node',
  target: 'node20',                   // Node 23.6.0 works with node20
  outfile: 'dist/index.js',
  format: 'esm',
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production',
  packages: 'external',
  banner: {                           // ← Fixed: added quotes around 'js'
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
  },
  alias: {
    '@': './src',                     // ← fixes all @/ imports
  },
  loader: {
    '.ts': 'ts',
  },
})

console.log('Build complete → dist/index.js')