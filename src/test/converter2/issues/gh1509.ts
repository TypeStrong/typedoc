export interface Foo {
    foo: number;
}

export interface PartialFoo extends Partial<Foo> {}
export interface ReadonlyFoo extends Readonly<Partial<Foo>> {}
