import { Minimatch } from "minimatch";
import { isAbsolute, relative } from "path";

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
            }),
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

/**
 * Normalize the given path.
 *
 * @param path  The path that should be normalized.
 * @returns The normalized path.
 */
export function normalizePath(path: string) {
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

    return path;
}
