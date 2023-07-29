// There is a fixed list of named character references which will not be expanded in the future.
// This json file is based on https://html.spec.whatwg.org/multipage/named-characters.html#named-character-references
// with some modifications to reduce the file size of the original JSON since we just need.
import htmlEntities from "./html-entities.json";

// Three cases:
// &#123; - numeric escape
// &#x12; - hex escape
// &amp; - named escape
function unescapeEntities(html: string) {
    return html.replace(
        /&(#(?:\d+);?|(?:#[xX][0-9A-Fa-f]+);?|(?:\w+);?)/g,
        (_, n) => {
            if (n[0] === "#") {
                return String.fromCharCode(
                    n[1] === "x" || n[1] === "X"
                        ? parseInt(n.substring(2), 16)
                        : parseInt(n.substring(1), 10),
                );
            }
            return htmlEntities[n as never] || "";
        },
    );
}

export function getTextContent(text: string) {
    return unescapeEntities(text.replace(/<.*?(?:>|$)/g, ""));
}

const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};

export function escapeHtml(html: string) {
    return html.replace(/[&<>'"]/g, (c) => htmlEscapes[c as never]);
}
