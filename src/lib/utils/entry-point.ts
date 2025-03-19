import { join, relative, resolve } from "path";
import ts from "typescript";
import * as FS from "fs";
import { expandPackages } from "./package-manifest.js";
import { deriveRootDir, getCommonDirectory, MinimatchSet, nicePath, normalizePath } from "./paths.js";
import type { Options } from "./options/index.js";
import { discoverPackageJson, type FileSystem, glob, inferPackageEntryPointPaths } from "./fs.js";
import { assertNever, type GlobString, i18n, type Logger, type NormalizedPath } from "#utils";

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

export type EntryPointStrategy = (typeof EntryPointStrategy)[keyof typeof EntryPointStrategy];

export interface DocumentationEntryPoint {
    displayName: string;
    program: ts.Program;
    sourceFile: ts.SourceFile;
}

export interface DocumentEntryPoint {
    displayName: string;
    path: NormalizedPath;
}

export function inferEntryPoints(
    logger: Logger,
    options: Options,
    hostOrPrograms: ts.CompilerHost | ts.Program[],
    fs: FileSystem,
) {
    const packageJson = discoverPackageJson(
        options.packageDir ?? process.cwd(),
        fs,
    );
    if (!packageJson) {
        logger.warn(i18n.no_entry_points_provided());
        return [];
    }

    const pathEntries = inferPackageEntryPointPaths(packageJson.file, fs);

    const entryPoints: DocumentationEntryPoint[] = [];

    if (!Array.isArray(hostOrPrograms)) {
        hostOrPrograms = getEntryPrograms(pathEntries.map(p => p[1]), logger, options, hostOrPrograms);
    }

    // See also: addInferredDeclarationMapPaths in ReflectionSymbolId
    const jsToTsSource = new Map<string, string>();
    for (const program of hostOrPrograms) {
        const opts = program.getCompilerOptions();
        const rootDir = opts.rootDir || getCommonDirectory(program.getRootFileNames());
        const outDir = opts.outDir || rootDir;

        for (const tsFile of program.getRootFileNames()) {
            const jsFile = normalizePath(
                resolve(outDir, relative(rootDir, tsFile)).replace(
                    /\.([cm]?)[tj]sx?$/,
                    ".$1js",
                ),
            );
            jsToTsSource.set(jsFile, tsFile);
        }
    }

    for (const [name, path] of pathEntries) {
        // Strip leading ./ from the display name
        const displayName = name.replace(/^\.\/?/, "");
        const targetPath = jsToTsSource.get(path) || path;

        const program = hostOrPrograms.find((p) => p.getSourceFile(targetPath));
        if (program) {
            entryPoints.push({
                displayName,
                program,
                sourceFile: program.getSourceFile(targetPath)!,
            });
        } else if (/\.[cm]?js$/.test(path)) {
            logger.warn(
                i18n.failed_to_resolve_0_to_ts_path(nicePath(path)),
            );
        }
    }

    if (entryPoints.length === 0) {
        logger.warn(i18n.no_entry_points_provided());
        return [];
    }

    return entryPoints;
}

export function getEntryPoints(
    logger: Logger,
    options: Options,
    host: ts.CompilerHost,
    fs: FileSystem,
): DocumentationEntryPoint[] | undefined {
    if (!options.isSet("entryPoints")) {
        logger.warn(i18n.no_entry_points_provided());
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
                expandGlobs(entryPoints, exclude, logger, fs),
                options,
                host,
                fs,
            );
            break;

        case EntryPointStrategy.Expand:
            result = getExpandedEntryPointsForPaths(
                logger,
                expandGlobs(entryPoints, exclude, logger, fs),
                options,
                host,
                fs,
            );
            break;

        case EntryPointStrategy.Merge:
        case EntryPointStrategy.Packages:
            // Doesn't really have entry points in the traditional way of how TypeDoc has dealt with them.
            return [];

        default:
            assertNever(strategy);
    }

    if (result.length === 0) {
        logger.error(i18n.unable_to_find_any_entry_points());
        return;
    }

    return result;
}

/**
 * Document entry points are markdown documents that the user has requested we include in the project with
 * an option rather than a `@document` tag.
 *
 * @returns A list of `.md` files to include in the documentation as documents.
 */
export function getDocumentEntryPoints(
    logger: Logger,
    options: Options,
    fs: FileSystem,
): DocumentEntryPoint[] {
    const docGlobs = options.getValue("projectDocuments");
    if (docGlobs.length === 0) {
        return [];
    }

    const docPaths = expandGlobs(docGlobs, [], logger, fs);

    // We might want to expand this in the future, there are quite a lot of extensions
    // that have at some point or another been used for markdown: https://superuser.com/a/285878
    const supportedFileRegex = /\.(md|markdown)$/;

    const expanded = expandInputFiles(
        logger,
        docPaths,
        options,
        supportedFileRegex,
    );
    const baseDir = options.getValue("basePath") || getCommonDirectory(expanded);
    return expanded.map((path) => {
        return {
            displayName: relative(baseDir, path).replace(/\.[^.]+$/, ""),
            path,
        };
    });
}

