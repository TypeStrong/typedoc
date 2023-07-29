import { deepStrictEqual as equal, ok, throws } from "assert";
import { join, resolve } from "path";
import {
    ArrayDeclarationOption,
    convert,
    DeclarationOption,
    getDefaultValue,
    MapDeclarationOption,
    MixedDeclarationOption,
    ObjectDeclarationOption,
    NumberDeclarationOption,
    ParameterType,
    StringDeclarationOption,
} from "../../../lib/utils/options/declaration";

describe("Options - conversions", () => {
    const optionWithType = (type: ParameterType) =>
        ({
            type,
            defaultValue: undefined,
            name: "test",
            help: "",
        }) as DeclarationOption;

    it("Converts to numbers", () => {
        equal(convert("123", optionWithType(ParameterType.Number), ""), 123);
        equal(convert("a", optionWithType(ParameterType.Number), ""), 0);
        equal(convert(NaN, optionWithType(ParameterType.Number), ""), 0);
    });

    it("Converts to number if value is the lowest allowed value for a number option", () => {
        const declaration: NumberDeclarationOption = {
            name: "test",
            help: "",
            type: ParameterType.Number,
            minValue: 1,
            maxValue: 10,
            defaultValue: 1,
        };
        equal(convert(1, declaration, ""), 1);
    });

    it("Generates an error if value is too low for a number option", () => {
        const declaration: NumberDeclarationOption = {
            name: "test",
            help: "",
            type: ParameterType.Number,
            minValue: 1,
            maxValue: 10,
            defaultValue: 1,
        };
        throws(
            () => convert(0, declaration, ""),
            new Error("test must be between 1 and 10"),
        );
    });

    it("Generates an error if value is too low for a number option with no max", () => {
        const declaration: NumberDeclarationOption = {
            name: "test",
            help: "",
            type: ParameterType.Number,
            minValue: 1,
            defaultValue: 1,
        };
        throws(
            () => convert(0, declaration, ""),
            new Error("test must be >= 1"),
        );
    });

    it("Generates an error if value is too high for a number option with no min", () => {
        const declaration: NumberDeclarationOption = {
            name: "test",
            help: "",
            type: ParameterType.Number,
            maxValue: 10,
            defaultValue: 1,
        };
        throws(
            () => convert(11, declaration, ""),
            new Error("test must be <= 10"),
        );
    });

    it("Converts to number if value is the highest allowed value for a number option", () => {
        const declaration: NumberDeclarationOption = {
            name: "test",
            help: "",
            type: ParameterType.Number,
            minValue: 1,
            maxValue: 10,
            defaultValue: 1,
        };
        equal(convert(10, declaration, ""), 10);
    });

    it("Generates an error if value is too high for a number option", () => {
        const declaration: NumberDeclarationOption = {
            name: "test",
            help: "",
            type: ParameterType.Number,
            minValue: 1,
            maxValue: 10,
            defaultValue: 1,
        };
        throws(
            () => convert(11, declaration, ""),
            new Error("test must be between 1 and 10"),
        );
    });

    it("Validates number options", () => {
        const declaration: NumberDeclarationOption = {
            name: "test",
            help: "",
            type: ParameterType.Number,
            validate: (value: number) => {
                if (value % 2 !== 0) {
                    throw new Error("test must be even");
                }
            },
        };
        equal(convert(0, declaration, ""), 0);
        equal(convert(2, declaration, ""), 2);
        equal(convert(4, declaration, ""), 4);
        throws(
            () => convert(1, declaration, ""),
            new Error("test must be even"),
        );
    });

    it("Converts to strings", () => {
        equal(convert("123", optionWithType(ParameterType.String), ""), "123");
        equal(convert(123, optionWithType(ParameterType.String), ""), "123");
        equal(
            convert(["1", "2"], optionWithType(ParameterType.String), ""),
            "1,2",
        );
        equal(convert(null, optionWithType(ParameterType.String), ""), "");
        equal(convert(void 0, optionWithType(ParameterType.String), ""), "");
    });

    it("Validates string options", () => {
        const declaration: StringDeclarationOption = {
            name: "test",
            help: "",
            type: ParameterType.String,
            validate: (value: string) => {
                if (value !== value.toUpperCase()) {
                    throw new Error("test must be upper case");
                }
            },
        };
        equal(convert("TOASTY", declaration, ""), "TOASTY");
        throws(
            () => convert("toasty", declaration, ""),
            new Error("test must be upper case"),
        );
    });

    it("Converts to booleans", () => {
        equal(convert("a", optionWithType(ParameterType.Boolean), ""), true);
        equal(convert([1], optionWithType(ParameterType.Boolean), ""), true);
        equal(convert(false, optionWithType(ParameterType.Boolean), ""), false);
    });

    it("Converts to arrays", () => {
        equal(convert("12,3", optionWithType(ParameterType.Array), ""), [
            "12,3",
        ]);
        equal(convert(["12,3"], optionWithType(ParameterType.Array), ""), [
            "12,3",
        ]);
        equal(convert(true, optionWithType(ParameterType.Array), ""), []);

        equal(convert("/,a", optionWithType(ParameterType.PathArray), ""), [
            resolve("/,a"),
        ]);
        equal(convert(["/foo"], optionWithType(ParameterType.PathArray), ""), [
            resolve("/foo"),
        ]);
        equal(convert(true, optionWithType(ParameterType.PathArray), ""), []);

        equal(convert("a,b", optionWithType(ParameterType.ModuleArray), ""), [
            "a,b",
        ]);
        equal(convert(["a,b"], optionWithType(ParameterType.ModuleArray), ""), [
            "a,b",
        ]);
        equal(convert(true, optionWithType(ParameterType.ModuleArray), ""), []);
    });

    it("ModuleArray is resolved if relative", () => {
        equal(
            convert(["./foo"], optionWithType(ParameterType.ModuleArray), ""),
            [join(process.cwd(), "foo")],
        );
    });

    it("Validates array options", () => {
        const declaration: ArrayDeclarationOption = {
            name: "test",
            help: "",
            type: ParameterType.Array,
            validate: (value: string[]) => {
                if (value.length === 0) {
                    throw new Error("test must not be empty");
                }
            },
        };
        equal(convert(["1"], declaration, ""), ["1"]);
        equal(convert(["1", "2"], declaration, ""), ["1", "2"]);
        throws(
            () => convert([], declaration, ""),
            new Error("test must not be empty"),
        );
    });

    it("Converts to mapped types", () => {
        const declaration: MapDeclarationOption<number> = {
            name: "",
            help: "",
            type: ParameterType.Map,
            map: {
                a: 1,
                b: 2,
            },
            defaultValue: 1,
        };
        equal(convert("a", declaration, ""), 1);
        equal(convert("b", declaration, ""), 2);
        equal(convert(2, declaration, ""), 2);
    });

    it("Converts to mapped types with a map", () => {
        const declaration: MapDeclarationOption<number> = {
            name: "",
            help: "",
            type: ParameterType.Map,
            map: new Map([
                ["a", 1],
                ["b", 2],
            ]),
            defaultValue: 1,
        };
        equal(convert("a", declaration, ""), 1);
        equal(convert("b", declaration, ""), 2);
        equal(convert(2, declaration, ""), 2);
    });

    it("Uses the mapError if provided for errors", () => {
        const declaration: MapDeclarationOption<number> = {
            name: "",
            help: "",
            type: ParameterType.Map,
            map: {},
            defaultValue: 1,
            mapError: "Test error",
        };
        throws(
            () => convert("a", declaration, ""),
            new Error(declaration.mapError),
        );
    });

    it("Generates a nice error if no mapError is provided", () => {
        const declaration: MapDeclarationOption<number> = {
            name: "test",
            help: "",
            type: ParameterType.Map,
            map: new Map([
                ["a", 1],
                ["b", 2],
            ]),
            defaultValue: 1,
        };
        throws(
            () => convert("c", declaration, ""),
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
            help: "",
            type: ParameterType.Map,
            map: Enum,
            defaultValue: Enum.a,
        } as const;
        throws(
            () => convert("c", declaration, ""),
            new Error("test must be one of a, b"),
        );
    });

    it("Passes through mixed", () => {
        const data = Symbol();
        equal(convert(data, optionWithType(ParameterType.Mixed), ""), data);
    });

    it("Validates mixed options", () => {
        const declaration: MixedDeclarationOption = {
            name: "test",
            help: "",
            type: ParameterType.Mixed,
            defaultValue: "default",
            validate: (value: unknown) => {
                if (typeof value === "number") {
                    throw new Error("test must not be a number");
                }
            },
        };
        equal(convert("text", declaration, ""), "text");
        throws(
            () => convert(1, declaration, ""),
            new Error("test must not be a number"),
        );
    });
    it("Passes through object", () => {
        const data = {};
        equal(convert(data, optionWithType(ParameterType.Object), ""), data);
    });

    it("Validates object options", () => {
        const declaration: ObjectDeclarationOption = {
            name: "test",
            help: "",
            type: ParameterType.Object,
            defaultValue: "default",
            validate: (value: unknown) => {
                if (typeof value !== "object" || Array.isArray(value)) {
                    throw new Error("test must be an object");
                }
            },
        };
        equal(convert({}, declaration, ""), {});
        throws(
            () => convert(1, declaration, ""),
            new Error("test must be an object"),
        );
    });

    it("Converts object options", () => {
        const declaration: ObjectDeclarationOption = {
            name: "test",
            help: "",
            type: ParameterType.Object,
            defaultValue: { a: 1, b: 2 },
        };
        equal(convert({ b: 3 }, declaration, "", declaration.defaultValue), {
            a: 1,
            b: 3,
        });
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
            help: "",
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
