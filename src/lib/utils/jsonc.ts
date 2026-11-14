import { readFile } from "./fs.js";

/**
 * Parse JSON which may contain comments and trailing commas, as tsconfig.json,
 * typedoc.json and tsdoc.json files may.
 * @throws SyntaxError if the text is not valid JSON once comments and trailing commas are removed.
 */
export function parseJsonc(text: string): unknown {
    return JSON.parse(stripTrailingCommas(stripComments(text.replace(/^\uFEFF/, ""))));
}

/**
 * Read a JSON file which may contain comments and trailing commas, and whose root value
 * must be an object. Returns undefined if the file cannot be read or parsed.
 */
export function readJsoncFile(path: string): { config: Record<string, unknown> } | undefined {
    let config: unknown;
    try {
        config = parseJsonc(readFile(path));
    } catch {
        return undefined;
    }
    if (typeof config !== "object" || config === null || Array.isArray(config)) {
        return undefined;
    }
    return { config: config as Record<string, unknown> };
}

// Comments are replaced with spaces so that positions in JSON.parse errors stay correct.
function stripComments(text: string) {
    let result = "";
    let i = 0;
    while (i < text.length) {
        const ch = text[i];
        if (ch === '"') {
            const end = endOfString(text, i);
            result += text.slice(i, end);
            i = end;
        } else if (ch === "/" && text[i + 1] === "/") {
            let end = text.indexOf("\n", i);
            if (end === -1) end = text.length;
            result += " ".repeat(end - i);
            i = end;
        } else if (ch === "/" && text[i + 1] === "*") {
            let end = text.indexOf("*/", i + 2);
            end = end === -1 ? text.length : end + 2;
            result += text.slice(i, end).replace(/[^\r\n]/g, " ");
            i = end;
        } else {
            result += ch;
            i++;
        }
    }
    return result;
}

function stripTrailingCommas(text: string) {
    let result = "";
    let i = 0;
    while (i < text.length) {
        const ch = text[i];
        if (ch === '"') {
            const end = endOfString(text, i);
            result += text.slice(i, end);
            i = end;
        } else if (ch === ",") {
            let next = i + 1;
            while (next < text.length && /\s/.test(text[next])) next++;
            result += text[next] === "}" || text[next] === "]" ? " " : ch;
            i++;
        } else {
            result += ch;
            i++;
        }
    }
    return result;
}

function endOfString(text: string, start: number) {
    let i = start + 1;
    while (i < text.length && text[i] !== '"') {
        i += text[i] === "\\" ? 2 : 1;
    }
    return Math.min(i + 1, text.length);
}
