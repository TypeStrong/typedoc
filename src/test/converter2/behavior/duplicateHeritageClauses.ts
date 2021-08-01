export interface A {
    a?: string;
}

export interface B extends A {}
export interface B extends A {
    b?: string;
}

export interface C extends A {}
export class C implements A {}

export interface D extends Record<"a", 1> {}
export interface D extends Record<"a", 1>, Record<"b", 1> {}
