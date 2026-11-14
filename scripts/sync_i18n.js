import { execSync } from "child_process";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import * as ts from "typescript/ast";
import { API } from "typescript/sync";

const api = new API();

/**
 * @param {string} fileName
 * @param {string} path
 */
function parseFile(fileName, path) {
    return api.createSourceFile(fileName, readFileSync(path, "utf-8")).sourceFile;
}

function findDescendants(node, match) {
    const visitor = (node) => {
        if (match(node)) {
            return node;
        }
        return node.forEachChild(visitor);
    };
    return node.forEachChild(visitor);
}

function loadTags() {
    const sourceFile = parseFile("tsdoc-defaults.ts", "src/lib/utils/options/tsdoc-defaults.ts");
    const decls = {};
    for (const statement of sourceFile.statements) {
        if (ts.isVariableStatement(statement)) {
            for (const decl of statement.declarationList.declarations) {
                const name = decl.name.getText();
                /** @type {ts.ArrayLiteralExpression | undefined} */
                const arrayLiteral = findDescendants(decl.initializer, ts.isArrayLiteralExpression);
                if (arrayLiteral) {
                    const tags = [];
                    for (const el of arrayLiteral.elements) {
                        if (ts.isStringLiteral(el)) {
                            tags.push(el.text);
                        } else if (ts.isSpreadElement(el) && ts.isIdentifier(el.expression)) {
                            tags.push(...decls[el.expression.text]);
                        }
                    }
                    decls[name] = tags;
                }
            }
        } else {
            throw new Error(`Unexpected node ${ts.SyntaxKind[statement.kind]}`);
        }
    }
    return decls;
}

function loadEnLocale() {
    const sourceFile = parseFile("en.ts", "src/lib/internationalization/locales/en.ts");
    let indent;
    /** @type {ts.ObjectLiteralExpression | undefined} */
    const langObjectLiteral = findDescendants(sourceFile, ts.isObjectLiteralExpression);
    if (!langObjectLiteral) {
        throw new Error(`Cannot find language object literal`);
    }
    const properties = [];
    for (const propertyAssignment of langObjectLiteral.properties) {
        if (ts.isPropertyAssignment(propertyAssignment)) {
            if (indent === undefined) {
                const pos = propertyAssignment.getStart();
                const lnCol = sourceFile.getLineAndCharacterOfPosition(pos);
                const lnStart = sourceFile.getLineStarts()[lnCol.line];
                indent = sourceFile.getFullText().slice(lnStart, pos);
            }
            properties.push({
                name: propertyAssignment.name.getText(),
                nameWithComment: propertyAssignment.name.getFullText(),
                initializer: propertyAssignment.initializer.getText(),
            });
        } else {
            throw new Error(`Unexpected node ${ts.SyntaxKind[propertyAssignment.kind]}`);
        }
    }
    const tags = loadTags();
    const mapTagProperties = (tags, comment) => {
        return tags.map((tag, index) => {
            const tagName = tag.replace(/^@(.*)$/, "$1");
            const tagTranslateKey = `tag_${tagName}`;
            let nameWithComment = `\n${indent}${tagTranslateKey}`;
            if (index === 0) {
                nameWithComment = `\n\n${indent}// ${comment}${nameWithComment}`;
            }
            const tagDefaultTranslation = tagName.substring(0, 1).toUpperCase() +
                tagName
                    .substring(1)
                    .replace(
                        /[a-z][A-Z]/g,
                        (x) => `${x[0]} ${x[1]}`,
                    );
            return {
                name: tagTranslateKey,
                nameWithComment,
                initializer: `"${tagDefaultTranslation}"`,
            };
        });
    };
    properties.push(...mapTagProperties(tags.blockTags, "Block tags"));
    properties.push(...mapTagProperties(tags.inlineTags, "Inline tags"));
    properties.push(...mapTagProperties(tags.modifierTags, "Modifier tags"));
    const uniqueProperties = [];
    const propertyKeyVisited = new Set();
    for (const property of properties) {
        if (!propertyKeyVisited.has(property.name)) {
            uniqueProperties.push(property);
        }
        propertyKeyVisited.add(property.name);
    }
    return uniqueProperties;
}

function organizeLocale(langId) {
    const langSourcePath = `src/lib/internationalization/locales/${langId}.ts`;
    const sourceFile = parseFile(`${langId}.ts`, langSourcePath);
    const sourceFileContent = sourceFile.getFullText();
    /** @type {ts.ObjectLiteralExpression | undefined} */
    const langObjectLiteral = findDescendants(sourceFile, ts.isObjectLiteralExpression);
    if (!langObjectLiteral) {
        throw new Error(`Cannot find language object literal`);
    }
    const properties = loadEnLocale();
    const propertyStart = langObjectLiteral.getChildAt(0).getEnd();
    const propertyEnd = langObjectLiteral.getChildAt(langObjectLiteral.getChildCount() - 1).getStart();
    for (const propertyAssignment of langObjectLiteral.properties) {
        if (ts.isPropertyAssignment(propertyAssignment)) {
            const name = propertyAssignment.name.getText();
            const property = properties.find((p) => p.name === name);
            if (property) {
                property.originalInitializer = property.initializer;
                property.initializer = propertyAssignment.initializer.getText();
                property.translated = true;
            }
        } else {
            throw new Error(`Unexpected node ${ts.SyntaxKind[propertyAssignment.kind]}`);
        }
    }
    const parts = [sourceFileContent.slice(0, propertyStart)];
    const untranslatedKeys = [];
    for (const property of properties) {
        if (property.translated) {
            parts.push(property.nameWithComment);
        } else {
            parts.push(property.nameWithComment.slice(0, -property.name.length), "// ", property.name);
            untranslatedKeys.push(property.name);
        }
        parts.push(": ", property.initializer, ",");
    }
    parts.push("\n", sourceFileContent.slice(propertyEnd));
    writeFileSync(langSourcePath, parts.join(""));
    execSync(`npx dprint fmt ${langSourcePath}`, { stdio: "inherit" });
    return untranslatedKeys;
}

function listLocales() {
    return readdirSync("src/lib/internationalization/locales").map((n) => n.replace(/^(.+)\.\w+$/, "$1"));
}

listLocales()
    .filter((lang) => lang !== "en")
    .forEach((lang) => {
        console.log(`Sync ${lang}.cts`);
        organizeLocale(lang);
    });

api.close();
