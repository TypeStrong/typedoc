import { Type } from './abstract';
export declare class TypeParameterType extends Type {
    name: string;
    constraint: Type;
    readonly type: string;
    clone(): Type;
    equals(type: TypeParameterType): boolean;
    toObject(): any;
    toString(): string;
}
