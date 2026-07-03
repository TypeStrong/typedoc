// @ts-check

import ts from "typescript";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Logger, Options, TSConfigReader } from "typedoc";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, watchFile, writeFileSync } from "node:fs";
import { ok } from "node:assert";

const browserBundleFolders = [
    "/utils-common/",
    "/models/",
    "/serialization/",
];

const localesDirTs = join(
    fileURLToPath(import.meta.url),
    "../../src/lib/internationalization/locales",
);

const distDir = join(
    fileURLToPath(import.meta.url),
    "../../dist/browser-locales",
);

const options = new Options();
options.setValue("tsconfig", "src/lib");
const tsconfigReader = new TSConfigReader();
tsconfigReader.read(options, new Logger(), process.cwd());

/** @type {Record<string, number>} */
const files = {};

/** @type {ts.LanguageServiceHost} */
const host = {
    getScriptFileNames: () => options.getFileNames().slice(),
    getScriptVersion: (fileName) => files[fileName]?.toString(),
    getScriptSnapshot: (fileName) => {
        if (!existsSync(fileName)) return undefined;
        return ts.ScriptSnapshot.fromString(
            readFileSync(fileName, "utf-8"),
        );
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => options.getCompilerOptions(new Logger()),
    getDefaultLibFileName: ts.getDefaultLibFilePath,
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

/**
 * @param {ts.Program} program
 * @param {ts.TypeChecker} checker
 */
function buildLocaleExports(program, checker) {
    const sf = program.getSourceFile(join(localesDirTs, "en.ts"));
    ok(sf, "Failed to get source file");

    const moduleSymbol = checker.getSymbolAtLocation(sf);
    const translatable = moduleSymbol?.exports?.get(
        /** @type {ts.__String} */ ("default"),
    );
    ok(translatable, "Failed to get translatable symbol");

    ok(translatable.valueDeclaration && ts.isExportAssignment(translatable.valueDeclaration));
    ok(ts.isAsExpression(translatable.valueDeclaration.expression));
    ok(
        ts.isObjectLiteralExpression(
            translatable.valueDeclaration.expression.expression,
        ),
    );
    const translatableObj = translatable.valueDeclaration.expression.expression;

    /** @type {Record<string, string>} */
    const defaultTranslations = {};

    translatableObj.forEachChild((child) => {
        ok(ts.isPropertyAssignment(child));
        const refs = service.getReferencesAtPosition(
            sf.fileName,
            child.getStart(),
        );
        if (refs?.some(ref => browserBundleFolders.some(f => ref.fileName.includes(f)))) {
            ok(ts.isStringLiteral(child.initializer) || ts.isNoSubstitutionTemplateLiteral(child.initializer));
            defaultTranslations[child.name.getText()] = child.initializer.text;
        }
    });

    rmSync(distDir, { recursive: true, force: true });
    mkdirSync(distDir, { recursive: true });

    for (const locale of readdirSync(localesDirTs)) {
        const sf = program.getSourceFile(join(localesDirTs, locale));
        ok(sf, "Failed to get locale source file: " + locale);

        const exp = program.getTypeChecker().getSymbolAtLocation(sf);
        const defExp = exp?.exports?.get(/** @type {ts.__String} */ ("default"));
        ok(defExp, "Missing default export for locale: " + locale);
        const type = checker.getTypeOfSymbol(defExp);

        const translations = { ...defaultTranslations };
        for (const prop of type.getProperties()) {
            if (prop.name in translations) {
                const propType = checker.getTypeOfSymbol(prop);
                ok(propType.isStringLiteral(), prop.name + " is " + checker.typeToString(propType));
                translations[prop.name] = propType.value;
            }
        }

        writeFileSync(
            join(distDir, locale.replace(".ts", ".js")),
            `export default ${JSON.stringify(translations, null, 4)}\n`,
        );

        writeFileSync(
            join(distDir, locale.replace(".ts", ".d.ts")),
            `const translations: Record<string, string>;\nexport default translations;\n`,
        );
    }
    program.emit();
}

const program = service.getProgram();
ok(program, "Failed to get program for i18n analysis");

for (const sf of program.getSourceFiles()) {
    files[sf.fileName] = 0;
}

const checker = program.getTypeChecker();

if (process.argv.some(arg => arg === "--watch" || arg === "-w")) {
    for (const locale of readdirSync(localesDirTs)) {
        const file = join(localesDirTs, locale);
        watchFile(file, { interval: 250, persistent: true }, (curr, prev) => {
            if (+curr.mtime > +prev.mtime) {
                files[file]++;
                buildLocaleExports(program, checker);
            }
        });
    }
    buildLocaleExports(program, checker);
} else {
    buildLocaleExports(program, checker);
    service.dispose();
}
