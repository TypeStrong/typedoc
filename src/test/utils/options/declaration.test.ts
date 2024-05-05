import { deepStrictEqual as equal, ok, throws } from "assert";
import { join, resolve } from "path";
import {
    type ArrayDeclarationOption,
    convert,
    type DeclarationOption,
    getDefaultValue,
    type MapDeclarationOption,
    type MixedDeclarationOption,
    type ObjectDeclarationOption,
    type NumberDeclarationOption,
    ParameterType,
    type StringDeclarationOption,
} from "../../../lib/utils/options/declaration";
import { Internationalization } from "../../../lib/internationalization/internationalization";

const emptyHelp = () => "";

describe("Options - conversions", () => {
    const i18n = new Internationalization(null).proxy;
    const optionWithType = (type: ParameterType) =>
        ({
            type,
            defaultValue: undefined,
            name: "test",
            help: emptyHelp,
        }) as DeclarationOption;

    it("Converts to numbers", () => {
        equal(
            convert("123", optionWithType(ParameterType.Number), i18n, ""),
            123,
        );
        equal(convert("a", optionWithType(ParameterType.Number), i18n, ""), 0);
        equal(convert(NaN, optionWithType(ParameterType.Number), i18n, ""), 0);
    });

    it("Converts to number if value is the lowest allowed value for a number option", () => {
        const declaration: NumberDeclarationOption = {
            name: "test",
            help: emptyHelp,
            type: ParameterType.Number,
            minValue: 1,
            maxValue: 10,
            defaultValue: 1,
        };
        equal(convert(1, declaration, i18n, ""), 1);
    });

    it("Generates an error if value is too low for a number option", () => {
        const declaration: NumberDeclarationOption = {
            name: "test",
            help: emptyHelp,
            type: ParameterType.Number,
            minValue: 1,
            maxValue: 10,
            defaultValue: 1,
        };
        throws(
            () => convert(0, declaration, i18n, ""),
            new Error("test must be between 1 and 10"),
        );
    });

    it("Generates an error if value is too low for a number option with no max", () => {
        const declaration: NumberDeclarationOption = {
            name: "test",
            help: emptyHelp,
            type: ParameterType.Number,
            minValue: 1,
            defaultValue: 1,
        };
        throws(
            () => convert(0, declaration, i18n, ""),
            new Error("test must be equal to or greater than 1"),
        );
    });

    it("Generates an error if value is too high for a number option with no min", () => {
        const declaration: NumberDeclarationOption = {
            name: "test",
            help: emptyHelp,
            type: ParameterType.Number,
            maxValue: 10,
            defaultValue: 1,
        };
        throws(
            () => convert(11, declaration, i18n, ""),
            new Error("test must be less than or equal to 10"),
        );
    });

    it("Converts to number if value is the highest allowed value for a number option", () => {
        const declaration: NumberDeclarationOption = {
            name: "test",
            help: emptyHelp,
            type: ParameterType.Number,
            minValue: 1,
            maxValue: 10,
            defaultValue: 1,
        };
        equal(convert(10, declaration, i18n, ""), 10);
    });

    it("Generates an error if value is too high for a number option", () => {
        const declaration: NumberDeclarationOption = {
            name: "test",
            help: emptyHelp,
            type: ParameterType.Number,
            minValue: 1,
            maxValue: 10,
            defaultValue: 1,
        };
        throws(
            () => convert(11, declaration, i18n, ""),
            new Error("test must be between 1 and 10"),
        );
    });

    it("Validates number options", () => {
        const declaration: NumberDeclarationOption = {
            name: "test",
            help: emptyHelp,
            type: ParameterType.Number,
            validate: (value: number) => {
                if (value % 2 !== 0) {
                    throw new Error("test must be even");
                }
            },
        };
        equal(convert(0, declaration, i18n, ""), 0);
        equal(convert(2, declaration, i18n, ""), 2);
        equal(convert(4, declaration, i18n, ""), 4);
        throws(
            () => convert(1, declaration, i18n, ""),
            new Error("test must be even"),
        );
    });

    it("Converts to strings", () => {
        equal(
            convert("123", optionWithType(ParameterType.String), i18n, ""),
            "123",
        );
        equal(
            convert(123, optionWithType(ParameterType.String), i18n, ""),
            "123",
        );
        equal(
            convert(["1", "2"], optionWithType(ParameterType.String), i18n, ""),
            "1,2",
        );
        equal(
            convert(null, optionWithType(ParameterType.String), i18n, ""),
            "",
        );
        equal(
            convert(void 0, optionWithType(ParameterType.String), i18n, ""),
            "",
        );
    });

    it("Validates string options", () => {
        const declaration: StringDeclarationOption = {
            name: "test",
            help: emptyHelp,
            type: ParameterType.String,
            validate: (value: string) => {
                if (value !== value.toUpperCase()) {
                    throw new Error("test must be upper case");
                }
            },
        };
        equal(convert("TOASTY", declaration, i18n, ""), "TOASTY");
        throws(
            () => convert("toasty", declaration, i18n, ""),
            new Error("test must be upper case"),
        );
    });

    it("Converts to booleans", () => {
        equal(
            convert("a", optionWithType(ParameterType.Boolean), i18n, ""),
            true,
        );
        equal(
            convert([1], optionWithType(ParameterType.Boolean), i18n, ""),
            true,
        );
        equal(
            convert(false, optionWithType(ParameterType.Boolean), i18n, ""),
            false,
        );
    });

    it("Converts to arrays", () => {
        equal(convert("12,3", optionWithType(ParameterType.Array), i18n, ""), [
            "12,3",
        ]);
        equal(
            convert(["12,3"], optionWithType(ParameterType.Array), i18n, ""),
            ["12,3"],
        );
        equal(convert(true, optionWithType(ParameterType.Array), i18n, ""), []);

        equal(
            convert("/,a", optionWithType(ParameterType.PathArray), i18n, ""),
            [resolve("/,a")],
        );
        equal(
            convert(
                ["/foo"],
                optionWithType(ParameterType.PathArray),
                i18n,
                "",
            ),
            [resolve("/foo")],
        );
        equal(
            convert(true, optionWithType(ParameterType.PathArray), i18n, ""),
            [],
        );

        equal(
            convert("a,b", optionWithType(ParameterType.ModuleArray), i18n, ""),
            ["a,b"],
        );
        equal(
            convert(
                ["a,b"],
                optionWithType(ParameterType.ModuleArray),
                i18n,
                "",
            ),
            ["a,b"],
        );
        equal(
            convert(true, optionWithType(ParameterType.ModuleArray), i18n, ""),
            [],
        );
    });

    it("ModuleArray is resolved if relative", () => {
        equal(
            convert(
                ["./foo"],
                optionWithType(ParameterType.ModuleArray),
                i18n,
                "",
            ),
            [join(process.cwd(), "foo")],
        );
    });

    it("Validates array options", () => {
        const declaration: ArrayDeclarationOption = {
            name: "test",
            help: emptyHelp,
            type: ParameterType.Array,
            validate: (value: string[]) => {
                if (value.length === 0) {
                    throw new Error("test must not be empty");
                }
            },
        };
        equal(convert(["1"], declaration, i18n, ""), ["1"]);
        equal(convert(["1", "2"], declaration, i18n, ""), ["1", "2"]);
        throws(
            () => convert([], declaration, i18n, ""),
            new Error("test must not be empty"),
        );
    });

    it("Converts to mapped types", () => {
        const declaration: MapDeclarationOption<number> = {
            name: "",
            help: emptyHelp,
            type: ParameterType.Map,
            map: {
                a: 1,
                b: 2,
            },
            defaultValue: 1,
        };
        equal(convert("a", declaration, i18n, ""), 1);
        equal(convert("b", declaration, i18n, ""), 2);
        equal(convert(2, declaration, i18n, ""), 2);
    });

    it("Converts to mapped types with a map", () => {
        const declaration: MapDeclarationOption<number> = {
            name: "",
            help: emptyHelp,
            type: ParameterType.Map,
            map: new Map([
                ["a", 1],
                ["b", 2],
            ]),
            defaultValue: 1,
        };
        equal(convert("a", declaration, i18n, ""), 1);
        equal(convert("b", declaration, i18n, ""), 2);
        equal(convert(2, declaration, i18n, ""), 2);
    });

    it("Generates a nice error if value is invalid", () => {
        const declaration: MapDeclarationOption<number> = {
            name: "test",
            help: emptyHelp,
            type: ParameterType.Map,
            map: new Map([
                ["a", 1],
                ["b", 2],
            ]),
            defaultValue: 1,
        };
        throws(
            () => convert("c", declaration, i18n, ""),
            new Error("test must be one of a, b"),
        );
    });

    it("Correctly handles enum types in the map error", () => {
        enum Enum {
            a,
            b,
        }
        const declaration = {
            name: "test",
            help: emptyHelp,
            type: ParameterType.Map,
            map: Enum,
            defaultValue: Enum.a,
        } as const;
        throws(
            () => convert("c", declaration, i18n, ""),
            new Error("test must be one of a, b"),
        );
    });

    it("Passes through mixed", () => {
        const data = Symbol();
        equal(
            convert(data, optionWithType(ParameterType.Mixed), i18n, ""),
            data,
        );
    });

    it("Validates mixed options", () => {
        const declaration: MixedDeclarationOption = {
            name: "test",
            help: emptyHelp,
            type: ParameterType.Mixed,
            defaultValue: "default",
            validate: (value: unknown) => {
                if (typeof value === "number") {
                    throw new Error("test must not be a number");
                }
            },
        };
        equal(convert("text", declaration, i18n, ""), "text");
        throws(
            () => convert(1, declaration, i18n, ""),
            new Error("test must not be a number"),
        );
    });
    it("Passes through object", () => {
        const data = {};
        equal(
            convert(data, optionWithType(ParameterType.Object), i18n, ""),
            data,
        );
    });

    it("Validates object options", () => {
        const declaration: ObjectDeclarationOption = {
            name: "test",
            help: emptyHelp,
            type: ParameterType.Object,
            defaultValue: "default",
            validate: (value: unknown) => {
                if (typeof value !== "object" || Array.isArray(value)) {
                    throw new Error("test must be an object");
                }
            },
        };
        equal(convert({}, declaration, i18n, ""), {});
        throws(
            () => convert(1, declaration, i18n, ""),
            new Error("test must be an object"),
        );
    });

    it("Converts object options", () => {
        const declaration: ObjectDeclarationOption = {
            name: "test",
            help: emptyHelp,
            type: ParameterType.Object,
            defaultValue: { a: 1, b: 2 },
        };
        equal(
            convert({ b: 3 }, declaration, i18n, "", declaration.defaultValue),
            {
                a: 1,
                b: 3,
            },
        );
    });
});

