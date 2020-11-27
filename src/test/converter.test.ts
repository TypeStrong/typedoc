import {
    Application,
    resetReflectionID,
    normalizePath,
    ProjectReflection,
} from "..";
import * as FS from "fs";
import * as Path from "path";
import { deepStrictEqual as equal, ok } from "assert";
import { TSConfigReader } from "../lib/utils/options";

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
    });

    const checks: [string, () => void, () => void][] = [
        ["specs", () => {}, () => {}],
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
                    app.options.setValue(
                        "entryPoints",
                        app.expandInputFiles([path])
                    );
                    result = app.convert();
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
