// @ts-check

import ts from "typescript";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Logger, Options, TSConfigReader } from "typedoc";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { ok } from "node:assert";
import { createRequire } from "node:module";

const browserBundleFolders = [
    "/utils-common/",
    "/models/",
    "/serialization/",
];

const localesDirTs = join(
    fileURLToPath(import.meta.url),
    "../../src/lib/internationalization/locales",
);

const localesDir = join(
    fileURLToPath(import.meta.url),
    "../../dist/lib/internationalization/locales",
);

const distDir = join(
    fileURLToPath(import.meta.url),
    "../../dist/browser-locales",
);

const options = new Options();
const tsconfigReader = new TSConfigReader();
tsconfigReader.read(options, new Logger(), process.cwd());

/** @type {ts.LanguageServiceHost} */
const host = {
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

const sf = program.getSourceFile(join(localesDirTs, "en.cts"));
ok(sf, "Failed to get source file");

const moduleSymbol = program.getTypeChecker().getSymbolAtLocation(sf);
const translatable = moduleSymbol?.exports?.get(
    /** @type {ts.__String} */ ("export="),
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

/** @type {string[]} */
const bundleUsedTranslationKeys = [];

translatableObj.forEachChild((child) => {
    ok(ts.isPropertyAssignment(child));
    const refs = service.getReferencesAtPosition(
        sf.fileName,
        child.getStart(),
    );

    if (refs?.some(ref => browserBundleFolders.some(f => ref.fileName.includes(f)))) {
        bundleUsedTranslationKeys.push(child.name.getText());
    }
});

service.dispose();

const req = createRequire(import.meta.url);
const enLocale = req(join(localesDir, "en.cjs"));

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

for (const locale of readdirSync(localesDir)) {
    if (!locale.endsWith(".cjs")) continue;
    console.log(`Processing ${locale}`);

    const browserTranslations = {};
    const translations = req(join(localesDir, locale));
    for (const key of bundleUsedTranslationKeys) {
        browserTranslations[key] = translations[key] || enLocale[key];
    }

    writeFileSync(
        join(distDir, locale.replace(".cjs", ".js")),
        `export default ${JSON.stringify(browserTranslations, null, 4)}\n`,
    );

    writeFileSync(
        join(distDir, locale.replace(".cjs", ".d.ts")),
        `const translations: Record<string, string>;\nexport default translations;\n`,
    );
}
