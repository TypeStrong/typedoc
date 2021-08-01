import { ok as assert } from "assert";
import { TypeParameterContainer, Reflection, DeclarationReflection } from "../../models";
export { wbr } from "../helpers/wbr";
export { stringify } from "../helpers/stringify";

export function classNames(names: Record<string, boolean | null | undefined>) {
    return Object.entries(names)
        .filter(([, include]) => include)
        .map(([key]) => key)
        .join(" ");
}

export function assertIsDeclarationReflection(reflection: Reflection): DeclarationReflection {
    assert(reflection instanceof DeclarationReflection);
    return reflection;
}

export function hasTypeParameters(reflection: Reflection): reflection is Reflection & {
    typeParameters: Exclude<TypeParameterContainer["typeParameters"], undefined>;
} {
    return (reflection as TypeParameterContainer).typeParameters != null;
}
