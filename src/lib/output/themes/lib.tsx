import assert = require("assert");
import * as React from "react";
import {
    SignatureReflection,
    Reflection,
    DeclarationReflection,
} from "../../..";
import {
    ContainerReflection,
    ProjectReflection,
    ReferenceReflection,
    ReferenceType,
    ReflectionType,
    Type,
    TypeParameterContainer,
} from "../../models";
import {
    DefaultValueContainer,
    TypeContainer,
} from "../../models/reflections/abstract";
export { wbr } from "../helpers/wbr";
export { stringify } from "../helpers/stringify";

/**
 * @deprecated
 *
 * Helper created solely to make it easier to find-and-replace refactor
 * all handlebars {{#with}} blocks into JSX.
 *
 * First two arguments are passed to the callback.  Callback's return value is
 * returned.
 *
 * Usage typically looks like this:
 *
 *     { With(props.foo, (props, item = props) => <>Markup</>) }
 */
export function With<B, C>(
    props: B | null | undefined,
    cb: (props: B) => C
): C | undefined {
    if (props != null) {
        return cb(props);
    }
}

/** @deprecated */
export class IfCond extends React.Component<{ cond: boolean }> {
    override render() {
        if (this.props.cond) {
            if (this.props.children == null) return null;
            return this.props.children;
        } else return null;
    }
}

/** @deprecated */
export class IfNotCond extends React.Component<{ cond: boolean }> {
    override render() {
        if (!this.props.cond) {
            if (this.props.children == null) return null;
            return this.props.children;
        } else return null;
    }
}

/** @deprecated */
export function Compact<T>(props: { children: T }) {
    // TODO should be implemented to remove all newlines from the input
    return <>{props.children}</>;
    // const markup = renderToStaticMarkup(<>{props.children}</>);
    // return <React.Fragment dangerouslySetInnerHtml={{ __html: markup.replace(/\r|\n/g, "") }}></React.Fragment>;
}

export function isSignature(
    reflection: Reflection
): reflection is SignatureReflection {
    // return !!(reflection.kind & ReflectionKind.SomeSignature);
    return reflection instanceof SignatureReflection;
}

export function classNames(names: Record<string, boolean | null | undefined>) {
    return Object.entries(names)
        .filter(([, include]) => include)
        .map(([key]) => key)
        .join(" ");
}

export function isDeclarationReflection(
    reflection: Reflection
): reflection is DeclarationReflection {
    return reflection instanceof DeclarationReflection;
}
export function assertIsDeclarationReflection(
    reflection: Reflection
): DeclarationReflection {
    assert(reflection instanceof DeclarationReflection);
    return reflection;
}

export function isProjectReflection(
    reflection: Reflection
): reflection is ProjectReflection {
    return reflection instanceof ProjectReflection;
}

export function isReflectionType(
    type: Type | undefined
): type is ReflectionType {
    return type != null && type instanceof ReflectionType;
}
export function isReferenceType(type: Type | undefined): type is ReferenceType {
    return type != null && type instanceof ReferenceType;
}

export function isReferenceReflection(
    reflection: Reflection
): reflection is ReferenceReflection {
    return reflection != null && reflection instanceof ReferenceReflection;
}
export function hasTypeParameters<T extends Reflection>(
    reflection: T
): reflection is T & {
    typeParameters: Exclude<
        TypeParameterContainer["typeParameters"],
        undefined
    >;
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
export function isContainer(
    refl: Reflection | undefined
): refl is ContainerReflection {
    return refl != null && refl instanceof ContainerReflection;
}
