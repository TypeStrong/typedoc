import { Logger, LogLevel, Options, ParameterType } from "../../../lib/utils";
import {
    BindOption,
    MapDeclarationOption,
    NumberDeclarationOption,
} from "../../../lib/utils/options";
import { deepStrictEqual as equal, throws } from "assert";
import type {
    DeclarationOption,
    EmitStrategy,
} from "../../../lib/utils/options";

describe("Options", () => {
    const logger = new Logger();
    const options = new Options(logger) as Options & {
        addDeclaration(declaration: Readonly<DeclarationOption>): void;
        getValue(name: string): unknown;
    };
    options.addDefaultDeclarations();
    options.addDeclaration({
        name: "mapped",
        type: ParameterType.Map,
        map: { a: 1 },
        defaultValue: 2,
        help: "",
    });

    it("Errors on duplicate declarations", () => {
        logger.resetErrors();
        options.addDeclaration({
            name: "help",
            help: "",
            type: ParameterType.Boolean,
        });
        equal(logger.hasErrors(), true);
    });

    it("Does not throw if number declaration has no min and max values", () => {
        const declaration: NumberDeclarationOption = {
            name: "test-number-declaration",
            help: "",
            type: ParameterType.Number,
            defaultValue: 1,
        };
        options.addDeclaration(declaration);
        options.removeDeclarationByName(declaration.name);
    });

    it("Does not throw if default value is out of range for number declaration", () => {
        const declaration: NumberDeclarationOption = {
            name: "test-number-declaration",
            help: "",
            type: ParameterType.Number,
            minValue: 1,
            maxValue: 10,
            defaultValue: 0,
        };
        options.addDeclaration(declaration);
        options.removeDeclarationByName(declaration.name);
    });

    it("Does not throw if a map declaration has a default value that is not part of the map of possible values", () => {
        const declaration: MapDeclarationOption<number> = {
            name: "testMapDeclarationWithForeignDefaultValue",
            help: "",
            type: ParameterType.Map,
            map: new Map([
                ["a", 1],
                ["b", 2],
            ]),
            defaultValue: 0,
        };
        options.addDeclaration(declaration);
        options.removeDeclarationByName(declaration.name);
    });

    it("Supports removing a declaration by name", () => {
        options.addDeclaration({ name: "not-an-option", help: "" });
        options.removeDeclarationByName("not-an-option");
        equal(options.getDeclaration("not-an-option"), undefined);
    });

    it("Ignores removal of non-existent declarations", () => {
        options.removeDeclarationByName("not-an-option");
        equal(options.getDeclaration("not-an-option"), undefined);
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
            options.setValue("validation", { notExported: "bad" } as never)
        );
    });

    it("Errors if setting a flag which does not exist", () => {
        throws(() =>
            options.setValue("validation", { doesNotExist: true } as never)
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
        const options = new Options(new Logger());
        options.addDefaultDeclarations();

        options.setValue("validation", { notExported: true });
        options.setValue("validation", { notExported: null! });
        equal(options.getValue("validation").notExported, true);

        options.setValue("validation", { notExported: false });
        options.setValue("validation", { notExported: null! });
        equal(options.getValue("validation").notExported, true);
    });

    it("Handles mapped enums properly", () => {
        const options = new Options(new Logger());
        options.addDefaultDeclarations();

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
        const options = new Options(new Logger());
        options.addDefaultDeclarations();
        equal(options.isSet("excludePrivate"), false);
        options.setValue("excludePrivate", false);
        equal(options.isSet("excludePrivate"), true);
        options.reset();
        equal(options.isSet("excludePrivate"), false);

        throws(() => options.isSet("does not exist" as never));
    });

    it("Throws if frozen and a value is set", () => {
        const options = new Options(new Logger());
        options.addDefaultDeclarations();
        options.freeze();

        throws(() => options.setValue("emit", true));
        throws(() => options.setCompilerOptions([], {}, []));
    });

    it("Supports resetting values", () => {
        const options = new Options(new Logger());
        options.addDefaultDeclarations();

        options.setValue("entryPoints", ["x"]);
        options.setValue("excludeTags", ["x"]);
        options.reset();

        equal(options.getValue("entryPoints"), []);
        equal(options.getValue("excludeTags"), []);
    });

    it("Supports resetting a single value", () => {
        const options = new Options(new Logger());
        options.addDefaultDeclarations();

        options.setValue("name", "test");
        options.setValue("excludeTags", ["x"]);
        options.reset("excludeTags");

        equal(options.getValue("name"), "test");
        equal(options.getValue("excludeTags"), []);
    });

    it("Throws if resetting a single value which does not exist", () => {
        const options = new Options(new Logger());
        options.addDefaultDeclarations();

        throws(() => options.reset("thisOptionDoesNotExist" as never));
    });
});

describe("BindOption", () => {
    class Container {
        constructor(public options: Options) {}

        @BindOption("emit")
        emit!: EmitStrategy;
    }

    it("Supports fetching options", () => {
        const options = new Options(new Logger());
        options.addDefaultDeclarations();

        const container = new Container(options);
        equal(container.emit, "docs");
    });

    it("Updates as option values change", () => {
        const options = new Options(new Logger());
        options.addDefaultDeclarations();

        const container = new Container(options);
        equal(container.emit, "docs");

        options.setValue("emit", "both");
        equal(container.emit, "both");
    });

    it("Caches set options when frozen", () => {
        const options = new Options(new Logger());
        options.addDefaultDeclarations();

        const container = new Container(options);

        options.setValue("emit", "both");
        options.freeze();
        equal(container.emit, "both");

        const prop = Object.getOwnPropertyDescriptor(container, "emit")!;
        equal(prop.get, void 0);
        equal(prop.value, "both");
    });
});
