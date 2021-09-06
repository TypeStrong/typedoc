// @ts-check
"use strict";
Error.stackTraceLimit = 50;
const ts = require("typescript");
const fs = require("fs");
const path = require("path");
const TypeDoc = require("..");
const { getExpandedEntryPointsForPaths } = require("../dist/lib/utils");

const app = new TypeDoc.Application();
app.options.addReader(new TypeDoc.TSConfigReader());
app.bootstrap({
    name: "typedoc",
    excludeExternals: true,
    disableSources: true,
    tsconfig: path.join(
        __dirname,
        "..",
        "dist",
        "test",
        "converter",
        "tsconfig.json"
    ),
    externalPattern: ["**/node_modules/**"],
    entryPointStrategy: TypeDoc.EntryPointStrategy.Expand,
});

// Note that this uses the test files in dist, not in src, this is important since
// when running the tests we copy the tests to dist and then convert them.
const base = path.join(__dirname, "../dist/test/converter");

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
                TypeDoc.resetReflectionID();
                before();
                const result = app.converter.convert(
                    getExpandedEntryPointsForPaths(
                        app.logger,
                        [fullPath],
                        app.options,
                        [program]
                    )
                );
                const serialized = app.serializer.toObject(result);

                const data = JSON.stringify(serialized, null, "  ")
                    .split(TypeDoc.normalizePath(base))
                    .join("%BASE%");
                after();
                fs.writeFileSync(out.replace("dist", "src"), data);
            }
        }
    }
}

async function main(filter = "") {
    const dirs = await Promise.all(
        (
            await fs.promises.readdir(base)
        ).map((dir) => {
            const dirPath = path.join(base, dir);
            return Promise.all([dirPath, fs.promises.stat(dirPath)]);
        })
    );

    await rebuildConverterTests(
        dirs
            .filter(([fullPath, stat]) => {
                if (!stat.isDirectory()) return false;
                return fullPath.endsWith(filter);
            })
            .map(([path]) => path)
    );
}

main(process.argv[2]).catch((reason) => {
    console.error(reason);
    process.exit(1);
});
