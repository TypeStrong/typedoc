// @ts-check
import util from "util";
import { cpSync, existsSync, mkdirSync, rmSync } from "fs";
import { spawnSync } from "child_process";
import { captureScreenshots } from "./capture_screenshots.mjs";
import { fileURLToPath } from "url";
import { join } from "path";

/** @param {string} dir */
function accept(dir) {
    const expectedDir = join(dir, "baseline");
    const outputDir = join(dir, "screenshots");
    rmSync(expectedDir, { recursive: true, force: true });
    cpSync(outputDir, expectedDir, { recursive: true, force: true });
}

/** @param {string} dir */
function compare(dir) {
    rmSync(join(dir, "output"), { recursive: true, force: true });
    mkdirSync(join(dir, "output"), { recursive: true });

    spawnSync(
        "docker",
        [
            "run",
            "--rm",
            "--name",
            "typedoc-reg-suit",
            "-v",
            `${join(dir, "screenshots")}:/new`,
            "-v",
            `${join(dir, "baseline")}:/old`,
            "-v",
            `${join(dir, "output")}:/out`,
            "ghcr.io/gerrit0/reg-suit-container:main",
        ],
        { stdio: "inherit" },
    );
}

function printHelp() {
    const help = [
        "DIRECTORIES",
        "  --dir <dir>     The root folder that visual regression info is tracked in,",
        "                  defaults to ./tmp/visual_regression",
        "  --docs <dir>    The folder containing built documentation, used when --run is active",
        "FLAGS",
        "  --jobs, -j      Specify the number of workers to use when capturing screenshots, defaults to 6",
        "  --theme         Specify the theme to use when capturing screenshots, default to light",
        "  --help, -h      Show this message",
        "TASKS",
        "  --run           Execute ./bin/typedoc, runs first",
        "  --screenshot    Use puppeteer to capture screenshots of the generated docs, runs second",
        "  --compare       Use reg-suit to compare baseline/regression screenshots, runs third",
        "  --accept        Accept the current screenshots, runs last.",
        "",
        "If no task flags are specified, will act as if all but --accept are specified",
    ];
    console.log("node scripts/visual_regression.js");
    console.log(help.join("\n"));
}

async function main() {
    const args = util.parseArgs({
        options: {
            dir: {
                type: "string",
            },
            docs: {
                type: "string",
            },
            accept: {
                type: "boolean",
            },
            run: {
                type: "boolean",
            },
            screenshot: {
                type: "boolean",
            },
            compare: {
                type: "boolean",
            },
            jobs: {
                short: "j",
                type: "string",
                default: "6",
            },
            theme: {
                type: "string",
            },
            help: {
                type: "boolean",
                short: "h",
            },
        },
    });

    if (args.values.help) {
        printHelp();
        return;
    }

    const dir =
        args.values.dir ??
        fileURLToPath(new URL("../tmp/visual_regression", import.meta.url));
    const docs = args.values.docs ?? new URL("../docs", import.meta.url);
    const jobs = parseInt(args.values.jobs || "6");

    const userSpecifiedJob =
        args.values.accept ||
        args.values.run ||
        args.values.screenshot ||
        args.values.compare;

    if (args.values.run || !userSpecifiedJob) {
        const runResult = spawnSync("node", ["bin/typedoc"], {
            cwd: new URL("../", import.meta.url),
            stdio: "inherit",
        });
        if (runResult.status) {
            process.exit(1);
        }
    }

    if (args.values.screenshot || !userSpecifiedJob) {
        await captureScreenshots(
            typeof docs === "string" ? docs : fileURLToPath(docs),
            join(dir, "screenshots"),
            jobs,
            true,
            args.values.theme ?? "light",
        );

        if (!existsSync(join(dir, "baseline"))) {
            accept(dir);
            console.log("Initial baseline accepted, run again to compare.");
            return;
        }
    }

    if (args.values.compare || !userSpecifiedJob) {
        compare(dir);
        console.log(`Open ${dir}/output/index.html to review diffs`);
    }

    if (args.values.accept) {
        accept(dir);
        return;
    }
}

if (import.meta.url.endsWith(process.argv[1])) {
    try {
        const start = Date.now();
        await main();
        console.log(
            "Took",
            ((Date.now() - start) / 1000).toFixed(3),
            "seconds",
        );
    } catch (error) {
        if (error.code == "ERR_PARSE_ARGS_UNKNOWN_OPTION") {
            printHelp();
            process.exit(1);
        }
        throw error;
    }
}
