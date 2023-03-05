// @ts-check
"use strict";

require("ts-node/register");

Error.stackTraceLimit = 50;
const ts = require("typescript");
const fs = require("fs");
const path = require("path");
const td = require("../src");
const { getExpandedEntryPointsForPaths } = require("../src/lib/utils");
const { ok } = require("assert");
const { basename } = require("path");

const base = path.join(__dirname, "../src/test/converter");

const app = new td.Application();
app.options.addReader(new td.TSConfigReader());
app.bootstrap({
    name: "typedoc",
    excludeExternals: true,
    disableSources: false,
    tsconfig: path.join(base, "tsconfig.json"),
    externalPattern: ["**/node_modules/**"],
    entryPointStrategy: td.EntryPointStrategy.Expand,
    logLevel: td.LogLevel.Warn,
    gitRevision: "fake",
    readme: "none",
});
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
            obj.url = `typedoc://${obj.url.substring(
                obj.url.indexOf(ref.fileName)
            )}`;
        }
        return obj;
    },
});
app.serializer.addSerializer({
    priority: -1,
    supports(obj) {
        return obj instanceof td.ProjectReflection;
    },
    toObject(_refl, obj) {
        delete obj.packageVersion;
        return obj;
    },
});

/** @type {[string, () => void, () => void][]} */
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
        () => app.options.setValue("categorizeByGroup", false),
        () => app.options.setValue("categorizeByGroup", true),
    ],
    [
        "specs.nodoc",
        () => app.options.setValue("excludeNotDocumented", true),
        () => app.options.setValue("excludeNotDocumented", false),
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
        app.logger.diagnostics(errors);
        return;
    }

    for (const fullPath of dirs) {
        console.log(fullPath);
        for (const [file, before, after] of conversions) {
            const out = path.join(fullPath, `${file}.json`);
            if (fs.existsSync(out)) {
                td.resetReflectionID();
                before();
                const entry = getExpandedEntryPointsForPaths(
                    app.logger,
                    [fullPath],
                    app.options,
                    [program]
                );
                ok(entry, "Missing entry point");
                const result = app.converter.convert(entry);
                result.name = basename(fullPath);
                const serialized = app.serializer.projectToObject(
                    result,
                    process.cwd()
                );

                const data = JSON.stringify(serialized, null, "  ") + "\n";
                after();
                fs.writeFileSync(out, data);
            }
        }
    }
}

async function main(filter = "") {
    console.log("Base directory is", base);
    const dirs = await fs.promises.readdir(base, { withFileTypes: true });

    await rebuildConverterTests(
        dirs
            .filter((dir) => {
                if (!dir.isDirectory()) return false;
                return dir.name.endsWith(filter);
            })
            .map((dir) => path.join(base, dir.name))
    );
}

main(process.argv[2]).catch((reason) => {
    console.error(reason);
    process.exit(1);
});
