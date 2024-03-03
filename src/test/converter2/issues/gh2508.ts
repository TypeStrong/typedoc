export enum Color {
    BLUE = "Blue",
    RED = "Red",
}

type TypeOf<T> = {
    [K in keyof T]: T[K][keyof T[K]];
};

type Foo = {
    color: typeof Color;
};

/** @interface */
export type Bar = TypeOf<Foo>;
//          ^?
