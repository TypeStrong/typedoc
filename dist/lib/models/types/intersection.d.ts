import { Type } from './abstract';
export declare class IntersectionType extends Type {
    types: Type[];
    readonly type: string;
    constructor(types: Type[]);
    clone(): Type;
    equals(type: IntersectionType): boolean;
    toObject(): any;
    toString(): string;
}
