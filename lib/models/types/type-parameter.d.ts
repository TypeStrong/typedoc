import { Type } from "./abstract";
export declare class TypeParameterType extends Type {
    name: string;
    constraint: Type;
    clone(): Type;
    equals(type: TypeParameterType): boolean;
    toObject(): any;
    toString(): string;
}
