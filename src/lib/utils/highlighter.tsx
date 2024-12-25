import * as shiki from "@gerrit0/mini-shiki";
import type { ShikiInternal } from "@shikijs/types";
import * as JSX from "./jsx.js";
import { unique } from "./array.js";
import assert from "assert";

const aliases = new Map<string, string>();
for (const lang of shiki.bundledLanguagesInfo) {
    for (const alias of lang.aliases || []) {
        aliases.set(alias, lang.id);
    }
}

const plaintextLanguages = ["txt", "text"];

const supportedLanguages: string[] = unique([
    ...plaintextLanguages,
    ...aliases.keys(),
    ...shiki.bundledLanguagesInfo.map((lang) => lang.id),
]).sort();

const supportedThemes: string[] = Object.keys(shiki.bundledThemes);

class DoubleHighlighter {
    private schemes = new Map<string, string>();

    constructor(
        private highlighter: ShikiInternal,
        private light: shiki.BundledTheme,
        private dark: shiki.BundledTheme,
    ) {}

    supports(lang: string) {
        return this.highlighter.getLoadedLanguages().includes(lang);
    }

    highlight(code: string, lang: string) {
        const tokens = shiki.codeToTokensWithThemes(this.highlighter, code, {
            themes: { light: this.light, dark: this.dark },
            lang: lang as shiki.BundledLanguage,
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

    private getClass(variants: Record<string, shiki.TokenStyles>): string {
        const key = `${variants["light"].color} | ${variants["dark"].color}`;
        let scheme = this.schemes.get(key);
        if (scheme == null) {
            scheme = `hl-${this.schemes.size}`;
            this.schemes.set(key, scheme);
        }
        return scheme;
    }
}

let shikiEngine: shiki.RegexEngine | undefined;
let highlighter: DoubleHighlighter | undefined;
let ignoredLanguages: string[] | undefined;

export async function loadHighlighter(
    lightTheme: shiki.BundledTheme,
    darkTheme: shiki.BundledTheme,
    langs: shiki.BundledLanguage[],
    ignoredLangs: string[] | undefined,
) {
    if (highlighter) return;

    ignoredLanguages = ignoredLangs;

    if (!shikiEngine) {
        await shiki.loadBuiltinWasm();
        shikiEngine = await shiki.createOnigurumaEngine();
    }

    const hl = await shiki.createShikiInternal({
        engine: shikiEngine,
        themes: [shiki.bundledThemes[lightTheme], shiki.bundledThemes[darkTheme]],
        langs: langs.map((lang) => shiki.bundledLanguages[lang]),
    });
    highlighter = new DoubleHighlighter(hl, lightTheme, darkTheme);
}

export function isSupportedLanguage(lang: string) {
    return ignoredLanguages?.includes(lang) || getSupportedLanguages().includes(lang);
}

export function getSupportedLanguages(): string[] {
    return supportedLanguages;
}

export function getSupportedThemes(): string[] {
    return supportedThemes;
}

export function isLoadedLanguage(lang: string): boolean {
    return (
        plaintextLanguages.includes(lang) || ignoredLanguages?.includes(lang) || highlighter?.supports(lang) || false
    );
}

export function highlight(code: string, lang: string): string {
    assert(highlighter, "Tried to highlight with an uninitialized highlighter");

    if (plaintextLanguages.includes(lang) || ignoredLanguages?.includes(lang)) {
        return JSX.renderElement(<>{code}</>);
    }

    return highlighter.highlight(code, aliases.get(lang) ?? lang);
}

export function getStyles(): string {
    assert(highlighter, "Tried to highlight with an uninitialized highlighter");
    return highlighter.getStyles();
}
