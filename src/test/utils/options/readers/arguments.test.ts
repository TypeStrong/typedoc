import { deepStrictEqual as equal } from "assert";

import { Options } from "../../../../lib/utils";
import { ArgumentsReader } from "../../../../lib/utils/options/readers";
import {
    ParameterType,
    type NumberDeclarationOption,
    type MapDeclarationOption,
} from "../../../../lib/utils/options";
import { join, resolve } from "path";
import { TestLogger } from "../../../TestLogger";
import { Internationalization } from "../../../../lib/internationalization/internationalization";

const emptyHelp = () => "";

describe("Options - ArgumentsReader", () => {
    const logger = new TestLogger();
    afterEach(() => logger.reset());
    // Note: We lie about the type of Options here since we want the less strict
    // behavior for tests. If TypeDoc ever gets a numeric option, then we can
    // exclusively use the builtin options for tests and this cast can go away.
    let options: Options & {
        addDeclaration(
            declaration: Readonly<NumberDeclarationOption> & {
                name: "numOption";
            },
        ): void;
        addDeclaration(
            declaration: Readonly<MapDeclarationOption<number>> & {
                name: "mapped";
            },
        ): void;
        getValue(name: "numOption"): number;
        getValue(name: "mapped"): number;
    };

    beforeEach(() => {
        options = new Options(new Internationalization(null).proxy);
        options.addDeclaration({
            name: "numOption",
            help: emptyHelp,
            type: ParameterType.Number,
        });
        options.addDeclaration({
            name: "mapped",
            type: ParameterType.Map,
            help: emptyHelp,
            map: { a: 1, b: 2 },
            defaultValue: 3,
        });
    });

    function test(name: string, args: string[], cb: () => void) {
        it(name, async () => {
            const reader = new ArgumentsReader(1, args);
            options.reset();
            options.addReader(reader);
            await options.read(logger);
            cb();
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
        },
    );

    test(
        "Allows setting boolean options to false with a value",
        ["--includeVersion", "FALse"],
        () => {
            equal(options.getValue("includeVersion"), false);
            equal(options.getValue("entryPoints"), []);
        },
    );

    test(
        "Bool options do not improperly consume arguments",
        ["--includeVersion", "foo"],
        () => {
            equal(options.getValue("includeVersion"), true);
            equal(options.getValue("entryPoints"), [
                join(process.cwd(), "foo"),
            ]);
        },
    );

    test("Works with map options", ["--mapped", "b"], () => {
        equal(options.getValue("mapped"), 2);
    });

    test("Works with array options", ["--exclude", "a"], () => {
        equal(options.getValue("exclude"), [resolve("a")]);
    });

    test(
        "Works with array options passed multiple times",
        ["--exclude", "a", "--exclude", "b"],
        () => {
            equal(options.getValue("exclude"), [resolve("a"), resolve("b")]);
        },
    );

    it("Errors if given an unknown option", async () => {
        const similarOptions = options.getSimilarOptions("badOption");
        const reader = new ArgumentsReader(1, ["--badOption"]);
        options.reset();
        options.addReader(reader);
        await options.read(logger);
        logger.expectMessage(
            `error: Unknown option: --badOption, you may have meant:\n\t${similarOptions.join(
                "\n\t",
            )}`,
        );
    });

    it("Warns if option is expecting a value but no value is provided", async () => {
        const reader = new ArgumentsReader(1, ["--out"]);
        options.reset();
        options.addReader(reader);
        const logger = new TestLogger();
        await options.read(logger);
        logger.expectMessage(
            "warn: --out expected a value, but none was given as an argument",
        );
        logger.expectNoOtherMessages();
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
        },
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
        },
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
        },
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
        },
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
        },
    );
});
