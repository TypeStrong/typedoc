import { Type } from './abstract';
export declare class IntrinsicType extends Type {
    name: string;
    readonly type: string;
    constructor(name: string);
    clone(): Type;
    equals(type: IntrinsicType): boolean;
    toObject(): any;
    toString(): string;
}
