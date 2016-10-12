import { Type } from "./abstract";
export declare class UnknownType extends Type {
    name: string;
    constructor(name: string);
    clone(): Type;
    equals(type: UnknownType): boolean;
    toObject(): any;
    toString(): string;
}
