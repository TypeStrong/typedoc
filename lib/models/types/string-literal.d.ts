import { Type } from "./abstract";
export declare class StringLiteralType extends Type {
    value: string;
    constructor(value: string);
    clone(): Type;
    equals(type: StringLiteralType): boolean;
    toObject(): any;
    toString(): string;
}
