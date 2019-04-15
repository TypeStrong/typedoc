import { Type } from './abstract';
export declare class TypeOperatorType extends Type {
    readonly type: string;
    target: Type;
    readonly operator = "keyof";
    constructor(target: Type);
    clone(): Type;
    equals(type: TypeOperatorType): boolean;
    toObject(): any;
    toString(): string;
}
