import { IDefaultValueContainer, ITypeContainer, ITypeParameterContainer, ITraverseCallback } from "./abstract";
import { Type } from "../types/index";
import { ContainerReflection } from "./container";
import { SignatureReflection } from "./signature";
import { TypeParameterReflection } from "./type-parameter";
export interface IDeclarationHierarchy {
    types: Type[];
    next?: IDeclarationHierarchy;
    isTarget?: boolean;
}
export declare class DeclarationReflection extends ContainerReflection implements IDefaultValueContainer, ITypeContainer, ITypeParameterContainer {
    type: Type;
    typeParameters: TypeParameterReflection[];
    signatures: SignatureReflection[];
    indexSignature: SignatureReflection;
    getSignature: SignatureReflection;
    setSignature: SignatureReflection;
    defaultValue: string;
    overwrites: Type;
    inheritedFrom: Type;
    implementationOf: Type;
    extendedTypes: Type[];
    extendedBy: Type[];
    implementedTypes: Type[];
    implementedBy: Type[];
    typeHierarchy: IDeclarationHierarchy;
    hasGetterOrSetter(): boolean;
    getAllSignatures(): SignatureReflection[];
    traverse(callback: ITraverseCallback): void;
    toObject(): any;
    toString(): string;
}
