export type Foo = FooA | FooB;

export interface BaseFoo<T extends string> {
    type: T;

    is<Type extends string>(
        type: Type,
    ): this is Foo & {
        type: Type;
    };
}

export interface FooA extends BaseFoo<"A"> {}

export interface FooB extends BaseFoo<"B"> {}
