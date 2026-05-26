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

import type { IntrinsicElements, JsxChildren, JsxComponent, JsxElement, JsxHtmlGlobalProps } from "./jsx.elements.js";
import { JsxFragment } from "./jsx.elements.js";
import { escapeHtml } from "./string.js";

export type { JsxChildren as Children, JsxComponent, JsxElement as Element } from "./jsx.elements.js";
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
    export { IntrinsicElements, JsxElement as Element, JsxHtmlGlobalProps as IntrinsicAttributes };
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
    if (!element) {
        return "";
    }
    const buf: string[] = [];
    renderInto(buf, element);
    return buf.join("");
}

/**
 * Recursive worker for {@link renderElement}. Writes into a shared
 * `string[]` buffer instead of accumulating per-call strings, which
 * avoids the O(n^2) allocation cost of repeated `+=` on immutable
 * strings during deeply nested JSX renders.
 */
function renderInto(buf: string[], element: JsxElement | null | undefined): void {
    if (!element) {
        return;
    }

    const { tag, props, children } = element;

    if (typeof tag === "function") {
        if (tag === Raw) {
            buf.push(String((props as any).html));
            return;
        }
        if (tag === JsxFragment) {
            renderChildrenInto(buf, children);
            return;
        }
        renderInto(buf, tag(Object.assign({ children }, props)));
        return;
    }

    // NOTE: The original implementation gated this on a local `html` string
    // that was always `""` at this point, so this newline insertion was
    // effectively dead code. We preserve byte-identical output by gating on
    // a captured entry-length sentinel, which is likewise always equal to
    // `buf.length` at this point. Existing snapshot and unit tests (e.g.
    // "Supports fragments") would break if this check actually fired.
    const startLen = buf.length;
    if (blockElements.has(tag) && renderPretty && buf.length > startLen) {
        buf.push("\n");
    }
    buf.push("<", tag);

    for (const [key, val] of Object.entries(props ?? {})) {
        if (val == null) continue;

        if (typeof val === "boolean") {
            if (val) {
                buf.push(" ", key);
            }
        } else {
            const stringified = typeof val === "string" ? val : JSON.stringify(val);
            buf.push(" ", key, '="', stringified.replaceAll('"', "&quot;"), '"');
        }
    }

    if (children.length) {
        buf.push(">");
        renderChildrenInto(buf, children);
        buf.push("</", tag, ">");
    } else if (voidElements.has(tag)) {
        buf.push("/>");
    } else {
        buf.push("></", tag, ">");
    }
}

function renderChildrenInto(buf: string[], children: JsxChildren[]): void {
    for (const child of children) {
        if (typeof child === "boolean") continue;

        if (Array.isArray(child)) {
            renderChildrenInto(buf, child);
        } else if (
            typeof child === "string" ||
            typeof child === "number" ||
            typeof child === "bigint"
        ) {
            buf.push(escapeHtml(child.toString()));
        } else {
            renderInto(buf, child);
        }
    }
}

/**
 * Render an element to text, stripping out any HTML tags.
 * This is roughly equivalent to getting `innerText` on a rendered element.
 * @internal
 */
export function renderElementToText(element: JsxElement | null | undefined): string {
    if (!element) {
        return "";
    }
    const buf: string[] = [];
    renderTextInto(buf, element);
    return buf.join("");
}

/**
 * Recursive worker for {@link renderElementToText}. Strips tags and writes
 * text into a shared `string[]` buffer to avoid per-call allocation.
 */
function renderTextInto(buf: string[], element: JsxElement | null | undefined): void {
    if (!element) {
        return;
    }

    const { tag, props, children } = element;

    if (typeof tag === "function") {
        if (tag === Raw) {
            buf.push(String((props as any).html));
            return;
        }
        if (tag === JsxFragment) {
            renderTextChildrenInto(buf, children);
            return;
        }
        renderTextInto(buf, tag(Object.assign({ children }, props)));
        return;
    } else if (tag === "br") {
        buf.push("\n");
        return;
    }

    renderTextChildrenInto(buf, children);
}

function renderTextChildrenInto(buf: string[], children: JsxChildren[]): void {
    for (const child of children) {
        if (typeof child === "boolean") continue;

        if (Array.isArray(child)) {
            renderTextChildrenInto(buf, child);
        } else if (
            typeof child === "string" ||
            typeof child === "number" ||
            typeof child === "bigint"
        ) {
            // Turn non-breaking spaces into regular spaces
            buf.push(child.toString().replaceAll("\u00A0", " "));
        } else {
            renderTextInto(buf, child);
        }
    }
}
