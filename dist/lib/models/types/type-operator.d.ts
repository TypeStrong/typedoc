import { Type } from './abstract';
export declare class TypeOperatorType extends Type {
    readonly type: string;
    target: Type;
    operator: 'keyof';
    constructor(target: Type);
    clone(): Type;
    equals(type: TypeOperatorType): boolean;
    toObject(): any;
    toString(): string;
}
