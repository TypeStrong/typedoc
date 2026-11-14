// @ts-check

import * as ts from "typescript/ast";
import { API } from "typescript/sync";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, readdirSync, rmSync, watchFile, writeFileSync } from "node:fs";
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

const tsconfig = join(process.cwd(), "src/lib/tsconfig.json");

/**
 * @param {string[]} changedFiles
 */
function buildLocaleExports(changedFiles = []) {
    const api = new API({ cwd: process.cwd() });
    const snapshot = api.createSnapshot({
        openProjects: [tsconfig],
        fileNotifications: { changed: changedFiles },
    });
    const project = snapshot.getConfiguredProject(tsconfig);
    ok(project, "Failed to get program for i18n analysis");
    const { program, checker } = project;

    const sf = program.getSourceFile(join(localesDirTs, "en.ts"));
    ok(sf, "Failed to get source file");

    const moduleSymbol = checker.getSymbolAtLocation(sf);
    const translatable = moduleSymbol?.getExports().get(
        /** @type {ts.__String} */ ("default"),
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

    /** @type {Record<string, string>} */
    const defaultTranslations = {};

    translatableObj.forEachChild((child) => {
        ok(ts.isPropertyAssignment(child));
        const refs = project.languageService
            .getReferencedSymbolsForNode(child.name, child.name.getStart())
            .flatMap((entry) => entry.references);
        if (refs.some(ref => browserBundleFolders.some(f => ref.path.includes(f)))) {
            ok(ts.isStringLiteral(child.initializer) || ts.isNoSubstitutionTemplateLiteral(child.initializer));
            defaultTranslations[child.name.getText()] = child.initializer.text;
        }
    });

    rmSync(distDir, { recursive: true, force: true });
    mkdirSync(distDir, { recursive: true });

    for (const locale of readdirSync(localesDirTs)) {
        const sf = program.getSourceFile(join(localesDirTs, locale));
        ok(sf, "Failed to get locale source file: " + locale);

        const exp = checker.getSymbolAtLocation(sf);
        const defExp = exp?.getExports().get(/** @type {ts.__String} */ ("default"));
        ok(defExp, "Missing default export for locale: " + locale);
        const type = checker.getTypeOfSymbol(defExp);

        const translations = { ...defaultTranslations };
        for (const prop of type.getProperties()) {
            if (prop.name in translations) {
                const propType = checker.getTypeOfSymbol(prop);
                ok(propType.isStringLiteralType(), prop.name + " is " + checker.typeToString(propType));
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
    api.close();
}

if (process.argv.some(arg => arg === "--watch" || arg === "-w")) {
    for (const locale of readdirSync(localesDirTs)) {
        const file = join(localesDirTs, locale);
        watchFile(file, { interval: 250, persistent: true }, (curr, prev) => {
            if (+curr.mtime > +prev.mtime) {
                buildLocaleExports([file]);
            }
        });
    }
}
buildLocaleExports();
