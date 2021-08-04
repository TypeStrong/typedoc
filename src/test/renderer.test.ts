import { Application, ProjectReflection } from "..";
import * as Path from "path";
import Assert = require("assert");
import { TSConfigReader } from "../lib/utils/options";
import { mkdirSync, readdirSync, readFileSync, statSync } from "fs";
import { remove } from "../lib/utils/fs";

// Set to true if you want to make a visual regression test report
const PRESERVE_OUTPUT_FOR_VISUAL_REGRESSION_TEST =
    process.env["PRESERVE_OUTPUT_FOR_VISUAL_REGRESSION_TEST"] === "true";

function getFileIndex(base: string, dir = "", results: string[] = []) {
    const files = readdirSync(Path.join(base, dir));
    files.forEach(function (file) {
        if (file === "assets" || file === "specs.json") {
            return;
        }
        file = Path.join(dir, file);
        if (statSync(Path.join(base, file)).isDirectory()) {
            getFileIndex(base, file, results);
        } else {
            results.push(file);
        }
    });

    return results.sort();
}

function compareDirectories(a: string, b: string) {
    const aFiles = getFileIndex(a);
    const bFiles = getFileIndex(b);
    Assert.deepStrictEqual(
        aFiles,
        bFiles,
        `Generated files differ. between "${a}" and "${b}"`
    );

    const gitHubRegExp =
        /https:\/\/github.com\/[A-Za-z0-9-]+\/typedoc\/blob\/[^/]*\/examples/g;
    aFiles.forEach(function (file) {
        const aSrc = readFileSync(Path.join(a, file), { encoding: "utf-8" })
            .replace("\r", "")
            .replace(gitHubRegExp, "%GITHUB%");
        const bSrc = readFileSync(Path.join(b, file), { encoding: "utf-8" })
            .replace("\r", "")
            .replace(gitHubRegExp, "%GITHUB%");

        if (aSrc !== bSrc) {
            const err: any = new Error(`File contents of "${file}" differ.`);
            err.expected = aSrc;
            err.actual = bSrc;
            err.showDiff = true;
            throw err;
        }
    });
}

describe("Renderer", function () {
    const src = Path.join(__dirname, "..", "..", "examples", "basic", "src");
    const out = Path.join(__dirname, "..", "tmp", "test");
    let app: Application, project: ProjectReflection | undefined;

    before(async function () {
        await remove(out);
    });

    after(async function () {
        if (!PRESERVE_OUTPUT_FOR_VISUAL_REGRESSION_TEST) await remove(out);
    });

    it("constructs", function () {
        app = new Application();
        app.options.addReader(new TSConfigReader());
        app.bootstrap({
            logger: "console",
            readme: Path.join(src, "..", "README.md"),
            gaSite: "foo.com", // verify theme option without modifying output
            name: "typedoc",
            disableSources: true,
            tsconfig: Path.join(src, "..", "tsconfig.json"),
            plugin: [],
        });
        app.options.setValue("entryPoints", [src]);
    });

    it("converts basic example", function () {
        this.timeout(0);
        project = app.convert();

        Assert(
            app.logger.errorCount === 0,
            "Application.convert returned errors"
        );
        Assert(
            project instanceof ProjectReflection,
            "Application.convert did not return a reflection"
        );
    });

    it("renders basic example", async function () {
        this.timeout(0);
        mkdirSync(out + "-json", { recursive: true });
        await app.exportProject(project!, out + "-export.json");
        const project2 = await app.importProject(out + "-export.json");
        await app.generateDocs(project!, out + "-a");
        await app.generateDocs(project2, out + "-b");

        if (!PRESERVE_OUTPUT_FOR_VISUAL_REGRESSION_TEST)
            await remove(Path.join(out, "assets"));

        compareDirectories(
            Path.join(__dirname, "renderer", "specs"),
            out + "-a"
        );
        compareDirectories(
            Path.join(__dirname, "renderer", "specs"),
            out + "-b"
        );
    });
});
