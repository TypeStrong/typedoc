// Utilities to support the inspection of node package "manifests" (package.json's)

import { existsSync, statSync } from "fs";
import glob = require("glob");
import { dirname, resolve } from "path";
import { flatMap } from "./array";

import { readFile } from "./fs";
import { Logger } from "./loggers";

/**
 * Helper for the TS type system to understand hasOwnProperty
 * and narrow a type appropriately.
 * @param obj the receiver of the hasOwnProperty method call
 * @param prop the property to test for
 */
function hasOwnProperty<X extends {}, Y extends PropertyKey>(
    obj: X,
    prop: Y
): obj is X & Record<Y, unknown> {
    // eslint-disable-next-line no-prototype-builtins
    return obj.hasOwnProperty(prop);
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
    if (Array.isArray(packageJSON.workspaces)) {
        return packageJSON.workspaces;
    }
    if (
        typeof packageJSON.workspaces === "object" &&
        packageJSON.workspaces != null &&
        hasOwnProperty(packageJSON.workspaces, "packages") &&
        Array.isArray(packageJSON.workspaces.packages)
    ) {
        return packageJSON.workspaces.packages;
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
    // Technnically npm and Yarn workspaces don't support recursive nesting,
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
            // This is a workpace root package, recurse
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
    const sourceMapPrefix = "//# sourceMappingURL=";
    const searchResult = contents.search(
        new RegExp(`^${sourceMapPrefix}.*$`, "m")
    );
    if (searchResult === -1) {
        logger.error(`The file ${jsPath} does not contain a sourceMappingURL`);
        return;
    }
    const newLineIndex = contents.indexOf("\n", searchResult);
    const sourceMapURL = contents.slice(
        searchResult + sourceMapPrefix.length,
        newLineIndex === -1 ? undefined : newLineIndex
    );
    const resolvedSourceMapURL = resolve(jsPath, "..", sourceMapURL);
    const sourceMap: unknown = JSON.parse(readFile(resolvedSourceMapURL));
    if (typeof sourceMap !== "object" || !sourceMap) {
        logger.error(
            `The source map file ${resolvedSourceMapURL} is not an object.`
        );
        return undefined;
    }
    if (
        !hasOwnProperty(sourceMap, "sourceRoot") ||
        !(typeof sourceMap.sourceRoot === "string") ||
        !hasOwnProperty(sourceMap, "sources") ||
        !Array.isArray(sourceMap.sources)
    ) {
        logger.error(
            `The source map ${resolvedSourceMapURL} does not contain both "sourceRoot" and "sources".`
        );
        return undefined;
    }
    // There's a pretty large assumption in here that we only have
    // 1 source file per js file. This is a pretty standard typescript approach,
    // but people might do interesting things with transpilation that could break this.
    const sourcePath = resolve(
        resolvedSourceMapURL,
        "..",
        sourceMap.sourceRoot,
        sourceMap.sources[0]
    );
    return sourcePath;
}

function isFile(file: string) {
    return existsSync(file) && statSync(file).isFile();
}

// A Symbol used to communicate that this package should be ignored
export const ignorePackage = Symbol("ignorePackage");

/**
 * Given a package.json, attempt to find the TS file that defines its entry point
 * The JS must be built with sourcemaps.
 */
export function getTsEntryPointForPackage(
    logger: Logger,
    packageJsonPath: string,
    packageJson: Record<string, unknown>
): string | undefined | typeof ignorePackage {
    let packageMain = "index.js"; // The default, per the npm docs.
    if (
        hasOwnProperty(packageJson, "main") &&
        typeof packageJson.main == "string"
    ) {
        packageMain = packageJson.main;
    }
    const jsEntryPointPath = resolve(packageJsonPath, "..", packageMain);
    if (!isFile(jsEntryPointPath)) {
        logger.warn(
            `Could not determine the JS entry point for ${packageJsonPath}. Package will be ignored.`
        );
        return ignorePackage;
    }
    return getTsSourceFromJsSource(logger, jsEntryPointPath);
}
