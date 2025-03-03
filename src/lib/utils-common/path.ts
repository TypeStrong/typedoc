import { assert } from "./general.js";

/**
 * Represents a normalized path with path separators being `/`
 * On Windows, drives are represented like `C:/Users` for consistency
 * with TypeScript.
 *
 * The empty string `""` is a valid normalized path.
 */
export type NormalizedPath = "" | "/" | string & { readonly __normPath: unique symbol };

/**
 * Represents either a {@link NormalizedPath} or a Node module name
 * (e.g. `typedoc-plugin-mdn-links` or `@gerrit0/typedoc-plugin`)
 */
export type NormalizedPathOrModule = NormalizedPath | string & { readonly __normPathOrModule: unique symbol };

/**
 * Represents a glob path configured by a user.
 */
export type GlobString = string & { readonly __globString: unique symbol };

export namespace NormalizedPathUtils {
    export function dirname(path: NormalizedPath): NormalizedPath {
        let end = path.length - 2;
        for (; end > 0; --end) {
            if (path[end] === "/") break;
        }

        switch (end) {
            case -2:
            case -1:
                return (path[0] === "/" ? "/" : ".") as NormalizedPath;
            case 0:
                return path.substring(0, path.indexOf("/") + 1) as NormalizedPath;
            default:
                return path.slice(0, end) as NormalizedPath;
        }
    }

    export function basename(path: NormalizedPath): NormalizedPath {
        // We start at length - 2 as /var/typedoc/ should give `typedoc`
        let end = path.length - 2;
        for (; end >= 0; --end) {
            if (path[end] === "/") break;
        }

        switch (end) {
            case -2:
            case -1:
                return path;
            default:
                if (path.endsWith("/")) {
                    return path.slice(end + 1, -1) as NormalizedPath;
                }
                return path.slice(end + 1) as NormalizedPath;
        }
    }

    export function relative(from: NormalizedPath, to: NormalizedPath): NormalizedPath {
        if (from == to) {
            return "";
        }

        assert(
            isAbsolute(from) && isAbsolute(to),
            "resolving relative paths without absolute inputs requires a filesystem",
        );

        if (!from.endsWith("/")) {
            from += "/";
        }
        const end = to.length;
        if (!to.endsWith("/")) {
            to += "/";
        }

        const minLen = Math.min(from.length, to.length);
        let lastCommonSlash = 0;
        let i = 0;
        for (; i < minLen; ++i) {
            if (from[i] === to[i]) {
                if (from[i] === "/") {
                    lastCommonSlash = i;
                }
            } else {
                break;
            }
        }

        if (lastCommonSlash === from.length - 1) {
            return to.substring(from.length, end) as NormalizedPath;
        }

        let prefix = "";
        for (let i = lastCommonSlash + 1; i < from.length; ++i) {
            if (from[i] === "/" || i + 1 === from.length) {
                prefix += prefix ? "/.." : "..";
            }
        }

        return prefix + to.substring(lastCommonSlash, end) as NormalizedPath;
    }

    export function normalize(path: NormalizedPath): NormalizedPath {
        const parts = path.split("/");

        let canRemoveDotDot = false;
        for (let i = 0; i < parts.length;/* inside loop */
        ) {
            if (parts[i] == "." && i + 1 != parts.length) {
                parts.splice(i, 1);
            } else if (parts[i] == "..") {
                if (canRemoveDotDot) {
                    if (i - 1 === 0 && /\w:/i.test(parts[0])) {
                        parts.splice(i, 1);
                    } else {
                        parts.splice(i - 1, 2);
                        i = i - 1;
                    }
                } else {
                    ++i;
                }
            } else {
                canRemoveDotDot = true;
                ++i;
            }
        }

        return parts.join("/") as NormalizedPath;
    }

    export function resolve(from: NormalizedPath, to: NormalizedPath): NormalizedPath {
        assert(isAbsolute(from), "resolving without an absolute path requires a filesystem");

        if (isAbsolute(to)) {
            return to;
        }

        return normalize(`${from}/${to}` as NormalizedPath);
    }

    export function isAbsolute(from: NormalizedPath): boolean {
        return /^\/|^\w:\//.test(from);
    }

    export function splitFilename(name: string): { name: string; ext: string } {
        const lastDot = name.lastIndexOf(".");
        if (lastDot < 1) {
            return { name, ext: "" };
        }
        return { name: name.substring(0, lastDot), ext: name.substring(lastDot) };
    }
}
