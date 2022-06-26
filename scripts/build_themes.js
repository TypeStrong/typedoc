const esbuild = require("esbuild");

esbuild.buildSync({
    entryPoints: ["src/lib/output/themes/default/assets/bootstrap.ts"],
    bundle: true,
    minify: true,
    outfile: "static/main.js",
    banner: {
        js: '"use strict";',
    },
    logLevel: "info",
});
