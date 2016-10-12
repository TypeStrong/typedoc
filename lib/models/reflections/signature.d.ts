import { Type } from "../types/index";
import { Reflection, ITypeContainer, ITypeParameterContainer, ITraverseCallback } from "./abstract";
import { ContainerReflection } from "./container";
import { ParameterReflection } from "./parameter";
import { TypeParameterReflection } from "./type-parameter";
export declare class SignatureReflection extends Reflection implements ITypeContainer, ITypeParameterContainer {
    parent: ContainerReflection;
    parameters: ParameterReflection[];
    typeParameters: TypeParameterReflection[];
    type: Type;
    overwrites: Type;
    inheritedFrom: Type;
    implementationOf: Type;
    getParameterTypes(): Type[];
    traverse(callback: ITraverseCallback): void;
    toObject(): any;
    toString(): string;
}
