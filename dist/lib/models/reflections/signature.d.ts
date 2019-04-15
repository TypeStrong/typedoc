import { Type } from '../types/index';
import { Reflection, TypeContainer, TypeParameterContainer, TraverseCallback } from './abstract';
import { ContainerReflection } from './container';
import { ParameterReflection } from './parameter';
import { TypeParameterReflection } from './type-parameter';
export declare class SignatureReflection extends Reflection implements TypeContainer, TypeParameterContainer {
    parent?: ContainerReflection;
    parameters?: ParameterReflection[];
    typeParameters?: TypeParameterReflection[];
    type?: Type;
    overwrites?: Type;
    inheritedFrom?: Type;
    implementationOf?: Type;
    getParameterTypes(): Type[];
    traverse(callback: TraverseCallback): void;
    toObject(): any;
    toString(): string;
}
