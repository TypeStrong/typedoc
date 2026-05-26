// @ts-check
//
// Bundle typedoc's CLI entry point into a single file via esbuild.
//
// Why this exists: typedoc's compiled output uses `import.meta.url` in a few
// places (locale loading in internationalization.js, TYPEDOC_ROOT in
// utils/general.js, theme assets in AssetsPlugin.js) to compute paths relative
// to the source file's on-disk location. When esbuild concatenates everything
// into one file, every `import.meta.url` would point at the bundle, breaking
// those source-relative lookups.
//
// The plugin below rewrites `import.meta.url` to a string literal of the
// ORIGINAL file URL during load, so each module continues to compute the same
// paths it would have computed unbundled. Bundled and unbundled outputs then
// behave identically.

import esbuild from "esbuild";
import { pathToFileURL } from "node:url";

/** @type {esbuild.Plugin} */
const preserveImportMetaUrl = {
    name: "preserve-import-meta-url",
    setup(build) {
        build.onLoad({ filter: /\.js$/, namespace: "file" }, async (args) => {
            const fs = await import("node:fs/promises");
            const contents = await fs.readFile(args.path, "utf8");
            if (!contents.includes("import.meta.url")) {
                return null;
            }
            const url = JSON.stringify(pathToFileURL(args.path).href);
            return {
                contents: contents.replaceAll("import.meta.url", url),
                loader: "js",
            };
        });
    },
};

await esbuild.build({
    entryPoints: ["dist/lib/cli.js"],
    outfile: "dist/lib/cli.bundled.js",
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node18",
    packages: "external",
    plugins: [preserveImportMetaUrl],
    logLevel: "info",
});
