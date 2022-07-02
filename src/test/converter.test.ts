import { deepStrictEqual as equal, ok } from "assert";
import * as FS from "fs";
import * as Path from "path";
import { ProjectReflection, resetReflectionID } from "..";
import { getExpandedEntryPointsForPaths } from "../lib/utils";
import {
    getConverterApp,
    getConverterBase,
    getConverterProgram,
} from "./programs";

describe("Converter", function () {
    const base = getConverterBase();
    const app = getConverterApp();

    it("Compiles", () => {
        getConverterProgram();
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
                        [getConverterProgram()]
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
                    // Pass data through a parse/stringify to get rid of undefined properties
                    const data = JSON.parse(
                        JSON.stringify(app.serializer.toObject(result))
                    );

                    equal(data, specs);
                });
            }
        });
    });
});
