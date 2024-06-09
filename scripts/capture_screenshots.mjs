// @ts-check
import * as fs from "fs";
import { platform } from "os";
import { resolve, dirname, relative, join } from "path";
import { parseArgs } from "util";
import puppeteer from "puppeteer";

const viewport = { width: 1024, height: 768 };

class PQueue {
    /** @private @type {Array<() => Promise<void>>} */
    _queued = [];
    /** @param {number} concurrency */
    constructor(concurrency) {
        /** @private */
        this._concurrency = concurrency;
    }

    /** @param {() => Promise<void>} action */
    add(action) {
        this._queued.push(action);
    }

    /** @returns {Promise<void>} */
    run() {
        return new Promise((resolve, reject) => {
            /** @type {Promise<void>[]} */
            const queue = [];
            const doReject = (err) => {
                this._queued.length = 0;
                queue.length = 0;
                reject(err);
            };
            const tick = () => {
                while (queue.length < this._concurrency) {
                    const next = this._queued.shift();
                    if (next) {
                        const nextPromise = Promise.resolve().then(next);
                        queue.push(nextPromise);
                        nextPromise.then(() => {
                            void queue.splice(queue.indexOf(nextPromise), 1);
                            tick();
                        }, doReject);
                    } else {
                        break;
                    }
                }

                if (queue.length === 0) {
                    resolve();
                }
            };

            tick();
        });
    }
}

/** @param {string} root */
function findHtmlPages(root) {
    /** @type {string[]} */
    const result = [];

    const queue = [root];
    while (queue.length) {
        const base = queue[0];
        queue.shift();
        for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
            if (entry.isFile()) {
                if (entry.name.endsWith(".html")) {
                    result.push(join(base, entry.name));
                }
            } else if (entry.isDirectory()) {
                queue.push(join(base, entry.name));
            }
        }
    }

    return result;
}

/**
 * @param {string} baseDirectory
 * @param {string} outputDirectory
 * @param {number} jobs
 * @param {boolean} headless
 * @param {string} theme
 */
export async function captureScreenshots(
    baseDirectory,
    outputDirectory,
    jobs,
    headless,
    theme,
) {
    const browser = await puppeteer.launch({
        args:
            platform() === "win32"
                ? []
                : ["--no-sandbox", "--disable-setuid-sandbox"],
        headless,
    });

    const queue = new PQueue(jobs);
    const pages = findHtmlPages(resolve(baseDirectory));
    console.log(`Processing ${pages.length} pages with ${jobs} workers`);
    for (const file of pages) {
        queue.add(async () => {
            const outputPath = resolve(
                outputDirectory,
                relative(baseDirectory, file).replace(/\.html$/, ".png"),
            );
            fs.mkdirSync(dirname(outputPath), { recursive: true });

            const context = await browser.createBrowserContext();
            const page = await context.newPage();
            await page.setViewport(viewport);
            await page.goto(`file://${file}`, {
                waitUntil: ["domcontentloaded"],
            });

            await page.evaluate(
                `document.documentElement.dataset.theme = "${theme}"`,
            );
            await page.screenshot({
                path: outputPath,
                fullPage: true,
            });

            await context.close();
            console.log("Finished", relative(baseDirectory, file));
        });
    }

    await queue.run();

    console.log("Finished!");
    await browser.close();
}

if (import.meta.url.endsWith(process.argv[1])) {
    const args = parseArgs({
        options: {
            jobs: {
                short: "j",
                type: "string",
                default: "6",
            },
            docs: {
                short: "d",
                type: "string",
                default: "./docs",
            },
            output: {
                short: "o",
                type: "string",
                default: "./tmp/screenshots",
            },
            debug: {
                type: "boolean",
                default: false,
            },
            theme: {
                type: "string",
                default: "light",
            },
        },
    });

    const jobs = parseInt(args.values.jobs || "");
    const docs = args.values.docs || "./docs";
    const output = args.values.output || "./tmp/screenshots";

    const start = Date.now();
    await fs.promises.rm(output, { recursive: true, force: true });
    await captureScreenshots(
        docs,
        output,
        jobs,
        !args.values.debug,
        args.values.theme || "light",
    );
    console.log(`Took ${(Date.now() - start) / 1000} seconds`);
}
