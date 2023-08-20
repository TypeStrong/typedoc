// Utilities to support the inspection of node package "manifests"

import { dirname, resolve } from "path";

import { readFile, glob } from "./fs";
import type { Logger } from "./loggers";
import type { Minimatch } from "minimatch";
import { matchesAny, nicePath } from "./paths";

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
 * Given a list of (potentially wildcarded) package paths,
 * return all the actual package folders found.
 */
export function expandPackages(
    logger: Logger,
    packageJsonDir: string,
    workspaces: string[],
    exclude: Minimatch[],
): string[] {
    // Technically npm and Yarn workspaces don't support recursive nesting,
    // however we support the passing of paths to either packages or
    // to the root of a workspace tree in our params and so we could here
    // be dealing with either a root or a leaf. So let's do this recursively,
    // as it actually is simpler from an implementation perspective anyway.
    return workspaces.flatMap((workspace) => {
        const globbedPackageJsonPaths = glob(
            resolve(packageJsonDir, workspace, "package.json"),
            resolve(packageJsonDir),
        );

        if (globbedPackageJsonPaths.length === 0) {
            logger.warn(
                `The entrypoint glob ${nicePath(
                    workspace,
                )} did not match any directories containing package.json.`,
            );
        } else {
            logger.verbose(
                `Expanded ${nicePath(
                    workspace,
                )} to:\n\t${globbedPackageJsonPaths
                    .map(nicePath)
                    .join("\n\t")}`,
            );
        }

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
                exclude,
            );
        });
    });
}