export function getPackageDirectories(
    logger: Logger,
    options: Options,
    packageGlobPaths: GlobString[],
    fs: FileSystem,
) {
    const exclude = new MinimatchSet(options.getValue("exclude"));
    const rootDir = deriveRootDir(packageGlobPaths);

    // packages arguments are workspace tree roots, or glob patterns
    // This expands them to leave only leaf packages
    return expandPackages(logger, rootDir, packageGlobPaths, exclude, fs);
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
    hostOrPrograms: ts.CompilerHost | ts.Program[],
    fs: FileSystem,
): DocumentationEntryPoint[] {
    if (!Array.isArray(hostOrPrograms)) {
        hostOrPrograms = getEntryPrograms(inputFiles, logger, options, hostOrPrograms);
    }
    const baseDir = options.getValue("basePath") || getCommonDirectory(inputFiles);
    const entryPoints: DocumentationEntryPoint[] = [];
    let expandSuggestion = true;

    entryLoop: for (const fileOrDir of inputFiles.map(normalizePath)) {
        const toCheck: string[] = [fileOrDir];
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

        for (const program of hostOrPrograms) {
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
            i18n.entry_point_0_not_in_program(nicePath(fileOrDir)),
        );
        if (expandSuggestion && fs.isDir(fileOrDir)) {
            expandSuggestion = false;
            logger.info(i18n.use_expand_or_glob_for_files_in_dir());
        }
    }

    return entryPoints;
}

export function getExpandedEntryPointsForPaths(
    logger: Logger,
    inputFiles: string[],
    options: Options,
    hostOrPrograms: ts.CompilerHost | ts.Program[],
    fs: FileSystem,
): DocumentationEntryPoint[] {
    const compilerOptions = options.getCompilerOptions();
    const supportedFileRegex = compilerOptions.allowJs || compilerOptions.checkJs
        ? /\.([cm][tj]s|[tj]sx?)$/
        : /\.([cm]ts|tsx?)$/;

    return getEntryPointsForPaths(
        logger,
        expandInputFiles(logger, inputFiles, options, supportedFileRegex),
        options,
        hostOrPrograms,
        fs,
    );
}

function expandGlobs(globs: GlobString[], exclude: GlobString[], logger: Logger, fs: FileSystem) {
    const excludePatterns = new MinimatchSet(exclude);

    const base = deriveRootDir(globs);
    const result = globs.flatMap((entry) => {
        const result = glob(entry, base, fs, {
            includeDirectories: true,
            followSymlinks: true,
        });

        const filtered = result.filter(
            (file) => file === entry || !excludePatterns.matchesAny(file),
        );

        if (result.length === 0) {
            logger.warn(
                i18n.glob_0_did_not_match_any_files(nicePath(entry)),
            );
            if (entry.includes("\\") && !entry.includes("/")) {
                logger.info(i18n.glob_should_use_posix_slash());
            }
        } else if (filtered.length === 0) {
            logger.warn(
                i18n.entry_point_0_did_not_match_any_files_after_exclude(
                    nicePath(entry),
                ),
            );
        } else if (filtered.length !== 1) {
            logger.verbose(
                `Expanded ${nicePath(entry)} to:\n\t${
                    filtered
                        .map(nicePath)
                        .join("\n\t")
                }`,
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
    host: ts.CompilerHost,
) {
    const noTsConfigFound = options.getFileNames().length === 0 &&
        options.getProjectReferences().length === 0;

    const rootProgram = noTsConfigFound
        ? ts.createProgram({
            host,
            rootNames: inputFiles,
            options: options.getCompilerOptions(),
        })
        : ts.createProgram({
            host,
            rootNames: options.getFileNames(),
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
                    host,
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
    supportedFile: RegExp,
): NormalizedPath[] {
    const files: NormalizedPath[] = [];

    const exclude = new MinimatchSet(options.getValue("exclude"));

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
        } else if (supportedFile.test(file)) {
            if (!entryPoint && exclude.matchesAny(file)) {
                return;
            }
            files.push(normalizePath(file));
        }
    }

    entryPoints.forEach((file) => {
        const resolved = resolve(file);
        if (!FS.existsSync(resolved)) {
            logger.warn(i18n.entry_point_0_did_not_exist(file));
            return;
        }

        add(resolved, true);
    });

    return files;
}
