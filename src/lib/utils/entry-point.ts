import { join, relative, resolve } from "path";
import * as ts from "typescript";
import * as FS from "fs";
import * as Path from "path";
import {
    expandPackages,
    extractTypedocConfigFromPackageManifest,
    getTsEntryPointForPackage,
    ignorePackage,
    loadPackageManifest,
} from "./package-manifest";
import { createMinimatch, matchesAny, nicePath } from "./paths";
import type { Logger } from "./loggers";
import type { Options } from "./options";
import { getCommonDirectory, glob, normalizePath } from "./fs";
import { validate } from "./validation";
import { filterMap } from "./array";

/**
 * Defines how entry points are interpreted.
 * @enum
 */
export const EntryPointStrategy = {
    /**
     * The default behavior in v0.22+, expects all provided entry points as being part of a single program.
     * Any directories included in the entry point list will result in `dir/index.([cm][tj]s|[tj]sx?)` being used.
     */
    Resolve: "resolve",
    /**
     * The default behavior in v0.21 and earlier. Behaves like the resolve behavior, but will recursively
     * expand directories into an entry point for each file within the directory.
     */
    Expand: "expand",
    /**
     * Alternative resolution mode useful for monorepos. With this mode, TypeDoc will look for a package.json
     * and tsconfig.json under each provided entry point. The `main` field of each package will be documented.
     */
    Packages: "packages",
} as const;

export type EntryPointStrategy =
    typeof EntryPointStrategy[keyof typeof EntryPointStrategy];

export interface DocumentationEntryPoint {
    displayName: string;
    readmeFile?: string;
    program: ts.Program;
    sourceFile: ts.SourceFile;
    version?: string;
}

export function getEntryPoints(
    logger: Logger,
    options: Options
): DocumentationEntryPoint[] | undefined {
    const entryPoints = options.getValue("entryPoints");

    let result: DocumentationEntryPoint[] | undefined;
    switch (options.getValue("entryPointStrategy")) {
        case EntryPointStrategy.Resolve:
            result = getEntryPointsForPaths(
                logger,
                expandGlobs(entryPoints),
                options
            );
            break;

        case EntryPointStrategy.Expand:
            result = getExpandedEntryPointsForPaths(
                logger,
                expandGlobs(entryPoints),
                options
            );
            break;

        case EntryPointStrategy.Packages:
            result = getEntryPointsForPackages(logger, entryPoints, options);
            break;
    }

    if (result && result.length === 0) {
        logger.error(
            "Unable to find any entry points. Make sure TypeDoc can find your tsconfig"
        );
        return;
    }

    return result;
}

export function getWatchEntryPoints(
    logger: Logger,
    options: Options,
    program: ts.Program
): DocumentationEntryPoint[] | undefined {
    let result: DocumentationEntryPoint[] | undefined;

    const entryPoints = options.getValue("entryPoints");
    switch (options.getValue("entryPointStrategy")) {
        case EntryPointStrategy.Resolve:
            result = getEntryPointsForPaths(logger, entryPoints, options, [
                program,
            ]);
            break;

        case EntryPointStrategy.Expand:
            result = getExpandedEntryPointsForPaths(
                logger,
                entryPoints,
                options,
                [program]
            );
            break;

        case EntryPointStrategy.Packages:
            logger.error(
                "Watch mode does not support 'packages' style entry points."
            );
            break;
    }

    if (result && result.length === 0) {
        logger.error("Unable to find any entry points.");
        return;
    }

    return result;
}

function getModuleName(fileName: string, baseDir: string) {
    return normalizePath(relative(baseDir, fileName)).replace(
        /(\/index)?(\.d)?\.([cm][tj]s|[tj]sx?)$/,
        ""
    );
}

/**
 * Converts a list of file-oriented paths in to DocumentationEntryPoints for conversion.
 * This is in contrast with the package-oriented `getEntryPointsForPackages`
 */
