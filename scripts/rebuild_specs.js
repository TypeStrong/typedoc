// @ts-check
"use strict";

Error.stackTraceLimit = 50;
import ts from "typescript";
import fs from "fs";
import { rm } from "fs/promises";
import path, { basename, join } from "path";
import * as td from "../dist/index.js";
import { getExpandedEntryPointsForPaths } from "../dist/lib/utils/index.js";
import { ok } from "assert";
import { fileURLToPath } from "url";
import { diagnostics } from "../dist/lib/utils/loggers.js";
import { getConverter2App, getConverter2Project, getConverterApp } from "../dist/test/programs.js";
import { TestRouter, TestTheme } from "../dist/test/renderer/testRendererUtils.js";

const base = path.join(
    fileURLToPath(import.meta.url),
    "../../src/test/converter",
);

const app = getConverterApp();
const app2 = getConverter2App();

app2.renderer.defineTheme("test-theme", TestTheme);
app2.renderer.defineRouter("test-router", TestRouter);

app.serializer.addSerializer({
    priority: -1,
    supports(obj) {
        return obj instanceof td.SourceReference;
    },
    /**
     * @param {td.SourceReference} ref
     */
    toObject(ref, obj) {
        if (obj.url) {
            obj.url = `typedoc://${
                obj.url.substring(
                    obj.url.indexOf(ref.fileName),
                )
            }`;
        }
        return obj;
    },
});
app.serializer.addSerializer({
    priority: -1,
    supports(obj) {
        return obj instanceof td.ProjectReflection;
    },
    /** @param {td.ProjectReflection} obj */
    toObject(_refl, obj) {
        delete obj.packageVersion;
        return obj;
    },
});

/** @type {[string, (app: td.Application) => void, (app: td.Application) => void][]} */
const conversions = [
    [
        "specs",
        () => {
            // nop
        },
        () => {
            // nop
        },
    ],
    [
        "specs-with-lump-categories",
        (app) => app.options.setValue("categorizeByGroup", false),
        (app) => app.options.setValue("categorizeByGroup", true),
    ],
    [
        "specs.nodoc",
        (app) => app.options.setValue("excludeNotDocumented", true),
        (app) => app.options.setValue("excludeNotDocumented", false),
    ],
];

/**
 * Rebuilds the converter specs for the provided dirs.
 * @param {string[]} dirs
 */
function rebuildConverterTests(dirs) {
    const program = ts.createProgram(app.options.getFileNames(), {
        ...app.options.getCompilerOptions(),
        noEmit: true,
    });

    const errors = ts.getPreEmitDiagnostics(program);
    if (errors.length) {
        diagnostics(app.logger, errors);
        return;
    }

    for (const fullPath of dirs) {
        console.log(fullPath);
        for (const [file, before, after] of conversions) {
            const out = path.join(fullPath, `${file}.json`);
            if (fs.existsSync(out)) {
                app.files = new td.ValidatingFileRegistry();
                td.resetReflectionID();
                before(app);
                const entry = getExpandedEntryPointsForPaths(
                    app.logger,
                    [fullPath],
                    app.options,
                    [program],
                );
                ok(entry, "Missing entry point");
                const result = app.converter.convert(entry);
                result.name = basename(fullPath);
                const serialized = app.serializer.projectToObject(
                    result,
                    td.normalizePath(process.cwd()),
                );

                const data = JSON.stringify(serialized, null, 4) + "\n";
                after(app);
                fs.writeFileSync(out, data);
            }
        }
    }
}

/** @param {string} specPath */
async function rebuildRendererTest(specPath) {
    console.log(specPath);
    await rm(specPath, { recursive: true, force: true });

    app2.options.setValue("theme", "test-theme");
    app2.options.setValue("router", "test-router");
    app2.options.setValue("disableSources", true);
    app2.options.setValue("disableGit", true);
    app2.options.setValue("sourceLinkTemplate", "{path}:{line}");

    const project = getConverter2Project(["renderer"], ".");
    project.readme = [{ kind: "text", text: "Readme text" }];
    await app2.generateDocs(project, specPath);
    await rm(`${specPath}/assets`, { recursive: true });
    await rm(`${specPath}/.nojekyll`);
}

async function main() {
    console.log("Base directory is", base);
    const dirs = await fs.promises.readdir(base, { withFileTypes: true });

    await rebuildConverterTests(
        dirs
            .filter((dir) => dir.isDirectory())
            .map((dir) => path.join(base, dir.name)),
    );

    await rebuildRendererTest(join(process.cwd(), "src/test/renderer/specs"));
}

main().catch((reason) => {
    console.error(reason);
    process.exit(1);
});
