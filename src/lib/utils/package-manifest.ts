// Utilities to support the inspection of node package "manifests"

import { dirname } from "path";

import { glob, readFile } from "./fs.js";
import type { Logger } from "./loggers.js";
import { createGlobString, type MinimatchSet, nicePath, normalizePath } from "./paths.js";
import { type GlobString, i18n, type NormalizedPath } from "#utils";

/**
 * Helper for the TS type system to understand hasOwnProperty
 * and narrow a type appropriately.
 * @param obj the receiver of the hasOwnProperty method call
 * @param prop the property to test for
 */
function hasOwnProperty<K extends PropertyKey>(
    obj: object,
    prop: K,
): obj is Record<K, unknown> {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Loads a package.json and validates that it is a JSON Object
 */
export function loadPackageManifest(
    logger: Logger,
    packageJsonPath: string,
): Record<string, unknown> | undefined {
    const packageJson: unknown = JSON.parse(readFile(packageJsonPath));
    if (typeof packageJson !== "object" || !packageJson) {
        logger.error(
            i18n.file_0_not_an_object(nicePath(packageJsonPath)),
        );
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
    packageJSON: Record<string, unknown>,
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
 * Given a list of (potentially wildcard containing) package paths,
 * return all the actual package folders found.
 */
export function expandPackages(
    logger: Logger,
    packageJsonDir: NormalizedPath,
    workspaces: GlobString[],
    exclude: MinimatchSet,
): string[] {
    // Technically npm and Yarn workspaces don't support recursive nesting,
    // however we support the passing of paths to either packages or
    // to the root of a workspace tree in our params and so we could here
    // be dealing with either a root or a leaf. So let's do this recursively,
    // as it actually is simpler from an implementation perspective anyway.
    return workspaces.flatMap((workspace) => {
        const expandedPackageJsonPaths = glob(
            createGlobString(packageJsonDir, `${workspace}/package.json`),
            packageJsonDir,
        );

        if (expandedPackageJsonPaths.length === 0) {
            logger.warn(
                i18n.entry_point_0_did_not_match_any_packages(
                    nicePath(workspace),
                ),
            );
        } else if (expandedPackageJsonPaths.length !== 1) {
            logger.verbose(
                `Expanded ${nicePath(workspace)} to:\n\t${
                    expandedPackageJsonPaths
                        .map(nicePath)
                        .join("\n\t")
                }`,
            );
        }

        return expandedPackageJsonPaths.flatMap((packageJsonPath) => {
            if (exclude.matchesAny(dirname(packageJsonPath))) {
                return [];
            }

            const packageJson = loadPackageManifest(logger, packageJsonPath);
            if (packageJson === undefined) {
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
                normalizePath(dirname(packageJsonPath)),
                packagePaths.map(p => createGlobString(normalizePath(dirname(packageJsonPath)), p)),
                exclude,
            );
        });
    });
}