function getEntryPointsForPaths(
    logger: Logger,
    inputFiles: string[],
    options: Options,
    programs = getEntryPrograms(logger, options)
): DocumentationEntryPoint[] | undefined {
    const baseDir =
        options.getValue("basePath") || getCommonDirectory(inputFiles);
    const entryPoints: DocumentationEntryPoint[] = [];

    entryLoop: for (const fileOrDir of inputFiles.map(normalizePath)) {
        const toCheck = [fileOrDir];
        if (!/\.([cm][tj]s|[tj]sx?)$/.test(fileOrDir)) {
            toCheck.push(
                `${fileOrDir}/index.ts`,
                `${fileOrDir}/index.cts`,
                `${fileOrDir}/index.mts`,
                `${fileOrDir}/index.tsx`,
                `${fileOrDir}/index.js`,
                `${fileOrDir}/index.cjs`,
                `${fileOrDir}/index.mjs`,
                `${fileOrDir}/index.jsx`
            );
        }

        for (const program of programs) {
            for (const check of toCheck) {
                const sourceFile = program.getSourceFile(check);
                if (sourceFile) {
                    entryPoints.push({
                        displayName: getModuleName(resolve(check), baseDir),
                        sourceFile,
                        program,
                    });
                    continue entryLoop;
                }
            }
        }
        logger.warn(
            `The entry point ${nicePath(
                fileOrDir
            )} does not exist or is not included in the program for your provided tsconfig.`
        );
    }

    return entryPoints;
}

export function getExpandedEntryPointsForPaths(
    logger: Logger,
    inputFiles: string[],
    options: Options,
    programs = getEntryPrograms(logger, options)
): DocumentationEntryPoint[] | undefined {
    return getEntryPointsForPaths(
        logger,
        expandInputFiles(logger, inputFiles, options),
        options,
        programs
    );
}

function expandGlobs(inputFiles: string[]) {
    const base = getCommonDirectory(inputFiles);
    const result = inputFiles.flatMap((entry) =>
        glob(entry, base, { includeDirectories: true, followSymlinks: true })
    );
    return result;
}

function getEntryPrograms(logger: Logger, options: Options) {
    const rootProgram = ts.createProgram({
        rootNames: options.getFileNames(),
        options: options.getCompilerOptions(),
        projectReferences: options.getProjectReferences(),
    });

    const programs = [rootProgram];
    // This might be a solution style tsconfig, in which case we need to add a program for each
    // reference so that the converter can look through each of these.
    if (rootProgram.getRootFileNames().length === 0) {
        logger.verbose(
            "tsconfig appears to be a solution style tsconfig - creating programs for references"
        );
        const resolvedReferences = rootProgram.getResolvedProjectReferences();
        for (const ref of resolvedReferences ?? []) {
            if (!ref) continue; // This indicates bad configuration... will be reported later.

            programs.push(
                ts.createProgram({
                    options: options.fixCompilerOptions(
                        ref.commandLine.options
                    ),
                    rootNames: ref.commandLine.fileNames,
                    projectReferences: ref.commandLine.projectReferences,
                })
            );
        }
    }

    return programs;
}

/**
 * Expand a list of input files.
 *
 * Searches for directories in the input files list and replaces them with a
 * listing of all TypeScript files within them. One may use the ```--exclude``` option
 * to filter out files with a pattern.
 *
 * @param inputFiles  The list of files that should be expanded.
 * @returns  The list of input files with expanded directories.
 */
function expandInputFiles(
    logger: Logger,
    entryPoints: string[],
    options: Options
): string[] {
    const files: string[] = [];

    const exclude = createMinimatch(options.getValue("exclude"));
    const compilerOptions = options.getCompilerOptions();

    const supportedFileRegex =
        compilerOptions.allowJs || compilerOptions.checkJs
            ? /\.([cm][tj]s|[tj]sx?)$/
            : /\.([cm]ts|tsx?)$/;
    function add(file: string, entryPoint: boolean) {
        let stats: FS.Stats;
        try {
            stats = FS.statSync(file);
        } catch {
            // No permission or a symbolic link, do not resolve.
            return;
        }
        const fileIsDir = stats.isDirectory();
        if (fileIsDir && !file.endsWith("/")) {
            file = `${file}/`;
        }

        if (fileIsDir) {
            FS.readdirSync(file).forEach((next) => {
                add(join(file, next), false);
            });
        } else if (supportedFileRegex.test(file)) {
            if (!entryPoint && matchesAny(exclude, file)) {
                return;
            }
            files.push(normalizePath(file));
        }
    }

    entryPoints.forEach((file) => {
        const resolved = resolve(file);
        if (!FS.existsSync(resolved)) {
            logger.warn(
                `Provided entry point ${file} does not exist and will not be included in the docs.`
            );
            return;
        }

        add(resolved, true);
    });

    return files;
}

function deriveRootDir(packageGlobPaths: string[]): string {
    const globs = createMinimatch(packageGlobPaths);
    const rootPaths = globs.flatMap((glob) =>
        filterMap(glob.set, (set) => {
            const stop = set.findIndex((part) => typeof part !== "string");
            const path = stop === -1 ? set : set.slice(0, stop);
            return `/${path.join("/")}`;
        })
    );
    return getCommonDirectory(rootPaths);
}

