import { ok as assert } from "assert";
import * as shiki from "shiki";
import { unique } from "./array";

type MapKey = [string, string[] | undefined];
type RMapKey = [string, string];

function rM_zipIdWithAliases(bl: shiki.ILanguageRegistration): MapKey {
    return [bl.id, bl.aliases];
}

function rM_nonEmptyRow(row: MapKey): boolean {
    return Boolean(row[1]); // row is empty if second element of a mapkey (aliases) is undefined
}

function rM_remapAliasToId([base, al]: MapKey): RMapKey[] {
    return (al || []).map((a) => [a, base]);
}

const reverseMapping: RMapKey[][] = [
    [["text", "text"]],
    ...shiki.BUNDLED_LANGUAGES.map(rM_zipIdWithAliases)
        .filter(rM_nonEmptyRow)
        .map(rM_remapAliasToId),
];

const aliases = new Map<string, string>(reverseMapping.flat());

const supportedLanguages = unique([
    "text",
    ...aliases.keys(),
    ...shiki.BUNDLED_LANGUAGES.map((lang) => lang.id),
]).sort();

let highlighter: shiki.Highlighter | undefined;

export async function loadHighlighter(theme: shiki.Theme) {
    if (highlighter) return;
    highlighter = await shiki.getHighlighter({ theme });
}

export function isSupportedLanguage(lang: string) {
    return getSupportedLanguages().includes(lang);
}

export function getSupportedLanguages(): string[] {
    return supportedLanguages;
}

export function highlight(
    code: string,
    lang: string,
    theme: shiki.Theme
): string {
    assert(highlighter, "Tried to highlight with an uninitialized highlighter");
    if (!isSupportedLanguage(lang)) {
        return code;
    }

    if (lang === "text") {
        return escapeHtml(code);
    }

    lang = aliases.get(lang) ?? lang;

    const result: string[] = [];
    for (const line of highlighter.codeToThemedTokens(code, lang, theme, {
        includeExplanation: false,
    })) {
        for (const token of line) {
            result.push(
                `<span style="color: ${token.color ?? "#000"}">`,
                escapeHtml(token.content),
                "</span>"
            );
        }
        result.push("\n");
    }
    return result.join("");
}

function escapeHtml(text: string) {
    return text.replace(
        /[&<>"']/g,
        (match) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;",
            }[match as never])
    );
}
