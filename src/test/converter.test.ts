import { deepStrictEqual as equal, ok } from "assert";
import * as FS from "fs";
import * as Path from "path";
import * as ts from "typescript";
import {
    Application,
    EntryPointStrategy,
    normalizePath,
    ProjectReflection,
    resetReflectionID,
    TSConfigReader,
} from "..";
import { getExpandedEntryPointsForPaths } from "../lib/utils";

describe("Converter", function () {
    const base = Path.join(__dirname, "converter");
    const app = new Application();
    app.options.addReader(new TSConfigReader());
    app.bootstrap({
        logger: "none",
        name: "typedoc",
        excludeExternals: true,
        disableSources: true,
        tsconfig: Path.join(base, "tsconfig.json"),
        externalPattern: ["**/node_modules/**"],
        plugin: [],
        entryPointStrategy: EntryPointStrategy.Expand,
    });

    let program: ts.Program;
    it("Compiles", () => {
        program = ts.createProgram(
            app.options.getFileNames(),
            app.options.getCompilerOptions()
        );

        const errors = ts.getPreEmitDiagnostics(program);
        equal(errors, []);
    });

    const checks: [string, () => void, () => void][] = [
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

    FS.readdirSync(base).forEach(function (directory) {
        const path = Path.join(base, directory);
        if (!FS.lstatSync(path).isDirectory()) {
            return;
        }

        describe(directory, function () {
            for (const [file, before, after] of checks) {
                const specsFile = Path.join(path, `${file}.json`);
                if (!FS.existsSync(specsFile)) {
                    continue;
                }

                let result: ProjectReflection | undefined;

                it(`[${file}] converts fixtures`, function () {
                    before();
                    resetReflectionID();
                    const entryPoints = getExpandedEntryPointsForPaths(
                        app.logger,
                        [path],
                        app.options,
                        [program]
                    );
                    ok(entryPoints, "Failed to get entry points");
                    result = app.converter.convert(entryPoints);
                    after();
                    ok(
                        result instanceof ProjectReflection,
                        "No reflection returned"
                    );
                });

                it(`[${file}] matches specs`, function () {
                    const specs = JSON.parse(
                        FS.readFileSync(specsFile, "utf-8")
                    );
                    let data = JSON.stringify(
                        app.serializer.toObject(result),
                        null,
                        "  "
                    );
                    data = data.split(normalizePath(base)).join("%BASE%");

                    equal(JSON.parse(data), specs);
                });
            }
        });
    });
});
