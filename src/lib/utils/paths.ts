import { countMatches, filterMap, type GlobString, type NormalizedPath } from "#utils";
import { Minimatch } from "minimatch";
import { dirname, isAbsolute, relative, resolve } from "path";

export class MinimatchSet {
    readonly patterns: Minimatch[];

    constructor(patterns: GlobString[]) {
        this.patterns = patterns.map(p => new Minimatch(p, { dot: true }));
    }

    matchesAny(path: string) {
        return this.patterns.some(p => {
            return p.match(path);
        });
    }
}

function escapeGlob(glob: string) {
    return glob.replace(/[?*()[\]\\{}]/g, "\\$&");
}

function isGlobalGlob(glob: string) {
    const start = glob.match(/^[!#]+/)?.[0].length ?? 0;
    return glob.startsWith("**", start);
}

export function splitGlobToPathAndSpecial(glob: string): { modifiers: string; path: string; glob: string } {
    const modifiers = glob.match(/^[!#]+/)?.[0] ?? "";
    const noModifierGlob = glob.substring(modifiers.length);

    if (isGlobalGlob(glob)) {
        return { modifiers, path: "", glob: noModifierGlob };
    }

    const mini = new Minimatch(noModifierGlob, { dot: true });

    const nonSpecialEnds = mini.set.map(set => {
        const stop = set.findIndex((part) => typeof part !== "string");
        if (stop === -1) {
            return set.length;
        } else {
            return stop;
        }
    });

    const base = getCommonPath(nonSpecialEnds.map((end, i) => mini.set[i].slice(0, end).join("/")));

    if (base) {
        const skipIndex = countMatches(base, "/") + 1;
        const globPart = mini.globParts.map(s => s.slice(skipIndex));
        // This isn't ideal, it will end up re-writing the glob if braces are used,
        // but I don't want to write a glob minimizer at this point, and this should
        // handle all the edge cases as we're just using Minimatch's glob parsing
        const resultingGlob = globPart.length === 1
            ? globPart[0].join("/")
            : `{${globPart.map(s => s.join("/")).join(",")}}`;
        return { modifiers, path: base, glob: resultingGlob };
    }

    return { modifiers, path: "", glob: noModifierGlob };
}

export function createGlobString(relativeTo: NormalizedPath, glob: string): GlobString {
    if (isAbsolute(glob) || isGlobalGlob(glob)) return glob as GlobString;

    const split = splitGlobToPathAndSpecial(glob);
    const leadingPath = normalizePath(resolve(relativeTo, split.path)).replace(/^\w:\//, "");

    if (!split.glob) {
        return split.modifiers + escapeGlob(leadingPath) as GlobString;
    }

    return `${split.modifiers}${escapeGlob(leadingPath)}/${split.glob}` as GlobString;
}

/**
 * Get the longest directory path common to all files.
 */
export function getCommonPath(files: readonly string[]): NormalizedPath {
    if (!files.length) {
        return "";
    }

    const roots = files.map((f) => f.split("/"));
    if (roots.length === 1) {
        return roots[0].join("/") as NormalizedPath;
    }

    let i = 0;

    while (
        i < roots[0].length &&
        new Set(roots.map((part) => part[i])).size === 1
    ) {
        i++;
    }

    return roots[0].slice(0, i).join("/") as NormalizedPath;
}

export function getCommonDirectory(files: readonly string[]): NormalizedPath {
    if (files.length === 1) {
        return normalizePath(dirname(files[0]));
    }
    return getCommonPath(files);
}

export function deriveRootDir(globPaths: GlobString[]): NormalizedPath {
    const globs = new MinimatchSet(globPaths).patterns;
    const rootPaths = globs.flatMap((glob, i) =>
        filterMap(glob.set, (set) => {
            const stop = set.findIndex((part) => typeof part !== "string");
            if (stop === -1) {
                return globPaths[i];
            } else {
                const kept = set.slice(0, stop).join("/");
                return globPaths[i].substring(
                    0,
                    globPaths[i].indexOf(kept) + kept.length,
                );
            }
        })
    );
    return getCommonDirectory(rootPaths);
}

export function nicePath(absPath: string) {
    if (!isAbsolute(absPath)) return absPath;

    const relativePath = relative(process.cwd(), absPath);
    if (relativePath.startsWith("..")) {
        return normalizePath(absPath);
    }
    return `./${normalizePath(relativePath)}`;
}

/**
 * Normalize the given path.
 *
 * @param path  The path that should be normalized.
 * @returns The normalized path.
 */
export function normalizePath(path: string): NormalizedPath {
    if (process.platform === "win32") {
        // Ensure forward slashes
        path = path.replace(/\\/g, "/");

        // Msys2 git on windows will give paths which use unix-style
        // absolute paths, like /c/users/you. Since the rest of TypeDoc
        // expects drive letters, convert it to that here.
        path = path.replace(/^\/([a-zA-Z])\//, (_m, m1: string) => `${m1}:/`);

        // Make Windows drive letters upper case
        path = path.replace(
            /^([^:]+):\//,
            (_m, m1: string) => m1.toUpperCase() + ":/",
        );
    }

    return path as NormalizedPath;
}
