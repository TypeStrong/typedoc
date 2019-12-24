class C {
    foo: number;
}

function A<T> (x: T): T extends number ? number : C {
    return 'number' === typeof x ? x : new C() as any;
}

type B<T> = T extends string ? 'string' : 'notstring';
