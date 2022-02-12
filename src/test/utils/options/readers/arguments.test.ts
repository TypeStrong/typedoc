import { deepStrictEqual as equal, ok } from "assert";

import { Options, Logger } from "../../../../lib/utils";
import { ArgumentsReader } from "../../../../lib/utils/options/readers";
import {
    ParameterType,
    NumberDeclarationOption,
    MapDeclarationOption,
} from "../../../../lib/utils/options";
import { join, resolve } from "path";

describe("Options - ArgumentsReader", () => {
    const logger = new Logger();
    // Note: We lie about the type of Options here since we want the less strict
    // behavior for tests. If TypeDoc ever gets a numeric option, then we can
    // exclusively use the builtin options for tests and this cast can go away.
    const options = new Options(logger) as Options & {
        addDeclaration(
            declaration: Readonly<NumberDeclarationOption> & {
                name: "numOption";
            }
        ): void;
        addDeclaration(
            declaration: Readonly<MapDeclarationOption<number>> & {
                name: "mapped";
            }
        ): void;
        getValue(name: "numOption"): number;
        getValue(name: "mapped"): number;
    };
    options.addDefaultDeclarations();
    options.addDeclaration({
        name: "numOption",
        help: "",
        type: ParameterType.Number,
    });
    options.addDeclaration({
        name: "mapped",
        type: ParameterType.Map,
        help: "",
        map: { a: 1, b: 2 },
        defaultValue: 3,
    });

    function test(name: string, args: string[], cb: () => void) {
        it(name, () => {
            const reader = new ArgumentsReader(1, args);
            logger.resetErrors();
            logger.resetWarnings();
            options.reset();
            options.addReader(reader);
            options.read(logger);
            cb();
            options.removeReaderByName(reader.name);
        });
    }

    test("Puts arguments with no flag into inputFiles", ["foo", "bar"], () => {
        equal(options.getValue("entryPoints"), [
            join(process.cwd(), "foo"),
            join(process.cwd(), "bar"),
        ]);
    });

    test("Works with string options", ["--out", "outDir"], () => {
        equal(options.getValue("out"), join(process.cwd(), "outDir"));
    });

    test("Works with number options", ["-numOption", "123"], () => {
        equal(options.getValue("numOption"), 123);
    });

    test("Works with boolean options", ["--includeVersion"], () => {
        equal(options.getValue("includeVersion"), true);
    });

    test(
        "Allows setting boolean options with a value",
        ["--includeVersion", "TrUE"],
        () => {
            equal(options.getValue("includeVersion"), true);
            equal(options.getValue("entryPoints"), []);
        }
    );

    test(
        "Allows setting boolean options to false with a value",
        ["--includeVersion", "FALse"],
        () => {
            equal(options.getValue("includeVersion"), false);
            equal(options.getValue("entryPoints"), []);
        }
    );

    test(
        "Bool options do not improperly consume arguments",
        ["--includeVersion", "foo"],
        () => {
            equal(options.getValue("includeVersion"), true);
            equal(options.getValue("entryPoints"), [
                join(process.cwd(), "foo"),
            ]);
        }
    );

    test("Works with map options", ["--mapped", "b"], () => {
        equal(options.getValue("mapped"), 2);
    });

    test("Works with mixed options", ["--logger", "word"], () => {
        equal(options.getValue("logger"), "word");
    });

    test("Works with array options", ["--exclude", "a"], () => {
        equal(options.getValue("exclude"), [resolve("a")]);
    });

    test(
        "Works with array options passed multiple times",
        ["--exclude", "a", "--exclude", "b"],
        () => {
            equal(options.getValue("exclude"), [resolve("a"), resolve("b")]);
        }
    );

    it("Errors if given an unknown option", () => {
        let check = false;
        class TestLogger extends Logger {
            override error(msg: string) {
                equal(msg, "Unknown option: --badOption");
                check = true;
            }
        }
        const reader = new ArgumentsReader(1, ["--badOption"]);
        options.reset();
        options.addReader(reader);
        options.read(new TestLogger());
        options.removeReaderByName(reader.name);
        equal(check, true, "Reader did not report an error.");
    });

    it("Warns if option is expecting a value but no value is provided", () => {
        let check = false;
        class TestLogger extends Logger {
            override warn(msg: string) {
                ok(msg.includes("--out"));
                check = true;
            }
        }

        const reader = new ArgumentsReader(1, ["--out"]);
        options.reset();
        options.addReader(reader);
        options.read(new TestLogger());
        options.removeReaderByName(reader.name);
        equal(check, true, "Reader did not report an error.");
    });

    test(
        "Works with flag values without specifying a value",
        ["--validation.invalidLink"],
        () => {
            equal(logger.hasErrors(), false);
            equal(logger.hasWarnings(), false);
            equal(options.getValue("validation"), {
                notExported: true,
                notDocumented: false,
                invalidLink: true,
            });
        }
    );

    test(
        "Works with flag values with specifying a value",
        [
            "--validation.invalidLink",
            "true",
            "--validation.notExported",
            "false",
        ],
        () => {
            equal(logger.hasErrors(), false);
            equal(logger.hasWarnings(), false);
            equal(options.getValue("validation"), {
                notExported: false,
                notDocumented: false,
                invalidLink: true,
            });
        }
    );

    test(
        "Works with flag values without specifying a specific flag",
        ["--validation"],
        () => {
            equal(logger.hasErrors(), false);
            equal(logger.hasWarnings(), false);
            equal(options.getValue("validation"), {
                notExported: true,
                notDocumented: true,
                invalidLink: true,
            });
        }
    );

    test(
        "Works with flag values without specifying a specific flag and setting true",
        ["--validation", "true"],
        () => {
            equal(logger.hasErrors(), false);
            equal(logger.hasWarnings(), false);
            equal(options.getValue("validation"), {
                notExported: true,
                notDocumented: true,
                invalidLink: true,
            });
        }
    );

    test(
        "Works with flag values without specifying a specific flag and setting false",
        ["--validation", "false"],
        () => {
            equal(logger.hasErrors(), false);
            equal(logger.hasWarnings(), false);
            equal(options.getValue("validation"), {
                notExported: false,
                notDocumented: false,
                invalidLink: false,
            });
        }
    );
});
