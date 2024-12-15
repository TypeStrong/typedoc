export interface Foo {
    codeGeneration?: {
        strings: boolean;
        wasm: boolean;
    };

    iterator(options?: {
        destroyOnReturn?: boolean;
    }): AsyncIterableIterator<any>;
}
