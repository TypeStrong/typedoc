// Shiki 1.x declares a `loadWasm` function which takes these types as input.
// They are declared in the DOM library, but since TypeDoc doesn't use that library,
// we have to declare some shims, intentionally crafted to not be accidentally
// constructed.

declare namespace WebAssembly {
    interface Instance {
        __shikiHack: never;
        exports: unknown;
    }
    interface WebAssemblyInstantiatedSource {
        __shikiHack: never;
    }
    type ImportValue = unknown;
}

interface Response {
    __shikiHack: never;
}
