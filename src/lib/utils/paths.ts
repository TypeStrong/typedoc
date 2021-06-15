import { Minimatch, IMinimatch } from "minimatch";
import { normalizePath } from "./fs";

/**
 * Convert array of glob patterns to array of minimatch instances.
 *
 * Handle a few Windows-Unix path gotchas.
 */
export function createMinimatch(patterns: string[]): IMinimatch[] {
    return patterns.map(
        (pattern) =>
            new Minimatch(normalizePath(pattern).replace(/^\w:\//, ""), {
                dot: true,
            })
    );
}
