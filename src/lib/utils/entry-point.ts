import { join, relative, resolve } from "path";
import ts from "typescript";
import * as FS from "fs";
import { expandPackages } from "./package-manifest";
import { createMinimatch, matchesAny, nicePath, normalizePath } from "./paths";
import type { Logger } from "./loggers";
import type { Options } from "./options";
import { deriveRootDir, glob, isDir } from "./fs";
import { assertNever } from "./general";

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
     * Run TypeDoc in each directory passed as an entry point. Once all directories have been converted,
     * use the merge option to produce final output.
     */
    Packages: "packages",
    /**
     * Merges multiple previously generated output from TypeDoc's --json output together into a single project.
     */
    Merge: "merge",
} as const;

export type EntryPointStrategy =
    (typeof EntryPointStrategy)[keyof typeof EntryPointStrategy];

export interface DocumentationEntryPoint {
    displayName: string;
    readmeFile?: string;
    program: ts.Program;
    sourceFile: ts.SourceFile;
    version?: string;
}

export function getEntryPoints(
    logger: Logger,
    options: Options,
): DocumentationEntryPoint[] | undefined {
    if (!options.isSet("entryPoints")) {
        logger.warn(
            "No entry points were provided, this is likely a misconfiguration.",
        );
        return [];
    }

    const entryPoints = options.getValue("entryPoints");
    const exclude = options.getValue("exclude");

    // May be set explicitly to be an empty array to only include a readme for a package
    // See #2264
    if (entryPoints.length === 0) {
        return [];
    }

    let result: DocumentationEntryPoint[] | undefined;
    const strategy = options.getValue("entryPointStrategy");
    switch (strategy) {
        case EntryPointStrategy.Resolve:
            result = getEntryPointsForPaths(
                logger,
                expandGlobs(entryPoints, exclude, logger),
                options,
            );
            break;

        case EntryPointStrategy.Expand:
            result = getExpandedEntryPointsForPaths(
                logger,
                expandGlobs(entryPoints, exclude, logger),
                options,
            );
            break;

        case EntryPointStrategy.Merge:
        case EntryPointStrategy.Packages:
            // Doesn't really have entry points in the traditional way of how TypeDoc has dealt with them.
            return [];

        default:
            assertNever(strategy);
    }

    if (result && result.length === 0) {
        logger.error("Unable to find any entry points. See previous warnings.");
        return;
    }

    return result;
}

export function getWatchEntryPoints(
    logger: Logger,
    options: Options,
    program: ts.Program,
): DocumentationEntryPoint[] | undefined {
    let result: DocumentationEntryPoint[] | undefined;

    const entryPoints = options.getValue("entryPoints");
    const exclude = options.getValue("exclude");
    const strategy = options.getValue("entryPointStrategy");

    switch (strategy) {
        case EntryPointStrategy.Resolve:
            result = getEntryPointsForPaths(
                logger,
                expandGlobs(entryPoints, exclude, logger),
                options,
                [program],
            );
            break;

        case EntryPointStrategy.Expand:
            result = getExpandedEntryPointsForPaths(
                logger,
                expandGlobs(entryPoints, exclude, logger),
                options,
                [program],
            );
            break;

        case EntryPointStrategy.Packages:
            logger.error(
                "Watch mode does not support 'packages' style entry points.",
            );
            break;

        case EntryPointStrategy.Merge:
            logger.error(
                "Watch mode does not support 'merge' style entry points.",
            );
            break;

        default:
            assertNever(strategy);
    }

    if (result && result.length === 0) {
        logger.error("Unable to find any entry points.");
        return;
    }

    return result;
}

export function getPackageDirectories(
    logger: Logger,
    options: Options,
    packageGlobPaths: string[],
) {
    const exclude = createMinimatch(options.getValue("exclude"));
    const rootDir = deriveRootDir(packageGlobPaths);

    // packages arguments are workspace tree roots, or glob patterns
    // This expands them to leave only leaf packages
    return expandPackages(logger, rootDir, packageGlobPaths, exclude);
}

function getModuleName(fileName: string, baseDir: string) {
    return normalizePath(relative(baseDir, fileName)).replace(
        /(\/index)?(\.d)?\.([cm][tj]s|[tj]sx?)$/,
        "",
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
    programs = getEntryPrograms(inputFiles, logger, options),
): DocumentationEntryPoint[] {
    const baseDir = options.getValue("basePath") || deriveRootDir(inputFiles);
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
                `${fileOrDir}/index.jsx`,
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

        const suggestion = isDir(fileOrDir)
            ? " If you wanted to include files inside this directory, set --entryPointStrategy to expand or specify a glob."
            : "";
        logger.warn(
            `The entry point ${nicePath(
                fileOrDir,
            )} is not included in the program for your provided tsconfig.${suggestion}`,
        );
    }

    return entryPoints;
}

export function getExpandedEntryPointsForPaths(
    logger: Logger,
    inputFiles: string[],
    options: Options,
    programs = getEntryPrograms(inputFiles, logger, options),
): DocumentationEntryPoint[] {
    return getEntryPointsForPaths(
        logger,
        expandInputFiles(logger, inputFiles, options),
        options,
        programs,
    );
}

function expandGlobs(inputFiles: string[], exclude: string[], logger: Logger) {
    const excludePatterns = createMinimatch(exclude);

    const base = deriveRootDir(inputFiles);
    const result = inputFiles.flatMap((entry) => {
        const result = glob(entry, base, {
            includeDirectories: true,
            followSymlinks: true,
        });

        const filtered = result.filter(
            (file) => file === entry || !matchesAny(excludePatterns, file),
        );

        if (result.length === 0) {
            logger.warn(
                `The entrypoint glob ${nicePath(
                    entry,
                )} did not match any files.`,
            );
        } else if (filtered.length === 0) {
            logger.warn(
                `The entrypoint glob ${nicePath(
                    entry,
                )} did not match any files after applying exclude patterns.`,
            );
        } else {
            logger.verbose(
                `Expanded ${nicePath(entry)} to:\n\t${filtered
                    .map(nicePath)
                    .join("\n\t")}`,
            );
        }

        return filtered;
    });

    return result;
}

function getEntryPrograms(
    inputFiles: string[],
    logger: Logger,
    options: Options,
) {
    const rootProgram = ts.createProgram({
        rootNames: options.getFileNames().length
            ? options.getFileNames()
            : inputFiles,
        options: options.getCompilerOptions(),
        projectReferences: options.getProjectReferences(),
    });

    const programs = [rootProgram];
    // This might be a solution style tsconfig, in which case we need to add a program for each
    // reference so that the converter can look through each of these.
    if (rootProgram.getRootFileNames().length === 0) {
        logger.verbose(
            "tsconfig appears to be a solution style tsconfig - creating programs for references",
        );
        const resolvedReferences = rootProgram.getResolvedProjectReferences();
        for (const ref of resolvedReferences ?? []) {
            if (!ref) continue; // This indicates bad configuration... will be reported later.

            programs.push(
                ts.createProgram({
                    options: options.fixCompilerOptions(
                        ref.commandLine.options,
                    ),
                    rootNames: ref.commandLine.fileNames,
                    projectReferences: ref.commandLine.projectReferences,
                }),
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
    options: Options,
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
                `Provided entry point ${file} does not exist and will not be included in the docs.`,
            );
            return;
        }

        add(resolved, true);
    });

    return files;
}
