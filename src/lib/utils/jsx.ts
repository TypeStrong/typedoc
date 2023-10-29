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
 * @module
 */

import { escapeHtml } from "./html";
import type {
    IntrinsicElements,
    JsxElement,
    JsxChildren,
    JsxComponent,
} from "./jsx.elements";
import { JsxFragment as Fragment } from "./jsx.elements";

export type {
    JsxElement as Element,
    JsxChildren as Children,
    JsxComponent,
} from "./jsx.elements";
export { JsxFragment as Fragment } from "./jsx.elements";

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
    export { IntrinsicElements, JsxElement as Element };
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
    tag: typeof Fragment | string | JsxComponent<any>,
    props: object | null,
    ...children: JsxChildren[]
): JsxElement {
    return { tag, props, children };
}

let renderPretty = true;
export function setRenderSettings(options: { pretty: boolean }) {
    renderPretty = options.pretty;
}

export const renderElement = function renderElement(
    element: JsxElement | null | undefined,
): string {
    if (!element || typeof element === "boolean") {
        return "";
    }

    const { tag, props, children } = element;

    if (typeof tag === "function") {
        if (tag === Raw) {
            return String((props as any).html);
        }
        return renderElement(tag(Object.assign({ children }, props)));
    }

    let html = "";

    if (tag !== Fragment) {
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
    }

    let hasChildren = false;
    if (children.length) {
        hasChildren = true;
        if (tag !== Fragment) html += ">";
        renderChildren(children);
    }

    if (tag !== Fragment) {
        if (!hasChildren) {
            if (voidElements.has(tag)) {
                html += "/>";
            } else {
                html += "></";
                html += tag;
                html += ">";
            }
        } else {
            html += "</";
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
};
