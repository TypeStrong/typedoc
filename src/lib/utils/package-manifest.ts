// Utilities to support the inspection of node package "manifests"

import glob = require("glob");
import { dirname, join, resolve } from "path";
import { existsSync } from "fs";
import { flatMap } from "./array";

import { readFile } from "./fs";
import type { Logger } from "./loggers";

/**
 * Helper for the TS type system to understand hasOwnProperty
 * and narrow a type appropriately.
 * @param obj the receiver of the hasOwnProperty method call
 * @param prop the property to test for
 */
function hasOwnProperty<K extends PropertyKey>(
    obj: object,
    prop: K
): obj is Record<K, unknown> {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Loads a package.json and validates that it is a JSON Object
 */
export function loadPackageManifest(
    logger: Logger,
    packageJsonPath: string
): Record<string, unknown> | undefined {
    const packageJson: unknown = JSON.parse(readFile(packageJsonPath));
    if (typeof packageJson !== "object" || !packageJson) {
        logger.error(`The file ${packageJsonPath} is not an object.`);
        return undefined;
    }
    return packageJson as Record<string, unknown>;
}

/**
 * Load the paths to packages specified in a Yarn workspace package JSON
 * Returns undefined if packageJSON does not define a Yarn workspace
 * @param packageJSON the package json object
 */
function getPackagePaths(
    packageJSON: Record<string, unknown>
): string[] | undefined {
    if (
        Array.isArray(packageJSON["workspaces"]) &&
        packageJSON["workspaces"].every((i) => typeof i === "string")
    ) {
        return packageJSON["workspaces"];
    }
    if (
        typeof packageJSON["workspaces"] === "object" &&
        packageJSON["workspaces"] != null
    ) {
        const workspaces = packageJSON["workspaces"];
        if (
            hasOwnProperty(workspaces, "packages") &&
            Array.isArray(workspaces["packages"]) &&
            workspaces["packages"].every((i) => typeof i === "string")
        ) {
            return workspaces["packages"];
        }
    }
    return undefined;
}

/**
 * Should produce the same results as the equivalent code in Yarn
 * https://github.com/yarnpkg/yarn/blob/a4708b29ac74df97bac45365cba4f1d62537ceb7/src/config.js#L799
 */
function globPackages(workspacePath: string, packageJsonDir: string): string[] {
    return glob.sync(resolve(packageJsonDir, workspacePath, "package.json"), {
        ignore: resolve(packageJsonDir, workspacePath, "node_modules"),
    });
}

/**
 * Given a list of (potentially wildcarded) package paths,
 * return all the actual package folders found.
 */
export function expandPackages(
    logger: Logger,
    packageJsonDir: string,
    workspaces: string[]
): string[] {
    // Technically npm and Yarn workspaces don't support recursive nesting,
    // however we support the passing of paths to either packages or
    // to the root of a workspace tree in our params and so we could here
    // be dealing with either a root or a leaf. So let's do this recursively,
    // as it actually is simpler from an implementation perspective anyway.
    return flatMap(workspaces, (workspace) => {
        const globbedPackageJsonPaths = globPackages(workspace, packageJsonDir);
        return flatMap(globbedPackageJsonPaths, (packageJsonPath) => {
            const packageJson = loadPackageManifest(logger, packageJsonPath);
            if (packageJson === undefined) {
                logger.error(`Failed to load ${packageJsonPath}`);
                return [];
            }
            const packagePaths = getPackagePaths(packageJson);
            if (packagePaths === undefined) {
                // Assume this is a single package repo
                return [dirname(packageJsonPath)];
            }
            // This is a workspace root package, recurse
            return expandPackages(
                logger,
                dirname(packageJsonPath),
                packagePaths
            );
        });
    });
}

/**
 * Finds the corresponding TS file from a transpiled JS file.
 * The JS must be built with sourcemaps.
 */
function getTsSourceFromJsSource(
    logger: Logger,
    jsPath: string
): string | undefined {
    const contents = readFile(jsPath);
    const sourceMapPrefix = "\n//# sourceMappingURL=";
    const indexOfSourceMapPrefix = contents.indexOf(sourceMapPrefix);
    if (indexOfSourceMapPrefix === -1) {
        logger.error(`The file ${jsPath} does not contain a sourceMappingURL`);
        return;
    }
    const endOfSourceMapPrefix =
        indexOfSourceMapPrefix + sourceMapPrefix.length;
    const newLineIndex = contents.indexOf("\n", endOfSourceMapPrefix);
    const sourceMapURL = contents.slice(
        endOfSourceMapPrefix,
        newLineIndex === -1 ? undefined : newLineIndex
    );

    let resolvedSourceMapURL: string;
    let sourceMap: unknown;
    if (sourceMapURL.startsWith("data:application/json;base64,")) {
        resolvedSourceMapURL = jsPath;
        sourceMap = JSON.parse(
            Buffer.from(
                sourceMapURL.substr(sourceMapURL.indexOf(",") + 1),
                "base64"
            ).toString()
        );
    } else {
        resolvedSourceMapURL = resolve(jsPath, "..", sourceMapURL);
        sourceMap = JSON.parse(readFile(resolvedSourceMapURL));
    }

    if (typeof sourceMap !== "object" || !sourceMap) {
        logger.error(
            `The source map file ${resolvedSourceMapURL} is not an object.`
        );
        return undefined;
    }
    if (
        !hasOwnProperty(sourceMap, "sources") ||
        !Array.isArray(sourceMap.sources)
    ) {
        logger.error(
            `The source map ${resolvedSourceMapURL} does not contain "sources".`
        );
        return undefined;
    }
    let sourceRoot: string | undefined;
    if (
        hasOwnProperty(sourceMap, "sourceRoot") &&
        typeof sourceMap.sourceRoot === "string"
    ) {
        sourceRoot = sourceMap.sourceRoot;
    }
    // There's a pretty large assumption in here that we only have
    // 1 source file per js file. This is a pretty standard typescript approach,
    // but people might do interesting things with transpilation that could break this.
    let source = sourceMap.sources[0];
    // If we have a sourceRoot, trim any leading slash from the source, and join them
    // Similar to how it's done at https://github.com/mozilla/source-map/blob/58819f09018d56ef84dc41ba9c93f554e0645169/lib/util.js#L412
    if (sourceRoot !== undefined) {
        source = source.replace(/^\//, "");
        source = join(sourceRoot, source);
    }
    const sourcePath = resolve(resolvedSourceMapURL, "..", source);
    return sourcePath;
}

// A Symbol used to communicate that this package should be ignored
export const ignorePackage = Symbol("ignorePackage");

/**
 * Given a package.json, attempt to find the TS file that defines its entry point
 * The JS must be built with sourcemaps.
 *
 * When the TS file cannot be determined, the intention is to
 * - Ignore things which don't appear to be `require`-able node packages.
 * - Fail on things which appear to be `require`-able node packages but are missing
 *   the necessary metadata for us to document.
 */
export function getTsEntryPointForPackage(
    logger: Logger,
    packageJsonPath: string,
    packageJson: Record<string, unknown>
): string | undefined | typeof ignorePackage {
    let packageMain = "index.js"; // The default, per the npm docs.
    let packageTypes = null;
    if (
        hasOwnProperty(packageJson, "typedocMain") &&
        typeof packageJson.typedocMain == "string"
    ) {
        packageMain = packageJson.typedocMain;
    } else if (
        hasOwnProperty(packageJson, "main") &&
        typeof packageJson.main == "string"
    ) {
        packageMain = packageJson.main;
    } else if (
        hasOwnProperty(packageJson, "types") &&
        typeof packageJson.types == "string"
    ) {
        packageTypes = packageJson.types;
    } else if (
        hasOwnProperty(packageJson, "typings") &&
        typeof packageJson.typings == "string"
    ) {
        packageTypes = packageJson.typings;
    }
    let entryPointPath = resolve(packageJsonPath, "..", packageMain);
    // The entryPointPath from the package manifest can be like a require path.
    // It could end with .js, or it could end without .js, or it could be a folder containing an index.js
    // We can use require.resolve to let node do its magic.
    // Pass an empty `paths` as node_modules locations do not need to be examined
    try {
        entryPointPath = require.resolve(entryPointPath, { paths: [] });
        if (/\.tsx?$/.test(entryPointPath) && existsSync(entryPointPath)) {
            return entryPointPath;
        }
    } catch (e: any) {
        if (e.code !== "MODULE_NOT_FOUND") {
            throw e;
        } else {
            entryPointPath = resolve(
                packageJsonPath,
                "..",
                packageTypes ?? packageMain
            );
            if (/\.tsx?$/.test(entryPointPath) && existsSync(entryPointPath)) {
                return entryPointPath;
            } else {
                logger.warn(
                    `Could not determine the entry point for "${packageJsonPath}". Package will be ignored.`
                );
                logger.verbose(e.message);
                return ignorePackage;
            }
        }
    }
    return getTsSourceFromJsSource(logger, entryPointPath);
}
