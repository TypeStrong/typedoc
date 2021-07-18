import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SignatureReflection, Reflection, ReflectionKind } from "../../../..";

/**
 * Helper created solely to make it easier to find-and-replace refactor
 * all handlebars {{#with}} blocks into JSX.
 *
 * First two arguments are passed to the callback.  Callback's return value is
 * returned.
 *
 * Usage typically looks like this:
 *
 *     { With(props, props.foo, (superProps, props, item = props) => <>Markup</>) }
 */
export function With<A, B, C>(
    superProps: A,
    props: B,
    cb: (superProps: A, props: B) => C
): C {
    return cb(superProps, props);
}

// export function IfCond<T>(props: {cond: string, children: T}) {
//     if(props.cond) return props.children;
//     else return undefined;
// }
export class IfCond extends React.Component<{ cond: boolean }> {
    render() {
        if (this.props.cond) return this.props.children;
        else return undefined;
    }
}
export class IfNotCond extends React.Component<{ cond: boolean }> {
    render() {
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
export function markdown(text: string) {
    return <>{text}</>;
}
export function Markdown(props: { children: string | undefined }) {
    return <>{props.children}</>;
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
    return !!(reflection.kind & ReflectionKind.SomeSignature);
}

export function relativeURL(url: string) {
    return url ? this.getRelativeUrl(url) : url;
}
export function wbr(TODO) {
    return TODO;
}

export { __partials__ } from "./partials";
