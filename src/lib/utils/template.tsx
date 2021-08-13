export { Raw, Fragment } from "./jsx";
export * as JSX from "./jsx";
import * as jsx from "./jsx";

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
    tag: typeof jsx.Fragment | keyof jsx.IntrinsicElements | jsx.Component<any>,
    props: object | null,
    ...children: jsx.Children[]
): jsx.Element {
    return { tag, props, children };
}

/** @hidden */
export namespace createElement {
    export import Fragment = jsx.Fragment;
    export import JSX = jsx;
}

export function renderElement(element: jsx.Element | null | undefined): string {
    if (!element) {
        return "";
    }

    const { tag, props, children } = element;

    if (typeof tag === "function") {
        if (tag === jsx.Raw) {
            return String((props as any).html);
        }
        return renderElement(tag(Object.assign({ children }, props)));
    }

    const html: string[] = [];

    if (tag !== jsx.Fragment) {
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
        if (tag !== jsx.Fragment) html.push(">");
        renderChildren(children);
    }

    if (tag !== jsx.Fragment) {
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

    function renderChildren(children: jsx.Children[]) {
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

/**
 * Extremely limited query function for reaching into a {@link JSX} structure
 * to find an element that's already been declared. This can be used to inject content into a page
 * after it has been created in the `page.end` hook.
 */
export function findElementById(root: jsx.Element, id: string): jsx.Element | undefined {
    const checks: jsx.Element[] = [];
    let current: jsx.Element | undefined = root;

    do {
        if (current.props && (current.props as any).id === id) {
            return current;
        }
        addChildren(current.children);
    } while ((current = checks.shift()));

    function addChildren(children: jsx.Children[]) {
        for (const child of children) {
            if (Array.isArray(child)) {
                addChildren(child);
            } else if (child && typeof child === "object") {
                checks.push(child);
            }
        }
    }
}
