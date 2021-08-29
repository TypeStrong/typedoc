/**
 * Custom JSX module designed specifically for TypeDoc's needs.
 * When overriding a default TypeDoc theme output, your implementation must create valid {@link Element}
 * instances, which can be most easily done by using TypeDoc's JSX implementation. To use it, set up
 * your tsconfig with the following compiler options:
 * ```json
 * {
 *     "jsx": "react",
 *     "jsxFactory": "JSX.createElement",
 *     "jsxFragmentFactory": "JSX.Fragment",
 *     "jsxImportSource": "typedoc"
 * }
 * ```
 * @module
 */

/// <reference lib="dom" />

import type { KeysOfType, WritableKeys } from "./general";

export const Fragment = Symbol();

/**
 * Used to inject HTML directly into the document.
 */
export function Raw(_props: { html: string }) {
    // This is handled specially by the renderElement function. Instead of being
    // called, the tag is compared to this function and the `html` prop will be
    // returned directly.
    return null;
}

export type Children =
    | Element
    | string
    | number
    | null
    | undefined
    | Children[];

export type Component<P> = (props: P) => Element | null | undefined;

// Setting these doesn't make sense.
type BannedElementKeys =
    | "dataset"
    | "innerHTML" // use Raw
    | "outerHTML"
    | "innerHTML"
    | "innerText"
    | "textContent"
    | "style";

interface RemapKeys {
    className: "class";
    htmlFor: "for";
    httpEquiv: "http-equiv";
}

type ElementKeys<T> = Exclude<
    WritableKeys<T>,
    BannedElementKeys | KeysOfType<T, Function>
>;

type BasicHtmlElements = {
    [K in keyof HTMLElementTagNameMap]: {
        [K2 in ElementKeys<
            HTMLElementTagNameMap[K]
        > as K2 extends keyof RemapKeys
            ? RemapKeys[K2]
            : K2]?: K2 extends "children"
            ? Children
            : HTMLElementTagNameMap[K][K2];
    } & {
        style?: string; // This should go away.
    } & (K extends "meta" ? { charSet?: string } : unknown);
};

/** @hidden */
export interface IntrinsicElements extends BasicHtmlElements {}

export interface Element {
    tag: typeof Fragment | string | Component<any>;
    props: object | null;
    children: Children[];
}

/**
 * TypeScript's rules for looking up the JSX.IntrinsicElements and JSX.Element
 * interfaces are incredibly strange. It will find them if they are included as
 * a namespace under the createElement function, or globally, or, apparently, if
 * a JSX namespace is declared at the same scope as the factory function.
 * Hide this in the docs, hopefully someday TypeScript improves this and allows
 * looking adjacent to the factory function and we can get rid of this phantom namespace.
 * @hidden
 */
export declare namespace JSX {
    export { IntrinsicElements, Element };
}

function escapeHtml(html: string) {
    return html.replace(
        /[&<>'"]/g,
        (c) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            }[c as never])
    );
}

const voidElements = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
]);

/**
 * JSX factory function to create an "element" that can later be rendered with {@link renderElement}
 * @param tag
 * @param props
 * @param children
 */
export function createElement(
    tag: typeof Fragment | string | Component<any>,
    props: object | null,
    ...children: Children[]
): Element {
    return { tag, props, children };
}

export function renderElement(element: Element | null | undefined): string {
    if (!element) {
        return "";
    }

    const { tag, props, children } = element;

    if (typeof tag === "function") {
        if (tag === Raw) {
            return String((props as any).html);
        }
        return renderElement(tag(Object.assign({ children }, props)));
    }

    const html: string[] = [];

    if (tag !== Fragment) {
        html.push("<", tag);

        for (const [key, val] of Object.entries(props ?? {})) {
            if (val == null) continue;

            if (typeof val == "boolean") {
                if (val) {
                    html.push(" ", key);
                }
            } else {
                html.push(" ", key, "=", JSON.stringify(val));
            }
        }
    }

    let hasChildren = false;
    if (children.length) {
        hasChildren = true;
        if (tag !== Fragment) html.push(">");
        renderChildren(children);
    }

    if (tag !== Fragment) {
        if (!hasChildren) {
            if (voidElements.has(tag)) {
                html.push("/>");
            } else {
                html.push("></", tag, ">");
            }
        } else {
            html.push("</", tag, ">");
        }
    }

    return html.join("");

    function renderChildren(children: Children[]) {
        for (const child of children) {
            if (!child) continue;

            if (Array.isArray(child)) {
                renderChildren(child);
            } else if (typeof child === "string" || typeof child === "number") {
                html.push(escapeHtml(child.toString()));
            } else {
                html.push(renderElement(child));
            }
        }
    }
}
