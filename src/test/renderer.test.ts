import { Application, ProjectReflection } from "..";
import * as Path from "path";
import Assert = require("assert");
import { TSConfigReader } from "../lib/utils/options";
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { remove } from "../lib/utils/fs";
import { canonicalizeHtml } from "./prettier-utils";

// Set to true if you want to make a visual regression test report
const PRESERVE_OUTPUT_FOR_VISUAL_REGRESSION_TEST = process.env['PRESERVE_OUTPUT_FOR_VISUAL_REGRESSION_TEST'] === 'true';

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

    const outAPath = Path.join(__dirname, '../../diagnostic-output/expected');
    const outBPath = Path.join(__dirname, '../../diagnostic-output/actual');
    const gitHubRegExp =
        /https:\/\/github.com\/[A-Za-z0-9-]+\/typedoc\/blob\/[^/]*\/examples/g;
    const errors = [];
    aFiles.forEach(function (file) {
        let aSrc = readFileSync(Path.join(a, file), { encoding: "utf-8" })
            .replace("\r", "")
            .replace(gitHubRegExp, "%GITHUB%");
        let bSrc = readFileSync(Path.join(b, file), { encoding: "utf-8" })
            .replace("\r", "")
            .replace(gitHubRegExp, "%GITHUB%");
        if(file.endsWith('.html')) {
            aSrc = canonicalizeHtml(aSrc);
            bSrc = canonicalizeHtml(bSrc);
            const fixAsides = (str: string) => str
            .replace(/(<aside[^>]*?>)\n\s+</g, '$1<')
            .replace(/\n\s+(<\/aside>)/g, '$1');
            aSrc = fixAsides(aSrc);
            bSrc = fixAsides(bSrc);
        }
        mkdirSync(Path.dirname(Path.join(outAPath, file)), {recursive: true});
        mkdirSync(Path.dirname(Path.join(outBPath, file)), {recursive: true});
        writeFileSync(Path.join(outAPath, file), aSrc);
        writeFileSync(Path.join(outBPath, file), bSrc);

        if (aSrc !== bSrc) {
            // @ts-ignore
            const err: any = new Error(`File contents of "${file}" differ.\n${ require('jest-diff').diff(aSrc, bSrc) }`);
            // err.expected = aSrc;
            // err.actual = bSrc;
            // err.showDiff = true;
            errors.push(err);
        }
    });
    if(errors.length) {
        throw new Error(`${errors.length} files differ`);
    }
}

describe("Renderer", function () {
    const src = Path.join(__dirname, "..", "..", "examples", "basic", "src");
    const out = Path.join(__dirname, "..", "tmp", "test");
    let app: Application, project: ProjectReflection | undefined;

    before(async function () {
        await remove(out);
    });

    after(async function () {
        if(!PRESERVE_OUTPUT_FOR_VISUAL_REGRESSION_TEST)
            await remove(out);
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
        await app.generateDocs(project!, out);

        if(!PRESERVE_OUTPUT_FOR_VISUAL_REGRESSION_TEST)
            await remove(Path.join(out, "assets"));

        compareDirectories(Path.join(__dirname, "renderer", "specs"), out);
    });
});
