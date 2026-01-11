// Without this the reproducer for 3052 doesn't work.
// Prior to this, TypeDoc would register symbol IDs for types, which caused
// catchIfCatchable.catchIfCatchable.__type (return type of the signature)
// to incorrectly be assigned the symbol reference for the catch method
export class CustomPromise<T> implements Promise<T> {
    public readonly [Symbol.toStringTag] = "Promise";
    public then(): any {}
    public catch(): any {}
    public finally(): any {}
}

export class PromiseReference {
    public static catchIfCatchable(p: any): typeof Promise.prototype.catch | undefined {
        throw "Minimizing for bug reproduction";
    }
}
