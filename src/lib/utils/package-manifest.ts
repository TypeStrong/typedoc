// Utilities to support the inspection of node package "manifests"

import { dirname, join, resolve } from "path";
import { existsSync } from "fs";

import { readFile, glob } from "./fs";
import type { Logger } from "./loggers";
import type { Minimatch } from "minimatch";
import { matchesAny, nicePath } from "./paths";
import { additionalProperties, Infer, optional, validate } from "./validation";

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

const typedocPackageManifestConfigSchema = {
    displayName: optional(String),
    entryPoint: optional(String),
    readmeFile: optional(String),
    tsconfig: optional(String),

    [additionalProperties]: false,
};

export type TypedocPackageManifestConfig = Infer<
    typeof typedocPackageManifestConfigSchema
>;

/**
 * Extracts typedoc specific config from a specified package manifest
 */
export function extractTypedocConfigFromPackageManifest(
    logger: Logger,
    packageJsonPath: string
): TypedocPackageManifestConfig | undefined {
    const packageJson = loadPackageManifest(logger, packageJsonPath);
    if (!packageJson) {
        return undefined;
    }
    if (
        hasOwnProperty(packageJson, "typedoc") &&
        typeof packageJson.typedoc == "object" &&
        packageJson.typedoc
    ) {
        if (
            !validate(typedocPackageManifestConfigSchema, packageJson.typedoc)
        ) {
            logger.error(
                `Typedoc config extracted from package manifest file ${packageJsonPath} is not valid`
            );
            return undefined;
        }
        return packageJson.typedoc;
    }
    return undefined;
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
 * Given a list of (potentially wildcarded) package paths,
 * return all the actual package folders found.
 */
export function expandPackages(
    logger: Logger,
    packageJsonDir: string,
    workspaces: string[],
    exclude: Minimatch[]
): string[] {
    // Technically npm and Yarn workspaces don't support recursive nesting,
    // however we support the passing of paths to either packages or
    // to the root of a workspace tree in our params and so we could here
    // be dealing with either a root or a leaf. So let's do this recursively,
    // as it actually is simpler from an implementation perspective anyway.
    return workspaces.flatMap((workspace) => {
        const globbedPackageJsonPaths = glob(
            resolve(packageJsonDir, workspace, "package.json"),
            resolve(packageJsonDir)
        );
        return globbedPackageJsonPaths.flatMap((packageJsonPath) => {
            if (matchesAny(exclude, dirname(packageJsonPath))) {
                return [];
            }

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
                packagePaths,
                exclude
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
        logger.verbose(
            `The file ${jsPath} does not contain a sourceMappingURL`
        );
        return jsPath;
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
                sourceMapURL.substring(sourceMapURL.indexOf(",") + 1),
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
    const typedocPackageConfig = extractTypedocConfigFromPackageManifest(
        logger,
        packageJsonPath
    );
    if (typedocPackageConfig?.entryPoint) {
        packageMain = typedocPackageConfig.entryPoint;
    } else if (validate({ typedocMain: String }, packageJson)) {
        logger.warn(
            `Legacy typedoc entry point config (using "typedocMain" field) found for "${nicePath(
                packageJsonPath
            )}". Please update to use "typedoc": { "entryPoint": "..." } instead. In future upgrade, "typedocMain" field will be ignored.`
        );
        packageMain = packageJson.typedocMain;
    } else if (validate({ main: String }, packageJson)) {
        packageMain = packageJson.main;
    } else if (validate({ types: String }, packageJson)) {
        packageTypes = packageJson.types;
    } else if (validate({ typings: String }, packageJson)) {
        packageTypes = packageJson.typings;
    }
    let entryPointPath = resolve(packageJsonPath, "..", packageMain);
    // The entryPointPath from the package manifest can be like a require path.
    // It could end with .js, or it could end without .js, or it could be a folder containing an index.js
    // We can use require.resolve to let node do its magic.
    // Pass an empty `paths` as node_modules locations do not need to be examined
    try {
        entryPointPath = require.resolve(entryPointPath, { paths: [] });
        if (
            /\.([cm]?ts|tsx?)$/.test(entryPointPath) &&
            existsSync(entryPointPath)
        ) {
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
            if (
                /\.([cm]?[tj]s|tsx?)$/.test(entryPointPath) &&
                existsSync(entryPointPath)
            ) {
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
