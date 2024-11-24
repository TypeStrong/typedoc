declare module "bar" {
    export namespace Nested {
        export interface Bar {}
    }
}
declare module "foo" {
    export type Foo = import("bar").Nested.Bar;
}
