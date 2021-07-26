import assert = require("assert");
import * as React from "react";
import { SignatureReflection, Reflection, DeclarationReflection } from "../../..";
import { ProjectReflection, ReferenceReflection, ReferenceType, ReflectionType, Type, TypeParameterContainer } from "../../models";
import { DefaultValueContainer, TypeContainer } from "../../models/reflections/abstract";
import { MarkedPlugin } from "../plugins/MarkedPlugin";

/**
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
    if(props != null) {
        return cb(props);
    }
}

// export function IfCond<T>(props: {cond: string, children: T}) {
//     if(props.cond) return props.children;
//     else return undefined;
// }
export class IfCond extends React.Component<{ cond: boolean }> {
    override render() {
        if (this.props.cond) return this.props.children;
        else return undefined;
    }
}
export class IfNotCond extends React.Component<{ cond: boolean }> {
    override render() {
        if (!this.props.cond) return this.props.children;
        else return undefined;
    }
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            markdown: {};
            compact: {};
        }
    }
}
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

let markedPlugin: MarkedPlugin;
/**
 * HACK to bind the markedPlugin into the templates.
 * Matches the hacky nature by which the old MarkedPlugin would register itself
 * onto the Handlebars singleton.
 * TODO fix this.
 */
export function setMarkedPlugin(plugin: MarkedPlugin) {
    markedPlugin = plugin;
}
export function markdown(md: string | undefined) {
    return md ? markedPlugin.parseMarkdown(md) : '';
}
export function Markdown(props: { children: string | undefined }) {
    // TODO make a plain div, per code-review discussion
    return <mdcontainer dangerouslySetInnerHTML={{__html: markdown(props.children)}}></mdcontainer>;
}

export function relativeURL(url: string | undefined) {
    return url ? markedPlugin.getRelativeUrl(url) : url;
}
export {wbr} from '../helpers/wbr';
export {stringify} from '../helpers/stringify';

export function classNames(names: Record<string, boolean | null | undefined>) {
    return Object.entries(names).filter(([, include]) => include).map(([key]) => key).join(' ');
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
export function hasTypeParameters<T extends Reflection>(reflection: T): reflection is T & {typeParameters: Exclude<TypeParameterContainer['typeParameters'], undefined>} {
    return (reflection as TypeParameterContainer).typeParameters != null;
}
export function hasType<T extends Reflection>(reflection: T): reflection is T & {type: Exclude<TypeContainer['type'], undefined>} {
    return (reflection as TypeContainer).type != null;
}
export function hasDefaultValue<T extends Reflection>(reflection: T): reflection is T & {defaultValue: Exclude<DefaultValueContainer['defaultValue'], undefined>} {
    return (reflection as DefaultValueContainer).defaultValue != null;
}
export interface ElementTypeContainer extends Type {
    elementType: Type;
}
export function hasElementType(type: Type): type is ElementTypeContainer {
    return (type as ElementTypeContainer).elementType != null;
}

export * as __partials__ from "./partials";
