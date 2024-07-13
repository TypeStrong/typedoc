export abstract class A {
    protected constructor(a: number) {
        this.a = a;
    }

    /** a prop @hidden */
    public readonly a: number;
}

export class B extends A {
    /** @param a a comment */
    public constructor(a: number) {
        super(a);
    }
}
