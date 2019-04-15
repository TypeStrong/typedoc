export declare abstract class Type {
    readonly type: string;
    abstract clone(): Type;
    equals(type: Type): boolean;
    toObject(): any;
    toString(): string;
    static isTypeListSimilar(a: Type[], b: Type[]): boolean;
    static isTypeListEqual(a: Type[], b: Type[]): boolean;
}
