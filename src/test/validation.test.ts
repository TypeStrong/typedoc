import { ok } from "assert";
import { join } from "path";
import { validateDocumentation } from "../lib/validation/documentation";
import { validateExports } from "../lib/validation/exports";
import { getConverter2App, getConverter2Program } from "./programs";
import { TestLogger } from "./TestLogger";

function convertValidationFile(file: string) {
    const app = getConverter2App();
    const program = getConverter2Program();
    const sourceFile = program.getSourceFile(
        join(__dirname, "converter2/validation", file),
    );

    ok(sourceFile, "Specified source file does not exist.");

    const project = app.converter.convert([
        {
            displayName: "validation",
            program,
            sourceFile,
        },
    ]);

    return project;
}

function expectWarning(
    typeName: string,
    file: string,
    referencingName: string,
    intentionallyNotExported: readonly string[] = [],
) {
    const project = convertValidationFile(file);

    const logger = new TestLogger();
    validateExports(project, logger, intentionallyNotExported);

    logger.expectMessage(
        `warn: ${typeName}, defined in */${file}, is referenced by ${referencingName} but not included in the documentation`,
    );
}

function expectNoWarning(
    file: string,
    intentionallyNotExported: readonly string[] = [],
) {
    const app = getConverter2App();
    const program = getConverter2Program();
    const sourceFile = program.getSourceFile(
        join(__dirname, "converter2/validation", file),
    );

    ok(sourceFile, "Specified source file does not exist.");

    const project = app.converter.convert([
        {
            displayName: "validation",
            program,
            sourceFile,
        },
    ]);

    const logger = new TestLogger();

    validateExports(project, logger, intentionallyNotExported);
    logger.expectNoOtherMessages();
}

describe("validateExports", () => {
    it("Should warn if a variable type is missing", () => {
        expectWarning("Foo", "variable.ts", "foo");
    });

    it("Should warn if a type parameter clause is missing", () => {
        expectWarning("Foo", "typeParameter.ts", "Bar.T");
    });

    it("Should warn if an index signature type is missing", () => {
        expectWarning("Bar", "indexSignature.ts", "Foo.__index");
    });

    it("Should warn within object types", () => {
        expectWarning("Foo", "object.ts", "x.__type.foo");
    });

    it("Should warn if a get signature type is missing", () => {
        expectWarning("Bar", "getSignature.ts", "Foo.foo");
    });

    it("Should warn if a set signature type is missing", () => {
        expectWarning("Bar", "setSignature.ts", "Foo.foo._value");
    });

    it("Should warn if an implemented type is missing", () => {
        expectWarning("Bar", "implemented.ts", "Foo");
    });

    it("Should warn if a parameter type is missing", () => {
        expectWarning("Bar", "parameter.ts", "Foo.x");
    });

    it("Should warn if a return type is missing", () => {
        expectWarning("Bar", "return.ts", "foo");
    });

    it("Should allow filtering warnings by file name", () => {
        expectNoWarning("variable.ts", ["variable.ts:Foo"]);
        expectNoWarning("variable.ts", ["validation/variable.ts:Foo"]);
        expectNoWarning("variable.ts", ["Foo"]);
    });

    it("Should not apply warnings filtered by file name to other files", () => {
        expectWarning("Foo", "variable.ts", "foo", ["notVariable.ts:Foo"]);
    });

    it("Should not produce warnings for types originating in node_modules", () => {
        expectNoWarning("externalType.ts");
    });

    it("Should not warn if namespaced name is given to intentionallyNotExported", () => {
        expectNoWarning("namespace.ts", ["Bar.Baz"]);
    });

    it("Should warn if intentionallyNotExported contains unused values", () => {
        const app = getConverter2App();
        const program = getConverter2Program();
        const sourceFile = program.getSourceFile(
            join(__dirname, "converter2/validation/variable.ts"),
        );

        ok(sourceFile, "Specified source file does not exist.");

        const project = app.converter.convert([
            {
                displayName: "validation",
                program,
                sourceFile,
            },
        ]);

        const logger = new TestLogger();
        validateExports(project, logger, ["notDefined", "Foo"]);
        logger.expectMessage(
            "warn: The following symbols were marked as intentionally not exported, but were either not referenced in the documentation, or were exported:\n\tnotDefined",
        );
        logger.expectNoOtherMessages();
    });
});

describe("validateDocumentation", () => {
    it("Should correctly handle functions", () => {
        const project = convertValidationFile("function.ts");
        const logger = new TestLogger();
        validateDocumentation(project, logger, ["Function"]);

        logger.expectMessage(
            "warn: bar (CallSignature), defined in */function.ts, does not have any documentation",
        );
        logger.expectNoOtherMessages();
    });

    it("Should correctly handle accessors", () => {
        const project = convertValidationFile("getSignature.ts");
        const logger = new TestLogger();
        validateDocumentation(project, logger, ["Accessor"]);

        logger.expectMessage(
            "warn: Foo.foo (GetSignature), defined in */getSignature.ts, does not have any documentation",
        );
        logger.expectNoOtherMessages();
    });

    it("Should correctly handle constructors", () => {
        const project = convertValidationFile("class.ts");
        const logger = new TestLogger();
        validateDocumentation(project, logger, ["Constructor"]);

        logger.expectMessage(
            "warn: Foo.constructor (ConstructorSignature), defined in */class.ts, does not have any documentation",
        );
        logger.expectNoOtherMessages();
    });

    it("Should correctly handle interfaces", () => {
        const project = convertValidationFile("interface.ts");
        const logger = new TestLogger();
        validateDocumentation(project, logger, ["Method"]);

        logger.expectMessage(
            "warn: Foo.method (CallSignature), defined in */interface.ts, does not have any documentation",
        );
        logger.expectNoOtherMessages();
    });

    it("Should correctly handle callback parameters", () => {
        const project = convertValidationFile("callbackParameters.ts");
        const logger = new TestLogger();
        validateDocumentation(project, logger, ["Parameter", "Property"]);

        logger.expectNoOtherMessages();
    });
});
