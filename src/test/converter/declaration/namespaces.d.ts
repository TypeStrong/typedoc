export interface Foo {
    prop: number;
}

export namespace GH1366 {
    // This is only allowed in an ambient context.
    export { Foo };
}

export namespace GH1124 {
    export type PrimitiveType = boolean | string | number | Date;
}

export namespace GH1124 {
    export const Value: string;
}
