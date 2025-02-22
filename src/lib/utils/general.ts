import { dirname } from "path";
import url from "url";
import { url as debuggerUrl } from "inspector";

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

export function isDebugging() {
    return !!debuggerUrl();
}
