import { Type } from './abstract';
export declare class TupleType extends Type {
    elements: Type[];
    readonly type: string;
    constructor(elements: Type[]);
    clone(): Type;
    equals(type: TupleType): boolean;
    toObject(): any;
    toString(): string;
}
