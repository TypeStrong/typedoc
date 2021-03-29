export function gh1449<T extends [foo: any, bar?: any]>(a: T): T {
    return a;
}
