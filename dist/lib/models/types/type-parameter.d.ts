import { Type } from './abstract';
export declare class TypeParameterType extends Type {
    readonly name: string;
    constraint?: Type;
    readonly type: string;
    constructor(name: string);
    clone(): Type;
    equals(type: TypeParameterType): boolean;
    toObject(): any;
    toString(): string;
}
