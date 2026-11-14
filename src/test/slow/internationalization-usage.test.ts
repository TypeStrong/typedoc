import { ok } from "assert/strict";
import { Logger, Options, TSConfigReader, TypeScript as ts } from "../../lib/index.js";
import { getTypeScriptApi } from "../../lib/utils/compiler.js";
import { join } from "path";
import { fileURLToPath } from "url";

describe("Internationalization", () => {
    it("Does not include strings in translatable object which are unused", () => {
        const options = new Options();
        options.setValue("tsconfig", "src/lib");
        const tsconfigReader = new TSConfigReader();
        const logger = new Logger();
        tsconfigReader.read(options, logger, process.cwd());

        const defaultLocaleTs = join(
            fileURLToPath(import.meta.url),
            "../../../lib/internationalization/locales/en.ts",
        );

        const tsconfig = join(process.cwd(), "src/lib/tsconfig.json");
        const snapshot = getTypeScriptApi().createSnapshot({ openProjects: [tsconfig] });
        const project = snapshot.getConfiguredProject(tsconfig);
        ok(project, "Failed to get program for i18n analysis");

        const sf = project.program.getSourceFile(defaultLocaleTs);
        ok(sf, "Failed to get source file");

        const moduleSymbol = project.checker.getSymbolAtLocation(sf)!;
        const translatable = moduleSymbol.getExports().get(
            "default" as ts.__String,
        );
        ok(translatable, "Failed to get translatable symbol");

        const declaration = translatable.valueDeclaration?.resolve();
        ok(declaration && ts.isExportAssignment(declaration));
        ok(ts.isAsExpression(declaration.expression));
        ok(
            ts.isObjectLiteralExpression(
                declaration.expression.expression,
            ),
        );
        const translatableObj = declaration.expression.expression;

        translatableObj.forEachChild((child) => {
            ok(ts.isPropertyAssignment(child));
            const refs = project.languageService.getReferencedSymbolsForNode(
                child.name,
                child.name.getStart(),
            );
            const refCount = refs
                .flatMap((entry) => entry.references)
                .filter(
                    (ref) =>
                        !/locales\/.*\.cts$/.test(ref.path) &&
                        !ref.path.endsWith("translatable.ts"),
                ).length;
            ok(
                refCount,
                `Translatable key ${child.name.getText()} is not referenced.`,
            );
        });

        snapshot.dispose();
    });
});
