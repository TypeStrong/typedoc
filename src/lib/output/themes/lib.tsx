import assert = require("assert");
import {
    ContainerReflection,
    ProjectReflection,
    ReferenceReflection,
    ReferenceType,
    ReflectionType,
    Type,
    TypeParameterContainer,
    SignatureReflection,
    Reflection,
    DeclarationReflection,
} from "../../models";
import { DefaultValueContainer, TypeContainer } from "../../models/reflections/abstract";
export { wbr } from "../helpers/wbr";
export { stringify } from "../helpers/stringify";

export function isSignature(reflection: Reflection): reflection is SignatureReflection {
    // return !!(reflection.kind & ReflectionKind.SomeSignature);
    return reflection instanceof SignatureReflection;
}

export function classNames(names: Record<string, boolean | null | undefined>) {
    return Object.entries(names)
        .filter(([, include]) => include)
        .map(([key]) => key)
        .join(" ");
}

export function isDeclarationReflection(reflection: Reflection): reflection is DeclarationReflection {
    return reflection instanceof DeclarationReflection;
}
export function assertIsDeclarationReflection(reflection: Reflection): DeclarationReflection {
    assert(reflection instanceof DeclarationReflection);
    return reflection;
}

export function isProjectReflection(reflection: Reflection): reflection is ProjectReflection {
    return reflection instanceof ProjectReflection;
}

export function isReflectionType(type: Type | undefined): type is ReflectionType {
    return type != null && type instanceof ReflectionType;
}
export function isReferenceType(type: Type | undefined): type is ReferenceType {
    return type != null && type instanceof ReferenceType;
}

export function isReferenceReflection(reflection: Reflection): reflection is ReferenceReflection {
    return reflection != null && reflection instanceof ReferenceReflection;
}
export function hasTypeParameters<T extends Reflection>(
    reflection: T
): reflection is T & {
    typeParameters: Exclude<TypeParameterContainer["typeParameters"], undefined>;
} {
    return (reflection as TypeParameterContainer).typeParameters != null;
}
export function hasType<T extends Reflection>(
    reflection: T
): reflection is T & { type: Exclude<TypeContainer["type"], undefined> } {
    return (reflection as TypeContainer).type != null;
}
export function hasDefaultValue<T extends Reflection>(
    reflection: T
): reflection is T & {
    defaultValue: Exclude<DefaultValueContainer["defaultValue"], undefined>;
} {
    return (reflection as DefaultValueContainer).defaultValue != null;
}
export interface ElementTypeContainer extends Type {
    elementType: Type;
}
export function hasElementType(type: Type): type is ElementTypeContainer {
    return (type as ElementTypeContainer).elementType != null;
}
/**
 * TODO where this is used, it seems impossible for this to return false.
 */
export function isContainer(refl: Reflection | undefined): refl is ContainerReflection {
    return refl != null && refl instanceof ContainerReflection;
}
