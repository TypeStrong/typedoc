/**
 * Custom JSX module designed specifically for TypeDoc's needs.
 * When overriding a default TypeDoc theme output, your implementation must create valid {@link Element}
 * instances, which can be most easily done by using TypeDoc's JSX implementation. To use it, set up
 * your tsconfig with the following compiler options:
 * ```json
 * {
 *     "jsx": "react",
 *     "jsxFactory": "JSX.createElement",
 *     "jsxFragmentFactory": "JSX.Fragment"
 * }
 * ```
 * @summary Custom JSX module designed specifically for TypeDoc's needs.
 * @module
 */

import { escapeHtml } from "./html.js";
import type {
    IntrinsicElements,
    JsxElement,
    JsxChildren,
    JsxComponent,
    JsxHtmlGlobalProps,
} from "./jsx.elements.js";
import { JsxFragment } from "./jsx.elements.js";

export type {
    JsxElement as Element,
    JsxChildren as Children,
    JsxComponent,
} from "./jsx.elements.js";
export { JsxFragment as Fragment } from "./jsx.elements.js";

/**
 * Used to inject HTML directly into the document.
 */
export function Raw(_props: { html: string }) {
    // This is handled specially by the renderElement function. Instead of being
    // called, the tag is compared to this function and the `html` prop will be
    // returned directly.
    return null;
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
    export {
        IntrinsicElements,
        JsxElement as Element,
        JsxHtmlGlobalProps as IntrinsicAttributes,
    };
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

const blockElements = new Set([
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "div",
    "section",
    "nav",
    "details",
    "p",
    "ul",
    "ol",
    "li",
]);

/**
 * JSX factory function to create an "element" that can later be rendered with {@link renderElement}
 * @param tag
 * @param props
 * @param children
 */
export function createElement(
    tag: string | JsxComponent<any>,
    props: object | null,
    ...children: JsxChildren[]
): JsxElement {
    return { tag, props, children };
}

let renderPretty = true;
export function setRenderSettings(options: { pretty: boolean }) {
    renderPretty = options.pretty;
}

export function renderElement(element: JsxElement | null | undefined): string {
    if (!element || typeof element === "boolean") {
        return "";
    }

    const { tag, props, children } = element;
    let html = "";

    if (typeof tag === "function") {
        if (tag === Raw) {
            return String((props as any).html);
        }
        if (tag === JsxFragment) {
            renderChildren(children);
            return html;
        }
        return renderElement(tag(Object.assign({ children }, props)));
    }

    if (blockElements.has(tag) && renderPretty && html) {
        html += "\n";
    }
    html += "<";
    html += tag;

    for (const [key, val] of Object.entries(props ?? {})) {
        if (val == null) continue;

        if (typeof val == "boolean") {
            if (val) {
                html += " ";
                html += key;
            }
        } else {
            html += " ";
            html += key;
            html += '="';
            html += (
                typeof val === "string" ? val : JSON.stringify(val)
            ).replaceAll('"', "&quot;");
            html += '"';
        }
    }

    if (children.length) {
        html += ">";
        renderChildren(children);
        html += "</";
        html += tag;
        html += ">";
    } else {
        if (voidElements.has(tag)) {
            html += "/>";
        } else {
            html += "></";
            html += tag;
            html += ">";
        }
    }

    return html;

    function renderChildren(children: JsxChildren[]) {
        for (const child of children) {
            if (!child) continue;

            if (Array.isArray(child)) {
                renderChildren(child);
            } else if (typeof child === "string" || typeof child === "number") {
                html += escapeHtml(child.toString());
            } else {
                html += renderElement(child);
            }
        }
    }
}

/**
 * Render an element to text, stripping out any HTML tags.
 * This is roughly equivalent to getting `innerText` on a rendered element.
 * @internal
 */
export function renderElementToText(element: JsxElement | null | undefined) {
    if (!element || typeof element === "boolean") {
        return "";
    }

    const { tag, props, children } = element;
    let html = "";

    if (typeof tag === "function") {
        if (tag === Raw) {
            return String((props as any).html);
        }
        if (tag === JsxFragment) {
            renderChildren(children);
            return html;
        }
        return renderElementToText(tag(Object.assign({ children }, props)));
    } else if (tag === "br") {
        return "\n";
    }

    renderChildren(children);
    return html;

    function renderChildren(children: JsxChildren[]) {
        for (const child of children) {
            if (!child) continue;

            if (Array.isArray(child)) {
                renderChildren(child);
            } else if (typeof child === "string" || typeof child === "number") {
                html += child.toString().replaceAll("\u00A0", " ");
            } else {
                html += renderElementToText(child);
            }
        }
    }
}
