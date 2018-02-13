import { DefaultValueContainer, TypeContainer, TypeParameterContainer, TraverseCallback } from './abstract';
import { Type } from '../types/index';
import { ContainerReflection } from './container';
import { SignatureReflection } from './signature';
import { TypeParameterReflection } from './type-parameter';
export interface DeclarationHierarchy {
    types: Type[];
    next?: DeclarationHierarchy;
    isTarget?: boolean;
}
export declare class DeclarationReflection extends ContainerReflection implements DefaultValueContainer, TypeContainer, TypeParameterContainer {
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
    typeHierarchy: DeclarationHierarchy;
    hasGetterOrSetter(): boolean;
    getAllSignatures(): SignatureReflection[];
    traverse(callback: TraverseCallback): void;
    toObject(): any;
    toString(): string;
}
