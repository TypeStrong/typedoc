const esbuild = require("esbuild");

esbuild
    .build({
        entryPoints: ["src/lib/output/themes/default/assets/bootstrap.ts"],
        bundle: true,
        minify: true,
        outfile: "static/main.js",
        banner: {
            js: '"use strict";',
        },
        logLevel: "info",
        watch: process.argv.slice(2).includes("--watch"),
    })
    .catch((err) => {
        console.error(err);
        process.exitCode = 1;
    });
