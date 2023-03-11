import { Minimatch } from "minimatch";
import { isAbsolute, relative } from "path";
import { normalizePath } from "./fs";

/**
 * Convert array of glob patterns to array of minimatch instances.
 *
 * Handle a few Windows-Unix path gotchas.
 */
export function createMinimatch(patterns: string[]): Minimatch[] {
    return patterns.map(
        (pattern) =>
            new Minimatch(normalizePath(pattern).replace(/^\w:\//, ""), {
                dot: true,
            })
    );
}

export function matchesAny(patterns: readonly Minimatch[], path: string) {
    const normPath = normalizePath(path).replace(/^\w:\//, "");
    return patterns.some((pat) => pat.match(normPath));
}

export function nicePath(absPath: string) {
    if (!isAbsolute(absPath)) return absPath;

    const relativePath = relative(process.cwd(), absPath);
    if (relativePath.startsWith("..")) {
        return normalizePath(absPath);
    }
    return `./${normalizePath(relativePath)}`;
}
