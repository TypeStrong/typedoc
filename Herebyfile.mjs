// @ts-check
import esbuild from "esbuild";
import { task } from "hereby";
import { spawn } from "node:child_process";
import { copyFile, readFile, rm, writeFile } from "node:fs/promises";
import { delimiter } from "node:path";

/**
 * @param {string} cmd
 * @param {string[]} args
 */
function execa(cmd, args) {
    return new Promise((resolve, reject) => {
        const cp = spawn(cmd, args, {
            stdio: "inherit",
            env: {
                ...process.env,
                PATH: process.cwd() + "/node_modules/.bin" + delimiter + process.env.PATH,
            },
        });
        cp.once("close", code => {
            if (code === 0 || code == null) {
                resolve(undefined);
            } else {
                reject(new Error(`${cmd} ${args.join(" ")} exited with code ${code}`));
            }
        });
        cp.once("error", () => {
            reject(new Error(`Failed to start ${cmd}`));
        });
    });
}

/**
 * @param {Promise<esbuild.BuildContext>} contextP
 * @param {boolean} watch
 */
async function esbuildTask(contextP, watch) {
    const context = await contextP;
    try {
        await context.rebuild();

        if (watch) {
            await context.watch();
            // Wait for Ctrl+C, this might be broken in Git Bash on Windows,
            // PR welcome if this affects you!
            await new Promise(resolve => process.once("SIGINT", resolve));
        }
    } finally {
        await context.dispose();
    }
}

function createJsBuild() {
    return esbuild.context({
        entryPoints: [
            // library split
            "src/lib/utils-common.ts",
            "src/lib/models.ts",
            "src/lib/node-utils.ts",
            "src/lib/serialization.ts",

            // entry points
            "src/lib/browser-utils.ts",
            "src/lib/index.ts",
            "src/lib/cli.ts",

            { in: "src/lib/internationalization/locales/de.ts", out: "locale/de" },
            { in: "src/lib/internationalization/locales/en.ts", out: "locale/en" },
            { in: "src/lib/internationalization/locales/fr.ts", out: "locale/fr" },
            { in: "src/lib/internationalization/locales/ja.ts", out: "locale/ja" },
            { in: "src/lib/internationalization/locales/ko.ts", out: "locale/ko" },
            { in: "src/lib/internationalization/locales/zh.ts", out: "locale/zh" },
        ],
        platform: "node",
        bundle: true,
        outdir: "dist",
        logLevel: "info",
        format: "esm",
        target: "node18",
        external: [
            "typedoc",

            // These imports shouldn't be bundled as they each have their own
            // individual bundle which they'll be resolved to.
            "#utils",
            "#models",
            "#serialization",
            "#node-utils",

            // Don't bundle third parties
            "@gerrit0/mini-shiki",
            "lunr",
            "markdown-it",
            "minimatch",
            "yaml",
            "typescript",
        ],
    });
}

/** @param {boolean} watch */
function createBrowserBundleBuild(watch) {
    // It's convenient to be able to build the themes in watch mode without rebuilding the whole docs
    // to test some change to the frontend JS.
    /** @type {esbuild.Plugin} */
    const copyToDocsPlugin = {
        name: "copyToDocs",
        setup(build) {
            if (watch) {
                build.onEnd(async (result) => {
                    if (!result.errors.length) {
                        try {
                            await copyFile("static/main.js", "docs/assets/main.js");
                        } catch {
                            // Ignore, there isn't a docs folder
                        }
                    }
                });
            }
        },
    };

    return esbuild.context({
        entryPoints: ["src/frontend/bootstrap.ts"],
        bundle: true,
        minify: true,
        outfile: "static/main.js",
        logLevel: "info",
        plugins: watch ? [copyToDocsPlugin] : [],
    });
}

export const clean = task({
    name: "clean",
    run: async () => {
        await rm("dist", { recursive: true, force: true });
    },
});

export const buildJs = task({
    name: "build:js",
    run: () => esbuildTask(createJsBuild(), false),
});

export const buildBrowserTranslations = task({
    name: "build:browser-translations",
    dependencies: [buildJs],
    run: () => execa("node", ["scripts/build_browser_translations.js"]),
});

export const buildBrowser = task({
    name: "build:browser",
    run: () => esbuildTask(createBrowserBundleBuild(false), false),
});

export const buildTypes = task({
    name: "build:types",
    run: () => execa("tsc", ["--build"]),
});

export const buildOptionsSchema = task({
    name: "build:options-schema",
    dependencies: [buildJs],
    run: () => execa("node", ["scripts/generate_options_schema.js", "typedoc-config.schema.json"]),
});

export const build = task({
    name: "build",
    dependencies: [buildJs, buildBrowser, buildBrowserTranslations, buildTypes, buildOptionsSchema],
});

export const buildProd = task({
    name: "build:prod",
    dependencies: [build],
    run: async () => {
        const prodSwitchFile = "dist/types/utils-common/general.d.ts";
        const content = await readFile(prodSwitchFile, "utf-8");
        await writeFile(prodSwitchFile, content.replace(/type InternalOnly = .*/, "type InternalOnly = 0;"));
    },
});

export const watchJs = task({
    name: "watch:js",
    run: () => esbuildTask(createJsBuild(), true),
});

export const watchBrowser = task({
    name: "watch:browser",
    run: () => esbuildTask(createBrowserBundleBuild(true), true),
});

export const watchBrowserTranslations = task({
    name: "watch:browser-translations",
    run: () => execa("node", ["scripts/build_browser_translations.js", "--watch"]),
});

export const watchTypes = task({
    name: "watch:types",
    run: () => execa("tsc", ["--build", "--watch", "--preserveWatchOutput"]),
});

export const watch = task({
    name: "watch",
    dependencies: [watchJs, watchBrowser, watchTypes, watchBrowserTranslations],
});

export const test = task({
    name: "test",
    run: () =>
        execa("tsx", [
            "--tsconfig=.config/tsconfig.mocha.json",
            "node_modules/mocha/bin/mocha.js",
            "--config",
            ".config/mocha.fast.json",
            ...process.argv.slice(process.argv.indexOf("test") + 1),
        ]),
});

export const testCov = task({
    name: "test:cov",
    run: () =>
        execa("c8", [
            "-r",
            "lcov",
            "tsx",
            "--tsconfig=.config/tsconfig.mocha.json",
            "node_modules/mocha/bin/mocha.js",
            "--config",
            ".config/mocha.fast.json",
            ...process.argv.slice(process.argv.indexOf("test:cov") + 1),
        ]),
});

export const testFull = task({
    name: "test:full",
    run: () =>
        execa("c8", [
            "-r",
            "lcov",
            "tsx",
            "--tsconfig=.config/tsconfig.mocha.json",
            "node_modules/mocha/bin/mocha.js",
            "--config",
            ".config/mocha.full.json",
            ...process.argv.slice(process.argv.indexOf("test:full") + 1),
        ]),
});

export const eslint = task({
    name: "eslint",
    run: () => execa("eslint", [".", "--max-warnings", "0"]),
});

export const dprint = task({
    name: "dprint",
    run: () => execa("dprint", ["check"]),
});

export const lint = task({
    name: "lint",
    dependencies: [eslint, dprint],
});

export const format = task({
    name: "format",
    run: () => execa("dprint", ["fmt"]),
});

export const rebuildSpecs = task({
    name: "specs",
    run: () => execa("tsx", ["scripts/rebuild_specs.js"]),
});

export const buildSite = task({
    name: "build:site",
    dependencies: [buildJs, buildBrowser],
    run: () => execa("bash", ["scripts/build_site.sh"]),
});

export default build;
