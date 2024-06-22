import { ok as assert, ok } from "assert";
import type {
    BundledLanguage,
    BundledTheme,
    Highlighter,
    TokenStyles,
} from "shiki" with { "resolution-mode": "import" };
import * as JSX from "./jsx";
import { unique } from "./array";

const aliases = new Map<string, string>();
let supportedLanguagesWithoutAliases: string[] = [];
let supportedLanguages: string[] = [];
let supportedThemes: string[] = [];

export async function loadShikiMetadata() {
    if (aliases.size) return;

    const shiki = await import("shiki");
    for (const lang of shiki.bundledLanguagesInfo) {
        for (const alias of lang.aliases || []) {
            aliases.set(alias, lang.id);
        }
    }

    supportedLanguages = unique([
        "text",
        ...aliases.keys(),
        ...shiki.bundledLanguagesInfo.map((lang) => lang.id),
    ]).sort();

    supportedLanguagesWithoutAliases = unique(["text", ...shiki.bundledLanguagesInfo.map((lang) => lang.id)]);

    supportedThemes = Object.keys(shiki.bundledThemes);
}

class DoubleHighlighter {
    private schemes = new Map<string, string>();

    constructor(
        private highlighter: Highlighter,
        private light: BundledTheme,
        private dark: BundledTheme,
    ) {}

    supports(lang: string) {
        return this.highlighter.getLoadedLanguages().includes(lang);
    }

    highlight(code: string, lang: string) {
        const tokens = this.highlighter.codeToTokensWithThemes(code, {
            themes: { light: this.light, dark: this.dark },
            lang: lang as BundledLanguage,
        });

        const docEls: JSX.Element[] = [];

        for (const line of tokens) {
            for (const token of line) {
                docEls.push(<span class={this.getClass(token.variants)}>{token.content}</span>);
            }

            docEls.push(<br />);
        }

        docEls.pop(); // Remove last <br>
        docEls.pop(); // Remove last <br>

        return JSX.renderElement(<>{docEls}</>);
    }

    getStyles() {
        const style: string[] = [":root {"];
        const lightRules: string[] = [];
        const darkRules: string[] = [];

        let i = 0;
        for (const key of this.schemes.keys()) {
            const [light, dark] = key.split(" | ");

            style.push(`    --light-hl-${i}: ${light};`);
            style.push(`    --dark-hl-${i}: ${dark};`);
            lightRules.push(`    --hl-${i}: var(--light-hl-${i});`);
            darkRules.push(`    --hl-${i}: var(--dark-hl-${i});`);
            i++;
        }

        style.push(`    --light-code-background: ${this.highlighter.getTheme(this.light).bg};`);
        style.push(`    --dark-code-background: ${this.highlighter.getTheme(this.dark).bg};`);
        lightRules.push(`    --code-background: var(--light-code-background);`);
        darkRules.push(`    --code-background: var(--dark-code-background);`);

        style.push("}", "");

        style.push("@media (prefers-color-scheme: light) { :root {");
        style.push(...lightRules);
        style.push("} }", "");

        style.push("@media (prefers-color-scheme: dark) { :root {");
        style.push(...darkRules);
        style.push("} }", "");

        style.push(":root[data-theme='light'] {");
        style.push(...lightRules);
        style.push("}", "");

        style.push(":root[data-theme='dark'] {");
        style.push(...darkRules);
        style.push("}", "");

        for (i = 0; i < this.schemes.size; i++) {
            style.push(`.hl-${i} { color: var(--hl-${i}); }`);
        }
        style.push("pre, code { background: var(--code-background); }", "");

        return style.join("\n");
    }

    private getClass(variants: Record<string, TokenStyles>): string {
        const key = `${variants["light"].color} | ${variants["dark"].color}`;
        let scheme = this.schemes.get(key);
        if (scheme == null) {
            scheme = `hl-${this.schemes.size}`;
            this.schemes.set(key, scheme);
        }
        return scheme;
    }
}

let highlighter: DoubleHighlighter | undefined;

export async function loadHighlighter(lightTheme: BundledTheme, darkTheme: BundledTheme, langs: BundledLanguage[]) {
    if (highlighter) return;

    const shiki = await import("shiki");
    const hl = await shiki.createHighlighter({ themes: [lightTheme, darkTheme], langs });
    highlighter = new DoubleHighlighter(hl, lightTheme, darkTheme);
}

export function isSupportedLanguage(lang: string) {
    return getSupportedLanguages().includes(lang);
}

export function getSupportedLanguages(): string[] {
    ok(supportedLanguages.length > 0, "loadShikiMetadata has not been called");
    return supportedLanguages;
}

export function getSupportedLanguagesWithoutAliases(): string[] {
    ok(supportedLanguagesWithoutAliases.length > 0, "loadShikiMetadata has not been called");
    return supportedLanguages;
}

export function getSupportedThemes(): string[] {
    ok(supportedThemes.length > 0, "loadShikiMetadata has not been called");
    return supportedThemes;
}

export function isLoadedLanguage(lang: string): boolean {
    return highlighter?.supports(lang) ?? false;
}

export function highlight(code: string, lang: string): string {
    assert(highlighter, "Tried to highlight with an uninitialized highlighter");

    if (lang === "text") {
        return JSX.renderElement(<>{code}</>);
    }

    return highlighter.highlight(code, aliases.get(lang) ?? lang);
}

export function getStyles(): string {
    assert(highlighter, "Tried to highlight with an uninitialized highlighter");
    return highlighter.getStyles();
}
