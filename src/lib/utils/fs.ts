import * as fs from "fs";
import { promises as fsp } from "fs";
import { Minimatch } from "minimatch";
import { dirname, join, relative, resolve } from "path";
import { optional, validate } from "./validation.js";
import { createMinimatch, normalizePath } from "./paths.js";
import { filterMap } from "./array.js";
import { escapeRegExp } from "./general.js";
import { ok } from "assert";

export function isFile(file: string) {
    try {
        return fs.statSync(file).isFile();
    } catch {
        return false;
    }
}

export function isDir(path: string) {
    try {
        return fs.statSync(path).isDirectory();
    } catch {
        return false;
    }
}

export function deriveRootDir(globPaths: string[]): string {
    const normalized = globPaths.map(normalizePath);
    const globs = createMinimatch(normalized);
    const rootPaths = globs.flatMap((glob) =>
        filterMap(glob.set, (set) => {
            const stop = set.findIndex((part) => typeof part !== "string");
            if (stop === -1) {
                return set.join("/");
            } else {
                return set.slice(0, stop).join("/");
            }
        }),
    );
    return getCommonDirectory(rootPaths);
}

/**
 * Get the longest directory path common to all files.
 */
export function getCommonDirectory(files: readonly string[]): string {
    if (!files.length) {
        return "";
    }

    const roots = files.map((f) => f.split("/"));
    if (roots.length === 1) {
        return roots[0].slice(0, -1).join("/");
    }

    let i = 0;

    while (
        i < roots[0].length &&
        new Set(roots.map((part) => part[i])).size === 1
    ) {
        i++;
    }

    return roots[0].slice(0, i).join("/");
}

/**
 * Load the given file and return its contents.
 *
 * @param file  The path of the file to read.
 * @returns The files contents.
 */
export function readFile(file: string): string {
    const buffer = fs.readFileSync(file);
    switch (buffer[0]) {
        case 0xfe:
            if (buffer[1] === 0xff) {
                let i = 0;
                while (i + 1 < buffer.length) {
                    const temp = buffer[i];
                    buffer[i] = buffer[i + 1];
                    buffer[i + 1] = temp;
                    i += 2;
                }
                return buffer.toString("ucs2", 2);
            }
            break;
        case 0xff:
            if (buffer[1] === 0xfe) {
                return buffer.toString("ucs2", 2);
            }
            break;
        case 0xef:
            if (buffer[1] === 0xbb) {
                return buffer.toString("utf8", 3);
            }
    }

    return buffer.toString("utf8", 0);
}

/**
 * Write a file to disc.
 *
 * If the containing directory does not exist it will be created.
 *
 * @param fileName  The name of the file that should be written.
 * @param data  The contents of the file.
 */
export function writeFileSync(fileName: string, data: string) {
    fs.mkdirSync(dirname(normalizePath(fileName)), { recursive: true });
    fs.writeFileSync(normalizePath(fileName), data);
}

/**
 * Write a file to disc.
 *
 * If the containing directory does not exist it will be created.
 *
 * @param fileName  The name of the file that should be written.
 * @param data  The contents of the file.
 */
export async function writeFile(fileName: string, data: string) {
    await fsp.mkdir(dirname(normalizePath(fileName)), {
        recursive: true,
    });
    await fsp.writeFile(normalizePath(fileName), data);
}

/**
 * Copy a file or directory recursively.
 */
export async function copy(src: string, dest: string): Promise<void> {
    const stat = await fsp.stat(src);

    if (stat.isDirectory()) {
        const contained = await fsp.readdir(src);
        await Promise.all(
            contained.map((file) => copy(join(src, file), join(dest, file))),
        );
    } else if (stat.isFile()) {
        await fsp.mkdir(dirname(dest), { recursive: true });
        await fsp.copyFile(src, dest);
    } else {
        // Do nothing for FIFO, special devices.
    }
}

