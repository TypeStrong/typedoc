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

    // Create a mapping of escaped patterns to preserve them
    const escapedBracketMap = new Map<string, string>();
    
    // Find escaped bracket patterns and create placeholders
    const braceMatch = noModifierGlob.match(/{([^}]+)}/);
    if (braceMatch) {
        const braceContent = braceMatch[1];
        const parts = braceContent.split(',');
        
        parts.forEach(part => {
            if (part.includes('\\[') || part.includes('\\]')) {
                // Create a temporary pattern for Minimatch processing
                // eslint-disable-next-line no-useless-escape
                const tempPattern = part.replace(/\\[\[\]]/g, '.');
                escapedBracketMap.set(tempPattern, part);
            }
        });
    }

    const mini = new Minimatch(noModifierGlob, { dot: true });

    const basePaths = mini.set.map(set => {
        const stop = set.findIndex((part) => typeof part !== "string");
        if (stop === -1) {
            return set.join("/");
        } else {
            return set.slice(0, stop).join("/");
        }
    });

    const base = getCommonPath(basePaths);

    if (base) {
        const skipIndex = countMatches(base, "/") + 1;
        const globPart = mini.globParts.map(s => s.slice(skipIndex));
        
        // Restore escaped bracket patterns in the glob parts
        const restoredGlobPart = globPart.map(parts => {
            return parts.map(part => {
                // Check if this part should be restored to escaped brackets
                for (const [tempPattern, originalPattern] of escapedBracketMap) {
                    if (part === tempPattern) {
                        return originalPattern;
                    }
                }
                return part;
            });
        });
        
        const resultingGlob = restoredGlobPart.length === 1
            ? restoredGlobPart[0].join("/")
            : `{${restoredGlobPart.map(s => s.join("/")).join(",")}}`;
        return { modifiers, path: base, glob: resultingGlob };
    }

    return { modifiers, path: "", glob: noModifierGlob };
}

export function createGlobString(relativeTo: NormalizedPath, glob: string): GlobString {
    if (isAbsolute(glob) || isGlobalGlob(glob)) return glob as GlobString;

    const split = splitGlobToPathAndSpecial(glob);
    const leadingPath = normalizePath(resolve(relativeTo, split.path));

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
