await Bun.build({
  entrypoints: [import.meta.dir + '/server.ts'],
  outdir: './dist', // Changed from '../dist' to './dist'
  minify: true,
  target: 'node',
  splitting: true,
  format: 'esm', // Explicitly set ESM format
  throw: true,
  external: ['@open-gsio/client'], // Mark client as external to avoid bundling issues
});
