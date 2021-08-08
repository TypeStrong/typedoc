import { ok } from "assert";
import * as fs from "fs";
import { sync as glob } from "glob";
import { platform } from "os";
import PQueue from "p-queue";
import * as Path from "path";
import * as puppeteer from "puppeteer";
import { Application, TSConfigReader } from "..";

const concurrency = 10;
const src = Path.join(__dirname, "../../examples/basic/src");
const baseDirectory = Path.join(__dirname, "../../dist/tmp/capture");
const outputDirectory = Path.join(__dirname, "../../dist/tmp/__screenshots__");
const globPattern = "**/*.html";
const viewport = { width: 1024, height: 768 };

async function main() {
    const app = new Application();
    app.options.addReader(new TSConfigReader());
    app.bootstrap({
        logger: "console",
        readme: Path.join(src, "..", "README.md"),
        gaSite: "foo.com", // verify theme option without modifying output
        name: "typedoc",
        disableSources: true,
        cleanOutputDir: true,
        tsconfig: Path.join(src, "..", "tsconfig.json"),
        plugin: [],
        entryPoints: [src],
    });
    const project = app.convert();
    ok(project);
    await app.generateDocs(project, baseDirectory);

    const browser = await puppeteer.launch({
        args:
            platform() === "win32"
                ? []
                : ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const queue = new PQueue({ autoStart: true, concurrency });
    for (const file of glob(globPattern, { cwd: baseDirectory })) {
        void queue.add(async () => {
            const absPath = Path.resolve(baseDirectory, file);
            const outputPath = Path.resolve(
                outputDirectory,
                Path.format({
                    ...Path.parse(file),
                    ext: ".png",
                    base: undefined,
                })
            );
            fs.mkdirSync(Path.dirname(outputPath), { recursive: true });

            const page = await browser.newPage();
            await page.setViewport(viewport);
            await page.goto(`file://${absPath}`, {
                waitUntil: "domcontentloaded", // 'load' 'networkidle0' 'networkidle2'
            });
            await new Promise((res) => setTimeout(() => res(undefined), 300));
            await page.screenshot({ path: outputPath, fullPage: true });

            await page.close();
        });
    }
    await queue.onIdle();

    await browser.close();
}

void main();
