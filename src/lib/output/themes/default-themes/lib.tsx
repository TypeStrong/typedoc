import * as React from "react";
import { SignatureReflection, Reflection } from "../../../..";

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
    // return !!(reflection.kind & ReflectionKind.SomeSignature);
    return reflection instanceof SignatureReflection;
}

export function relativeURL(url: string | undefined) {
    return url ? this.getRelativeUrl(url) : url;
}
export {wbr} from '../../helpers/wbr';
export {stringify} from '../../helpers/stringify';

export function classNames(names: Record<string, boolean | null | undefined>) {
    return Object.entries(names).filter(([, include]) => include).map(([key]) => key).join(' ');
}

export { __partials__ } from "./partials";
