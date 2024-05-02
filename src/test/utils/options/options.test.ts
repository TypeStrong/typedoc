import { LogLevel, Options, ParameterType } from "../../../lib/utils";
import {
    Option,
    type MapDeclarationOption,
    type NumberDeclarationOption,
} from "../../../lib/utils";
import { deepStrictEqual as equal, throws } from "assert";
import type {
    DeclarationOption,
    EmitStrategy,
} from "../../../lib/utils/options";
import { Internationalization } from "../../../lib/internationalization/internationalization";

describe("Options", () => {
    let options: Options & {
        addDeclaration(declaration: Readonly<DeclarationOption>): void;
        getValue(name: string): unknown;
    };

    beforeEach(() => {
        options = new Options(new Internationalization(null).proxy);
        options.addDeclaration({
            name: "mapped",
            type: ParameterType.Map,
            map: { a: 1 },
            defaultValue: 2,
            help: () => "",
        });
    });

    it("Errors on duplicate declarations", () => {
        let threw = false;
        try {
            options.addDeclaration({
                name: "help",
                help: () => "",
                type: ParameterType.Boolean,
            });
        } catch {
            threw = true;
        }

        equal(threw, true);
    });

    it("Does not throw if number declaration has no min and max values", () => {
        const declaration: NumberDeclarationOption = {
            name: "test-number-declaration",
            help: () => "",
            type: ParameterType.Number,
            defaultValue: 1,
        };
        options.addDeclaration(declaration);
    });

    it("Does not throw if default value is out of range for number declaration", () => {
        const declaration: NumberDeclarationOption = {
            name: "test-number-declaration",
            help: () => "",
            type: ParameterType.Number,
            minValue: 1,
            maxValue: 10,
            defaultValue: 0,
        };
        options.addDeclaration(declaration);
    });

    it("Does not throw if a map declaration has a default value that is not part of the map of possible values", () => {
        const declaration: MapDeclarationOption<number> = {
            name: "testMapDeclarationWithForeignDefaultValue",
            help: () => "",
            type: ParameterType.Map,
            map: new Map([
                ["a", 1],
                ["b", 2],
            ]),
            defaultValue: 0,
        };
        options.addDeclaration(declaration);
    });

    it("Throws on attempt to get an undeclared option", () => {
        throws(() => options.getValue("does-not-exist"));
    });

    it("Does not allow fetching compiler options through getValue", () => {
        throws(() => options.getValue("target"));
    });

    it("Errors if converting a set value errors", () => {
        throws(() => options.setValue("mapped" as any, "nonsense" as any));
    });

    it("Errors if setting flags to an invalid value", () => {
        throws(() => options.setValue("validation", "bad" as never));
        throws(() => options.setValue("validation", void 0 as never));
        throws(() =>
            options.setValue("validation", { notExported: "bad" } as never),
        );
    });

    it("Errors if setting a flag which does not exist", () => {
        throws(() =>
            options.setValue("validation", { doesNotExist: true } as never),
        );
    });

    it("Allows setting flag objects to true/false", () => {
        options.setValue("validation", true);
        equal(options.getValue("validation"), {
            notExported: true,
            notDocumented: true,
            invalidLink: true,
        });

        options.setValue("validation", false);
        equal(options.getValue("validation"), {
            notExported: false,
            notDocumented: false,
            invalidLink: false,
        });
    });

    it("Resets a flag to the default if set to null", () => {
        const options = new Options(new Internationalization(null).proxy);

        options.setValue("validation", { notExported: true });
        options.setValue("validation", { notExported: null! });
        equal(options.getValue("validation").notExported, true);

        options.setValue("validation", { notExported: false });
        options.setValue("validation", { notExported: null! });
        equal(options.getValue("validation").notExported, true);
    });

    it("Handles mapped enums properly", () => {
        const options = new Options(new Internationalization(null).proxy);

        equal(options.getValue("logLevel"), LogLevel.Info);
        options.setValue("logLevel", LogLevel.Error);
        equal(options.getValue("logLevel"), LogLevel.Error);
        options.setValue("logLevel", "Verbose");
        equal(options.getValue("logLevel"), LogLevel.Verbose);
    });

    it("Supports directly getting values", () => {
        equal(options.getRawValues().entryPoints, []);
    });

    it("Supports checking if an option is set", () => {
        const options = new Options(new Internationalization(null).proxy);
        equal(options.isSet("excludePrivate"), false);
        options.setValue("excludePrivate", false);
        equal(options.isSet("excludePrivate"), true);
        options.reset();
        equal(options.isSet("excludePrivate"), false);

        throws(() => options.isSet("does not exist" as never));
    });

    it("Throws if frozen and a value is set", () => {
        const options = new Options(new Internationalization(null).proxy);
        options.freeze();

        throws(() => options.setValue("categorizeByGroup", true));
        throws(() => options.setCompilerOptions([], {}, []));
    });

    it("Supports resetting values", () => {
        const options = new Options(new Internationalization(null).proxy);

        options.setValue("entryPoints", ["x"]);
        const oldExcludeTags = options.getValue("excludeTags");
        options.setValue("excludeTags", ["@x"]);
        options.reset();

        equal(options.getValue("entryPoints"), []);
        equal(options.getValue("excludeTags"), oldExcludeTags);
    });

    it("Supports resetting a single value", () => {
        const options = new Options(new Internationalization(null).proxy);

        options.setValue("name", "test");
        const originalExclude = options.getValue("excludeTags");
        options.setValue("excludeTags", ["@x"]);
        options.reset("excludeTags");

        equal(options.getValue("name"), "test");
        equal(options.getValue("excludeTags"), originalExclude);
    });

    it("Throws if resetting a single value which does not exist", () => {
        const options = new Options(new Internationalization(null).proxy);

        throws(() => options.reset("thisOptionDoesNotExist" as never));
    });
});

describe("Option", () => {
    class Container {
        constructor(public options: Options) {}

        @Option("emit")
        accessor emit!: EmitStrategy;
    }

    it("Supports fetching options", () => {
        const options = new Options(new Internationalization(null).proxy);

        const container = new Container(options);
        equal(container.emit, "docs");
    });

    it("Updates as option values change", () => {
        const options = new Options(new Internationalization(null).proxy);

        const container = new Container(options);
        equal(container.emit, "docs");

        options.setValue("emit", "both");
        equal(container.emit, "both");
    });
});
