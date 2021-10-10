// @ts-check

const { join, resolve } = require("path");
const fs = require("fs");
const ts = require("typescript");

/**
 * @param {ts.Diagnostic[]} diagnostics
 * @returns {never}
 */
function fail(diagnostics) {
    const output = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: resolve,
        getCurrentDirectory: () => process.cwd(),
        getNewLine: () => ts.sys.newLine,
    });
    console.log(output);
    process.exit(1);
}

const tsconfig = ts.getParsedCommandLineOfConfigFile(
    join(__dirname, "../src/codegen/tsconfig.json"),
    {},
    {
        ...ts.sys,
        onUnRecoverableConfigFileDiagnostic(diagnostic) {
            fail([diagnostic]);
        },
    }
);

if (tsconfig.errors.length) {
    fail(tsconfig.errors);
}

const program = ts.createProgram(tsconfig.fileNames, tsconfig.options);
const sourceFile = program.getSourceFile(
    join(__dirname, "../src/codegen/jsx.ts")
);
const checker = program.getTypeChecker();

const typeReplacements = {
    HTMLCollection: "JsxChildren",
    MediaProvider: "string",
    SVGAnimatedAngle: "string",
    SVGAnimatedEnumeration: "string",
    SVGAnimatedInteger: "`${bigint}` | number",
    SVGAnimatedLength: "string | number",
    SVGAnimatedLengthList: "string",
    SVGAnimatedNumber: "string | number",
    SVGAnimatedNumberList: "string",
    SVGAnimatedPreserveAspectRatio: "string",
    SVGAnimatedRect: "string",
    SVGAnimatedString: "string",
    SVGAnimatedTransformList: "string",
    SVGPointList: "string",
    SVGStringList: "string",
    SVGAnimatedBoolean: '"true" | "false"',
    DOMTokenList: "string",
    ReferrerPolicy: "string",
};

const propertyNameReplacements = {
    className: "class",
    htmlFor: "for",
    httpEquiv: '"http-equiv"',
};

const excludedProperties = new Set([
    "dataset",
    "innerHTML",
    "outerHTML",
    "innerHTML",
    "innerText",
    "outerText",
    "textContent",
    "style",
    "error",
    "mediaKeys",
    "track",
    "cells",
    "rows",
    "labels",
    "form",
    "tBodies",
    "validity",
    "elements",
    "shadowRoot",
    "attributes",
    "childElementCount",
    // SVG properties that I don't know how to handle yet.
    "currentTranslate",
]);

const excludedPropertyTypes = [
    "Element",
    "ChildNode",
    "ParentNode",
    "FileList",
    "TextTrackList",
    "TimeRanges",
    "RemotePlayback",
    "CSSStyleSheet",
    "HTMLOptionsCollection",
    "FileSystemEntry",
    "DocumentFragment",
];

/**
 * @typedef Interface
 * @property {string} elementName
 * @property {string} name
 * @property {string[]} properties
 */

/** @param {ts.Symbol} elements */
function createInterfaces(elements, lowercase = true) {
    /** @type {Interface[]} */
    const interfaces = [];

    for (const el of checker.getPropertiesOfType(
        checker.getDeclaredTypeOfSymbol(elements)
    )) {
        const name = `Jsx${el.name[0].toUpperCase()}${el.name.substr(
            1
        )}ElementProps`;

        /** @type {string[]} */
        const properties = [];

        for (const prop of checker.getPropertiesOfType(
            checker.getTypeOfSymbolAtLocation(el, sourceFile)
        )) {
            const propType = checker.getTypeOfSymbolAtLocation(
                prop,
                sourceFile
            );
            let propTypeStr = checker.typeToString(
                propType.getNonNullableType()
            );
            let propName = prop.name;
            /** @type {RegExpMatchArray | null | undefined} */
            let match;

            if (excludedProperties.has(propName)) continue;

            // Exclude function properties
            if (propType.getNonNullableType().getCallSignatures().length)
                continue;

            // Exclude properties for navigating the DOM tree
            if (excludedPropertyTypes.some((ex) => propTypeStr.includes(ex)))
                continue;

            // Exclude readonly properties
            // @ts-expect-error internal API - doesn't seem to be a public way to do this.
            if (prop.checkFlags & ts.CheckFlags.Readonly) continue;

            // Constants that we should never emit
            if (/^[A-Z_]+$/.test(propName)) continue;

            // Having these always show up in autocomplete isn't helpful.
            if ((match = propName.match(/^aria([A-Z])/))) {
                continue;
            }

            if (propertyNameReplacements.hasOwnProperty(propName)) {
                propName = propertyNameReplacements[propName];
            }
            if (typeReplacements.hasOwnProperty(propTypeStr)) {
                propTypeStr = typeReplacements[propTypeStr];
            }

            properties.push(`${propName}?: ${propTypeStr}`);
        }

        properties.sort((a, b) => a.localeCompare(b));

        interfaces.push({
            name,
            properties,
            elementName: lowercase ? el.name.toLowerCase() : el.name,
        });
    }

    return interfaces;
}

