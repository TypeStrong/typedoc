import { Type } from './index';
export declare class ArrayType extends Type {
    elementType: Type;
    readonly type: string;
    constructor(elementType: Type);
    clone(): Type;
    equals(type: Type): boolean;
    toObject(): any;
    toString(): string;
}
