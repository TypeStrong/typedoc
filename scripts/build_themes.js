// @ts-check
const esbuild = require("esbuild");
const fs = require("fs");

const watch = process.argv.slice(2).includes("--watch");

// It's convenient to be able to build the themes in watch mode without rebuilding the whole docs
// to test some change to the frontend JS.
/** @type {esbuild.Plugin} */
const copyToDocsPlugin = {
    name: "copyToDocs",
    setup(build) {
        if (watch) {
            build.onEnd(() => {
                if (fs.existsSync("docs/assets/main.js")) {
                    fs.copyFileSync("static/main.js", "docs/assets/main.js");
                }
            });
        }
    },
};

async function main() {
    const context = await esbuild.context({
        entryPoints: ["src/lib/output/themes/default/assets/bootstrap.ts"],
        bundle: true,
        minify: true,
        outfile: "static/main.js",
        logLevel: "info",
        plugins: [copyToDocsPlugin],
    });

    await context.rebuild();

    if (watch) {
        await context.watch();
    } else {
        await context.dispose();
    }
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