export function copySync(src: string, dest: string): void {
    const stat = fs.statSync(src);

    if (stat.isDirectory()) {
        const contained = fs.readdirSync(src);
        contained.forEach((file) =>
            copySync(join(src, file), join(dest, file)),
        );
    } else if (stat.isFile()) {
        fs.mkdirSync(dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
    } else {
        // Do nothing for FIFO, special devices.
    }
}

export interface DiscoverFilesController {
    shouldRecurse(childPath: string[]): boolean;
    matches(path: string): boolean;

    /** Defaults to false */
    matchDirectories?: boolean;
    /** Defaults to false */
    followSymlinks?: boolean;
}

// cache of fs.realpathSync results to avoid extra I/O
const realpathCache: Map<string, string> = new Map();

export function discoverFiles(
    rootDir: string,
    controller: DiscoverFilesController,
) {
    const result: string[] = [];
    const dirs: string[][] = [normalizePath(rootDir).split("/")];
    // cache of real paths to avoid infinite recursion
    const symlinkTargetsSeen: Set<string> = new Set();
    const { matchDirectories = false, followSymlinks = false } = controller;
    let dir = dirs.shift();

    const handleFile = (path: string) => {
        const childPath = [...dir!, path].join("/");
        if (controller.matches(childPath)) {
            result.push(childPath);
        }
    };

    const handleDirectory = (path: string) => {
        const childPath = [...dir!, path];
        if (controller.shouldRecurse(childPath)) {
            dirs.push(childPath);
        }
    };

    const handleSymlink = (path: string) => {
        const childPath = [...dir!, path].join("/");
        let realpath: string;
        try {
            realpath =
                realpathCache.get(childPath) ?? fs.realpathSync(childPath);
            realpathCache.set(childPath, realpath);
        } catch {
            return;
        }

        if (symlinkTargetsSeen.has(realpath)) {
            return;
        }
        symlinkTargetsSeen.add(realpath);

        try {
            const stats = fs.statSync(realpath);
            if (stats.isDirectory()) {
                handleDirectory(path);
            } else if (stats.isFile()) {
                handleFile(path);
            } else if (stats.isSymbolicLink()) {
                const dirpath = dir!.join("/");
                if (dirpath === realpath) {
                    // special case: real path of symlink is the directory we're currently traversing
                    return;
                }
                const targetPath = relative(dirpath, realpath);
                handleSymlink(targetPath);
            } // everything else should be ignored
        } catch (e) {
            // invalid symbolic link; ignore
        }
    };

    while (dir) {
        if (matchDirectories && controller.matches(dir.join("/"))) {
            result.push(dir.join("/"));
        }

        for (const child of fs.readdirSync(dir.join("/"), {
            withFileTypes: true,
        })) {
            if (child.isFile()) {
                handleFile(child.name);
            } else if (child.isDirectory()) {
                handleDirectory(child.name);
            } else if (followSymlinks && child.isSymbolicLink()) {
                handleSymlink(child.name);
            }
        }

        dir = dirs.shift();
    }

    return result;
}

/**
 * Simpler version of `glob.sync` that only covers our use cases, always ignoring node_modules.
 */
export function glob(
    pattern: string,
    root: string,
    options: { includeDirectories?: boolean; followSymlinks?: boolean } = {},
): string[] {
    const mini = new Minimatch(normalizePath(pattern));
    const shouldIncludeNodeModules = pattern.includes("node_modules");

    const controller: DiscoverFilesController = {
        matches(path) {
            return mini.match(path);
        },
        shouldRecurse(childPath) {
            // if we _specifically asked_ for something in node_modules, fine, otherwise ignore it
            // to avoid globs like '**/*.ts' finding all the .d.ts files in node_modules.
            // however, if the pattern is something like `!**/node_modules/**`, this will also
            // cause node_modules to be considered, though it will be discarded by minimatch.
            if (
                childPath[childPath.length - 1] === "node_modules" &&
                !shouldIncludeNodeModules
            ) {
                return false;
            }

            return mini.set.some((row) =>
                mini.matchOne(childPath, row, /* partial */ true),
            );
        },
        matchDirectories: options.includeDirectories,
        followSymlinks: options.followSymlinks,
    };

    return discoverFiles(root, controller);
}

export function hasTsExtension(path: string): boolean {
    return /\.[cm]?ts$|\.tsx$/.test(path);
}

export function hasDeclarationFileExtension(path: string) {
    return /\.d\.[cm]?ts$/.test(path);
}

export function discoverInParentDir<T extends {}>(
    name: string,
    dir: string,
    read: (content: string) => T | undefined,
): { file: string; content: T } | undefined {
    if (!isDir(dir)) return;

    const reachedTopDirectory = (dirName: string) =>
        dirName === resolve(join(dirName, ".."));

    while (!reachedTopDirectory(dir)) {
        for (const file of fs.readdirSync(dir)) {
            if (file.toLowerCase() !== name.toLowerCase()) continue;

            try {
                const content = read(readFile(join(dir, file)));
                if (content != null) {
                    return { file: join(dir, file), content };
                }
            } catch {
                // Ignore, file didn't pass validation
            }
        }
        dir = resolve(join(dir, ".."));
    }
}

export function discoverInParentDirExactMatch<T extends {}>(
    name: string,
    dir: string,
    read: (content: string) => T | undefined,
): { file: string; content: T } | undefined {
    if (!isDir(dir)) return;

    const reachedTopDirectory = (dirName: string) =>
        dirName === resolve(join(dirName, ".."));

    while (!reachedTopDirectory(dir)) {
        try {
            const content = read(readFile(join(dir, name)));
            if (content != null) {
                return { file: join(dir, name), content };
            }
        } catch {
            // Ignore, file didn't pass validation
        }
        dir = resolve(join(dir, ".."));
    }
}

export function discoverPackageJson(dir: string) {
    return discoverInParentDirExactMatch("package.json", dir, (content) => {
        const pkg: unknown = JSON.parse(content);
        if (validate({ name: String, version: optional(String) }, pkg)) {
            return pkg;
        }
    });
}

// dir -> package name according to package.json in this or some parent dir
const packageCache = new Map<string, string>();

export function findPackageForPath(sourcePath: string): string | undefined {
    // Attempt to decide package name from path if it contains "node_modules"
    let startIndex = sourcePath.lastIndexOf("node_modules/");
    if (startIndex !== -1) {
        startIndex += "node_modules/".length;
        let stopIndex = sourcePath.indexOf("/", startIndex);
        // Scoped package, e.g. `@types/node`
        if (sourcePath[startIndex] === "@") {
            stopIndex = sourcePath.indexOf("/", stopIndex + 1);
        }
        return sourcePath.substring(startIndex, stopIndex);
    }

    const dir = dirname(sourcePath);
    const cache = packageCache.get(dir);
    if (cache) {
        return cache;
    }

    const packageJson = discoverPackageJson(dir);
    if (packageJson) {
        packageCache.set(dir, packageJson.content.name);
        return packageJson.content.name;
    }
}

export function inferPackageEntryPointPaths(
    packagePath: string,
): [importPath: string, resolvedPath: string][] {
    const packageDir = dirname(packagePath);
    const packageJson = JSON.parse(readFile(packagePath));
    const exports: unknown = packageJson.exports;
    if (typeof exports === "string") {
        return resolveExport(packageDir, ".", exports, false);
    }

    if (!exports || typeof exports !== "object") {
        if (typeof packageJson.main === "string") {
            return [[".", resolve(packageDir, packageJson.main)]];
        }

        return [];
    }

    const results: [string, string][] = [];

    if (Array.isArray(exports)) {
        results.push(...resolveExport(packageDir, ".", exports, true));
    } else {
        for (const [importPath, exp] of Object.entries(exports)) {
            results.push(...resolveExport(packageDir, importPath, exp, false));
        }
    }

    return results;
}

function resolveExport(
    packageDir: string,
    name: string,
    exportDeclaration: string | string[] | Record<string, string>,
    validatePath: boolean,
): [string, string][] {
    if (typeof exportDeclaration === "string") {
        return resolveStarredExport(
            packageDir,
            name,
            exportDeclaration,
            validatePath,
        );
    }

    if (Array.isArray(exportDeclaration)) {
        for (const item of exportDeclaration) {
            const result = resolveExport(packageDir, name, item, true);
            if (result.length) {
                return result;
            }
        }

        return [];
    }

    const EXPORT_CONDITIONS = ["typedoc", "types", "import", "node", "default"];
    for (const cond in exportDeclaration) {
        if (EXPORT_CONDITIONS.includes(cond)) {
            return resolveExport(
                packageDir,
                name,
                exportDeclaration[cond],
                false,
            );
        }
    }

    // No recognized export condition
    return [];
}

function isWildcardName(name: string) {
    let starCount = 0;
    for (let i = 0; i < name.length; ++i) {
        if (name[i] === "*") {
            ++starCount;
        }
    }
    return starCount === 1;
}

function resolveStarredExport(
    packageDir: string,
    name: string,
    exportDeclaration: string,
    validatePath: boolean,
): [string, string][] {
    // Wildcards only do something if there is exactly one star in the name
    // If there isn't any star in the destination, all entries map to one file
    // so don't bother enumerating possible files.
    if (isWildcardName(name) && exportDeclaration.includes("*")) {
        // Construct a pattern which we can use to determine if a wildcard matches
        // This will look something like: /^/app\/package\/(.*).js$/
        // The destination may have multiple wildcards, in which case they should
        // contain the same text, so we replace "*" with backreferences for all
        // but the first occurrence.
        let first = true;
        const matcher = new RegExp(
            "^" +
                escapeRegExp(
                    normalizePath(packageDir) +
                        "/" +
                        exportDeclaration.replace(/^\.\//, ""),
                ).replaceAll("\\*", () => {
                    if (first) {
                        first = false;
                        return "(.*)";
                    }
                    return "\\1";
                }) +
                "$",
        );
        const matchedFiles = discoverFiles(packageDir, {
            matches(path) {
                return matcher.test(path);
            },
            shouldRecurse(path) {
                return path[path.length - 1] !== "node_modules";
            },
        });

        return matchedFiles.flatMap((path) => {
            const starContent = path.match(matcher);
            ok(starContent, "impossible, discoverFiles uses matcher");

            return [[name.replace("*", starContent[1]), path]];
        });
    }

    const exportPath = resolve(packageDir, exportDeclaration);
    if (validatePath && !fs.existsSync(exportPath)) {
        return [];
    }

    return [[name, exportPath]];
}
