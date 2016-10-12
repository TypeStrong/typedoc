export declare abstract class Type {
    isArray: boolean;
    abstract clone(): Type;
    equals(type: Type): boolean;
    toObject(): any;
    toString(): string;
    static isTypeListSimiliar(a: Type[], b: Type[]): boolean;
    static isTypeListEqual(a: Type[], b: Type[]): boolean;
}