describe("Options - default values", () => {
    function getDeclaration(
        type: ParameterType,
        defaultValue: unknown,
    ): DeclarationOption {
        return {
            type,
            defaultValue,
            name: "test",
            help: emptyHelp,
        } as DeclarationOption;
    }

    it("String", () => {
        equal(
            getDefaultValue(getDeclaration(ParameterType.String, void 0)),
            "",
        );
        equal(
            getDefaultValue(getDeclaration(ParameterType.String, "foo")),
            "foo",
        );
    });

    it("Path", () => {
        equal(getDefaultValue(getDeclaration(ParameterType.Path, void 0)), "");
        equal(
            getDefaultValue(getDeclaration(ParameterType.Path, "foo")),
            resolve("foo"),
        );
    });

    it("Number", () => {
        equal(getDefaultValue(getDeclaration(ParameterType.Number, void 0)), 0);
        equal(getDefaultValue(getDeclaration(ParameterType.Number, 123)), 123);
        ok(
            Number.isNaN(
                getDefaultValue(getDeclaration(ParameterType.Number, NaN)),
            ),
        );
    });

    it("Boolean", () => {
        equal(
            getDefaultValue(getDeclaration(ParameterType.Boolean, void 0)),
            false,
        );
        equal(
            getDefaultValue(getDeclaration(ParameterType.Boolean, true)),
            true,
        );
    });

    it("Map", () => {
        equal(
            getDefaultValue(getDeclaration(ParameterType.Map, void 0)),
            void 0,
        );
        const def = {};
        ok(getDefaultValue(getDeclaration(ParameterType.Map, def)) === def);
    });

    it("Mixed", () => {
        equal(
            getDefaultValue(getDeclaration(ParameterType.Mixed, void 0)),
            void 0,
        );
        const def = {};
        ok(getDefaultValue(getDeclaration(ParameterType.Mixed, def)) === def);
    });

    it("Array", () => {
        equal(getDefaultValue(getDeclaration(ParameterType.Array, void 0)), []);
        equal(getDefaultValue(getDeclaration(ParameterType.Array, ["a"])), [
            "a",
        ]);
    });

    it("PathArray", () => {
        equal(
            getDefaultValue(getDeclaration(ParameterType.PathArray, void 0)),
            [],
        );
        equal(getDefaultValue(getDeclaration(ParameterType.PathArray, ["a"])), [
            resolve("a"),
        ]);
        equal(
            getDefaultValue(getDeclaration(ParameterType.PathArray, ["/a"])),
            [resolve("/a")],
        );
    });

    it("ModuleArray", () => {
        equal(
            getDefaultValue(getDeclaration(ParameterType.ModuleArray, void 0)),
            [],
        );
        equal(
            getDefaultValue(getDeclaration(ParameterType.ModuleArray, ["a"])),
            ["a"],
        );
        equal(
            getDefaultValue(getDeclaration(ParameterType.ModuleArray, ["./a"])),
            [resolve("./a")],
        );
    });

    it("GlobArray", () => {
        equal(
            getDefaultValue(getDeclaration(ParameterType.GlobArray, void 0)),
            [],
        );
        equal(getDefaultValue(getDeclaration(ParameterType.GlobArray, ["a"])), [
            resolve("a"),
        ]);
        equal(
            getDefaultValue(getDeclaration(ParameterType.GlobArray, ["**a"])),
            ["**a"],
        );
        equal(
            getDefaultValue(getDeclaration(ParameterType.GlobArray, ["#!a"])),
            ["#!" + resolve("a")],
        );
    });
});
