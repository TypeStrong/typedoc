import { dirname } from "path";
import * as Util from "util";

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

export function camelToTitleCase(text: string) {
    return (
        text.substring(0, 1).toUpperCase() +
        text.substring(1).replace(/[a-z][A-Z]/g, (x) => `${x[0]} ${x[1]}`)
    );
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
// transform /abs/path/to/typedoc/dist/lib/utils/general -> /abs/path/to/typedoc
g[pathSymbol].push(dirname(dirname(dirname(__dirname))));

export function hasBeenLoadedMultipleTimes() {
    return g[loadSymbol] !== 1;
}

export function getLoadedPaths() {
    return g[pathSymbol] || [];
}
