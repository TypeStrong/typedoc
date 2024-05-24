import ts from "typescript";
import { ok } from "assert/strict";
import { Logger, Options, TSConfigReader } from "../..";
import { join } from "path";
import { existsSync, readFileSync } from "fs";
import { Internationalization } from "../../lib/internationalization/internationalization";

describe("Internationalization", () => {
    it("Does not include strings in translatable object which are unused", () => {
        const options = new Options(new Internationalization(null).proxy);
        const tsconfigReader = new TSConfigReader();
        tsconfigReader.read(options, new Logger(), process.cwd());

        const translatableTs = join(
            __dirname,
            "../../lib/internationalization/translatable.ts",
        );

        const host: ts.LanguageServiceHost = {
            getScriptFileNames: () => options.getFileNames().slice(),
            getScriptVersion: () => "unused",
            getScriptSnapshot: (fileName) => {
                if (!existsSync(fileName)) return undefined;
                return ts.ScriptSnapshot.fromString(
                    readFileSync(fileName, "utf-8"),
                );
            },
            getCurrentDirectory: () => process.cwd(),
            getCompilationSettings: () => options.getCompilerOptions(),
            getDefaultLibFileName: (opts) => ts.getDefaultLibFilePath(opts),
            fileExists: ts.sys.fileExists,
            readFile: ts.sys.readFile,
            readDirectory: ts.sys.readDirectory,
            directoryExists: ts.sys.directoryExists,
            getDirectories: ts.sys.getDirectories,
        };

        const service = ts.createLanguageService(
            host,
            ts.createDocumentRegistry(),
        );

        const program = service.getProgram();
        ok(program, "Failed to get program for i18n analysis");

        const sf = program.getSourceFile(translatableTs);
        ok(sf, "Failed to get source file");

        const moduleSymbol = program.getTypeChecker().getSymbolAtLocation(sf)!;
        const translatable = program
            .getTypeChecker()
            .tryGetMemberInModuleExports("translatable", moduleSymbol);
        ok(translatable, "Failed to get translatable symbol");

        ok(ts.isVariableDeclaration(translatable.valueDeclaration!));
        ok(ts.isAsExpression(translatable.valueDeclaration.initializer!));
        ok(
            ts.isObjectLiteralExpression(
                translatable.valueDeclaration.initializer.expression,
            ),
        );
        const translatableObj =
            translatable.valueDeclaration.initializer.expression;

        translatableObj.forEachChild((child) => {
            ok(ts.isPropertyAssignment(child));
            const refs = service.getReferencesAtPosition(
                sf.fileName,
                child.getStart(),
            );
            const refCount =
                refs?.filter(
                    (ref) =>
                        !/locales\/.*\.cts$/.test(ref.fileName) &&
                        !ref.fileName.endsWith("translatable.ts"),
                ).length ?? 0;
            ok(
                refCount,
                `Translatable key ${child.name.getText()} is not referenced.`,
            );
        });

        service.dispose();
    });
});
