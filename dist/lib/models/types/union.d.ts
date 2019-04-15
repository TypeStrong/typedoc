import { Type } from './abstract';
export declare class UnionType extends Type {
    types: Type[];
    readonly type: string;
    constructor(types: Type[]);
    clone(): Type;
    equals(type: UnionType): boolean;
    toObject(): any;
    toString(): string;
}
