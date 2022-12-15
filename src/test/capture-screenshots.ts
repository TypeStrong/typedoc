import * as fs from "fs";
import { platform } from "os";
import { resolve, join, dirname, relative } from "path";
import { Application, TSConfigReader, EntryPointStrategy } from "..";
import { glob } from "../lib/utils/fs";

// The @types package plays badly with non-dom packages.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const puppeteer = require("puppeteer");

const concurrency = 10;
const src = join(__dirname, "../../src/test/renderer/testProject/src");
const baseDirectory = join(__dirname, "../../tmp/capture");
const outputDirectory = join(__dirname, "../../tmp/screenshots");
const viewport = { width: 1024, height: 768 };

class PQueue {
    private queued: (() => Promise<void>)[] = [];
    constructor(private concurrency: number) {}

    add(action: () => Promise<void>) {
        this.queued.push(action);
    }

    run() {
        return new Promise<void>((resolve, reject) => {
            const queue: Promise<void>[] = [];
            const doReject = (err: unknown) => {
                this.queued.length = 0;
                queue.length = 0;
                reject(err);
            };
            const tick = () => {
                while (queue.length < this.concurrency) {
                    const next = this.queued.shift();
                    if (next) {
                        const nextPromise = Promise.resolve().then(next);
                        queue.push(nextPromise);
                        nextPromise.then(() => {
                            queue.splice(queue.indexOf(nextPromise), 1);
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

export async function captureRegressionScreenshots() {
    const app = new Application();
    app.options.addReader(new TSConfigReader());
    app.bootstrap({
        logger: "console",
        readme: join(src, "..", "README.md"),
        name: "typedoc",
        cleanOutputDir: true,
        tsconfig: join(src, "..", "tsconfig.json"),
        plugin: [],
        entryPoints: [src],
        entryPointStrategy: EntryPointStrategy.Expand,
    });
    const project = app.convert();
    if (!project) throw new Error("Failed to convert.");
    await fs.promises.rm(outputDirectory, { recursive: true, force: true });
    await app.generateDocs(project, baseDirectory);

    await captureScreenshots(baseDirectory, outputDirectory);
}

export async function captureScreenshots(
    baseDirectory: string,
    outputDirectory: string
) {
    const browser = await puppeteer.launch({
        args:
            platform() === "win32"
                ? []
                : ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const queue = new PQueue(concurrency);
    for (const file of glob("**/*.html", baseDirectory)) {
        queue.add(async () => {
            const absPath = resolve(baseDirectory, file);
            const outputPath = resolve(
                outputDirectory,
                relative(baseDirectory, file).replace(".html", "")
            );
            fs.mkdirSync(dirname(outputPath), { recursive: true });

            const page = await browser.newPage();
            await page.setViewport(viewport);
            await page.goto(`file://${absPath}`, {
                waitUntil: "domcontentloaded", // 'load' 'networkidle0' 'networkidle2'
            });
            await new Promise<void>((res) => setTimeout(() => res(), 100));
            await page.screenshot({
                path: outputPath + "-light.png",
                fullPage: true,
            });

            await page.evaluate('document.body.classList.add("dark")');
            await new Promise<void>((res) => setTimeout(() => res(), 100));

            await page.screenshot({
                path: outputPath + "-dark.png",
                fullPage: true,
            });

            await page.close();
        });
    }
    await queue.run();

    await browser.close();
}

if (require.main == module) {
    captureRegressionScreenshots().catch((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
        process.exit(1);
    });
}
