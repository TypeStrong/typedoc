import { Type } from '../types/index';
import { Reflection, DefaultValueContainer, TypeContainer, TraverseCallback } from './abstract';
import { SignatureReflection } from './signature';
export declare class ParameterReflection extends Reflection implements DefaultValueContainer, TypeContainer {
    parent: SignatureReflection;
    defaultValue: string;
    type: Type;
    traverse(callback: TraverseCallback): void;
    toObject(): any;
    toString(): string;
}