/**
 * Expand the provided packages configuration paths, determining the entry points
 * and creating the ts.Programs for any which are found.
 * @param logger
 * @param packageGlobPaths
 * @returns The information about the discovered programs, undefined if an error occurs.
 */
function getEntryPointsForPackages(
    logger: Logger,
    packageGlobPaths: string[],
    options: Options
): DocumentationEntryPoint[] | undefined {
    const results: DocumentationEntryPoint[] = [];
    const exclude = createMinimatch(options.getValue("exclude"));
    const rootDir = deriveRootDir(packageGlobPaths);

    // packages arguments are workspace tree roots, or glob patterns
    // This expands them to leave only leaf packages
    const expandedPackages = expandPackages(
        logger,
        rootDir,
        packageGlobPaths,
        exclude
    );
    for (const packagePath of expandedPackages) {
        const packageJsonPath = resolve(packagePath, "package.json");
        const packageJson = loadPackageManifest(logger, packageJsonPath);
        const includeVersion = options.getValue("includeVersion");
        const typedocPackageConfig = packageJson
            ? extractTypedocConfigFromPackageManifest(logger, packageJsonPath)
            : undefined;
        if (packageJson === undefined) {
            logger.error(`Could not load package manifest ${packageJsonPath}`);
            return;
        }
        const packageEntryPoint = getTsEntryPointForPackage(
            logger,
            packageJsonPath,
            packageJson
        );
        if (packageEntryPoint === undefined) {
            logger.error(
                `Could not determine TS entry point for package ${packageJsonPath}`
            );
            return;
        }
        if (packageEntryPoint === ignorePackage) {
            continue;
        }
        const tsconfigFile = ts.findConfigFile(
            packageEntryPoint,
            ts.sys.fileExists,
            typedocPackageConfig?.tsconfig
        );
        if (tsconfigFile === undefined) {
            logger.error(
                `Could not determine tsconfig.json for source file ${packageEntryPoint} (it must be on an ancestor path)`
            );
            return;
        }
        // Consider deduplicating this with similar code in src/lib/utils/options/readers/tsconfig.ts
        let fatalError = false;
        const parsedCommandLine = ts.getParsedCommandLineOfConfigFile(
            tsconfigFile,
            {},
            {
                ...ts.sys,
                onUnRecoverableConfigFileDiagnostic: (error) => {
                    logger.diagnostic(error);
                    fatalError = true;
                },
            }
        );
        if (!parsedCommandLine) {
            return;
        }
        logger.diagnostics(parsedCommandLine.errors);
        if (fatalError) {
            return;
        }

        const program = ts.createProgram({
            rootNames: parsedCommandLine.fileNames,
            options: options.fixCompilerOptions(parsedCommandLine.options),
            projectReferences: parsedCommandLine.projectReferences,
        });
        const sourceFile = program.getSourceFile(packageEntryPoint);
        if (sourceFile === undefined) {
            logger.error(
                `Entry point "${packageEntryPoint}" does not appear to be built by/included in the tsconfig found at "${tsconfigFile}"`
            );
            return;
        }

        if (includeVersion && !validate({ version: String }, packageJson)) {
            logger.warn(
                `--includeVersion was specified, but "${nicePath(
                    packageJsonPath
                )}" does not properly specify a version.`
            );
        }

        results.push({
            displayName:
                typedocPackageConfig?.displayName ??
                (packageJson["name"] as string),
            version: includeVersion
                ? (packageJson["version"] as string | undefined)
                : void 0,
            readmeFile: discoverReadmeFile(
                logger,
                Path.join(packageJsonPath, ".."),
                typedocPackageConfig?.readmeFile
            ),
            program,
            sourceFile,
        });
    }

    return results;
}

function discoverReadmeFile(
    logger: Logger,
    packageDir: string,
    userReadme: string | undefined
): string | undefined {
    if (userReadme) {
        if (!FS.existsSync(Path.join(packageDir, userReadme))) {
            logger.warn(
                `Failed to find ${userReadme} in ${nicePath(packageDir)}`
            );
            return;
        }
        return Path.resolve(Path.join(packageDir, userReadme));
    }

    for (const file of FS.readdirSync(packageDir)) {
        if (file.toLowerCase() === "readme.md") {
            return Path.resolve(Path.join(packageDir, file));
        }
    }
}
