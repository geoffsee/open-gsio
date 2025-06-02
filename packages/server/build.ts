// handles builds the server into js
await Bun.build({
    entrypoints: [
        "./server.ts",
    ],
    outdir: './build',
    minify: true,
    target: 'node',
    splitting: true,
    throw: true
});