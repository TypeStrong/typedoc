function A<T> (x: T): T extends number ? number : string {
    return 'number' === typeof x ? x : x.toString() as any;
}

type B<T> = T extends string ? 'string' : 'notstring';
