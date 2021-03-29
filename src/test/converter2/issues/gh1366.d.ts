export interface Foo {
    prop: number;
}

export namespace GH1366 {
    // This is only allowed in an ambient context.
    export { Foo };
}
