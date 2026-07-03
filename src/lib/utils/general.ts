import { dirname } from "path";
import { url as debuggerUrl } from "inspector";
import { createRequire } from "module";

// Note: The path for import.meta.url will be different after bundling! We don't need it
// to be something specific here as in either case it will be within TypeDoc's package.
const req = createRequire(import.meta.url);

export const TYPEDOC_ROOT = dirname(req.resolve("typedoc/package.json"));
export const TYPESCRIPT_ROOT = dirname(req.resolve("typescript"));

export const TYPEDOC_VERSION: string = req("typedoc/package.json").version;

export const SUPPORTED_TYPESCRIPT_VERSIONS = (req("typedoc/package.json").peerDependencies.typescript as string)
    .split("||")
    .map((version: string) => version.replace(/^\s*|\.x\s*$/g, ""));

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
g[pathSymbol].push(import.meta.url);

export function hasBeenLoadedMultipleTimes() {
    return g[loadSymbol] !== 1;
}

export function getLoadedPaths() {
    return g[pathSymbol] || [];
}

export function isDebugging() {
    return !!debuggerUrl();
}
