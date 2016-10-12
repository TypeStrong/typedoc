import { Type } from "./abstract";
export declare class TupleType extends Type {
    elements: Type[];
    constructor(elements: Type[]);
    clone(): Type;
    equals(type: TupleType): boolean;
    toObject(): any;
    toString(): string;
}
