import { dirname } from "path";
import * as Util from "util";
import url from "url";
import { DefaultMap } from "./map.js";

/**
 * This type provides a flag that can be used to turn off more lax overloads intended for
 * plugin use only to catch type errors in the TypeDoc codebase. The prepublishOnly npm
 * script will be used to switch this flag to false when publishing, then immediately back
 * to true after a successful publish.
 */
type InternalOnly = true;

/**
 * Helper type to convert `T` to `F` if compiling TypeDoc with stricter types.
 *
 * Can be used in overloads to map a parameter type to `never`. For example, the
 * following function will work with any string argument, but to improve the type safety
 * of internal code, we only ever want to pass 'a' or 'b' to it. Plugins on the other
 * hand need to be able to pass any string to it. Overloads similar to this are used
 * in the {@link Options} class.
 *
 * This is also used to prevent TypeDoc code from using deprecated methods which will
 * be removed in a future release.
 *
 * ```ts
 * function over(flag: 'a' | 'b'): string
 * // deprecated
 * function over(flag: IfInternal<never, string>): string
 * function over(flag: string): string { return flag }
 * ```
 */
export type IfInternal<T, F> = InternalOnly extends true ? T : F;

/**
 * Helper type to convert `T` to `never` if compiling TypeDoc with stricter types.
 *
 * See {@link IfInternal} for the rationale.
 */
export type NeverIfInternal<T> = IfInternal<never, T>;

/**
 * Resolves a string type into a union of characters, `"ab"` turns into `"a" | "b"`.
 */
export type Chars<T extends string> = T extends `${infer C}${infer R}`
    ? C | Chars<R>
    : never;

/**
 * Utility to help type checking ensure that there is no uncovered case.
 */
export function assertNever(x: never): never {
    throw new Error(
        `Expected handling to cover all possible cases, but it didn't cover: ${Util.inspect(
            x,
        )}`,
    );
}

// From MDN
export function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

// Based on https://en.wikipedia.org/wiki/Levenshtein_distance#Iterative_with_two_matrix_rows
// Slightly modified for improved match results for options
export function editDistance(s: string, t: string): number {
    if (s.length < t.length) return editDistance(t, s);

    let v0 = Array.from({ length: t.length + 1 }, (_, i) => i);
    let v1 = Array.from({ length: t.length + 1 }, () => 0);

    for (let i = 0; i < s.length; i++) {
        v1[0] = i + 1;

        for (let j = 0; j < s.length; j++) {
            const deletionCost = v0[j + 1] + 1;
            const insertionCost = v1[j] + 1;
            let substitutionCost: number;
            if (s[i] === t[j]) {
                substitutionCost = v0[j];
            } else if (s[i]?.toUpperCase() === t[j]?.toUpperCase()) {
                substitutionCost = v0[j] + 1;
            } else {
                substitutionCost = v0[j] + 3;
            }

            v1[j + 1] = Math.min(deletionCost, insertionCost, substitutionCost);
        }

        [v0, v1] = [v1, v0];
    }

    return v0[t.length];
}

export function getSimilarValues(values: Iterable<string>, compareTo: string) {
    const results = new DefaultMap<number, string[]>(() => []);
    let lowest = Infinity;
    for (const name of values) {
        const distance = editDistance(compareTo, name);
        lowest = Math.min(lowest, distance);
        results.get(distance).push(name);
    }

    // Experimenting a bit, it seems an edit distance of 3 is roughly the
    // right metric for relevant "similar" results without showing obviously wrong suggestions
    return results
        .get(lowest)
        .concat(results.get(lowest + 1), results.get(lowest + 2));
}

export function NonEnumerable(
    _cls: unknown,
    context: ClassFieldDecoratorContext,
) {
    context.addInitializer(function () {
        Object.defineProperty(this, context.name, {
            enumerable: false,
            configurable: true,
            writable: true,
        });
    });
}

// transform /abs/path/to/typedoc/dist/lib/utils/general -> /abs/path/to/typedoc
export const TYPEDOC_ROOT = dirname(
    dirname(dirname(dirname(url.fileURLToPath(import.meta.url)))),
);

/**
 * This is a hack to make it possible to detect and warn about installation setups
 * which result in TypeDoc being installed multiple times. If TypeDoc has been loaded
 * multiple times, then parts of it will not work as expected.
 */
const loadSymbol = Symbol.for("typedoc_loads");
const pathSymbol = Symbol.for("typedoc_paths");

interface TypeDocGlobals {
    [loadSymbol]?: number;
    [pathSymbol]?: string[];
}
const g = globalThis as TypeDocGlobals;

g[loadSymbol] = (g[loadSymbol] || 0) + 1;
g[pathSymbol] ||= [];
g[pathSymbol].push(TYPEDOC_ROOT);

export function hasBeenLoadedMultipleTimes() {
    return g[loadSymbol] !== 1;
}

export function getLoadedPaths() {
    return g[pathSymbol] || [];
}