/** @param {Interface[]} interfaces */
function getCommonProperties(interfaces) {
    const common = new Set(interfaces[0].properties);
    for (const int of interfaces.slice(1)) {
        for (const commonProp of common) {
            if (!int.properties.includes(commonProp)) {
                common.delete(commonProp);
            }
        }
    }

    return common;
}

/**
 * @param {Interface[]} interfaces
 * @param {Set<string>} toRemove
 */
function removeProperties(interfaces, toRemove) {
    for (const int of interfaces) {
        int.properties = int.properties.filter((x) => !toRemove.has(x));
    }
}

const htmlInterfaces = createInterfaces(
    checker.tryGetMemberInModuleExports(
        "HtmlElements",
        checker.getSymbolAtLocation(sourceFile)
    )
);
const htmlCommon = getCommonProperties(htmlInterfaces);
removeProperties(htmlInterfaces, htmlCommon);

const svgInterfaces = createInterfaces(
    checker.tryGetMemberInModuleExports(
        "SvgElements",
        checker.getSymbolAtLocation(sourceFile)
    ),
    false
).filter(
    (int) =>
        !htmlInterfaces.some(
            (i) => i.elementName.toLowerCase() === int.elementName
        )
);
const svgCommon = getCommonProperties(svgInterfaces);
removeProperties(svgInterfaces, svgCommon);

const file = [
    "// THIS IS AN AUTOGENERATED FILE. If something is wrong, update ./scripts/run_codegen.js, not this file.",
    "export interface IntrinsicElements {",
    "    // HTML Elements",
    ...htmlInterfaces.map(
        (int) =>
            `    ${int.elementName}: ${
                int.properties.length ? int.name : "JsxCommonHtmlProps"
            }`
    ),
    "",
    "    // SVG Elements",
    ...svgInterfaces.map(
        (int) =>
            `    ${int.elementName}: ${
                int.properties.length ? int.name : "JsxCommonSvgProps"
            }`
    ),
    "}",
    "",
    "export const JsxFragment = Symbol();",
    "",
    "export type JsxComponent<P> = (props: P) => JsxElement | null | undefined;",
    "",
    "export interface JsxElement {",
    "    tag: typeof JsxFragment | string | JsxComponent<any>;",
    "    props: object | null;",
    "    children: JsxChildren[];",
    "}",
    "",
    "export type JsxChildren =",
    "    | JsxElement",
    "    | string",
    "    | number",
    "    | null",
    "    | undefined",
    "    | JsxChildren[];",
    "",
    "export interface JsxCommonHtmlProps {",
    ...Array.from(htmlCommon, (x) => `    ${x}`),
    "}",
    "",
    "export interface JsxCommonSvgProps {",
    ...Array.from(svgCommon, (x) => `    ${x}`),
    "}",
    "",
];

for (const int of htmlInterfaces) {
    if (!int.properties.length) continue;
    file.push(`export interface ${int.name} extends JsxCommonHtmlProps {`);
    file.push(...int.properties.map((p) => `    ${p}`));
    file.push("}", "");
}

for (const int of svgInterfaces) {
    if (!int.properties.length) continue;
    file.push(`export interface ${int.name} extends JsxCommonSvgProps {`);
    file.push(...int.properties.map((p) => `    ${p}`));
    file.push("}", "");
}

fs.writeFileSync(
    join(__dirname, "../src/lib/utils/jsx.generated.ts"),
    file.join("\n")
);

console.log("Done");
