import { Reflection } from "../reflections/abstract";
import { Type } from "./abstract";
export declare class ReferenceType extends Type {
    name: string;
    typeArguments: Type[];
    symbolID: number;
    reflection: Reflection;
    static SYMBOL_ID_RESOLVED: number;
    static SYMBOL_ID_RESOLVE_BY_NAME: number;
    constructor(name: string, symbolID: number, reflection?: Reflection);
    clone(): Type;
    equals(type: ReferenceType): boolean;
    toObject(): any;
    toString(): string;
}
