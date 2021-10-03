import { ok as assert } from "assert";
import { BUNDLED_LANGUAGES, getHighlighter, Highlighter, Theme } from "shiki";
import { unique, zip } from "./array";
import * as JSX from "./jsx";

const aliases = new Map<string, string>();
for (const lang of BUNDLED_LANGUAGES) {
    for (const alias of lang.aliases || []) {
        aliases.set(alias, lang.id);
    }
}

const supportedLanguages = unique(["text", ...aliases.keys(), ...BUNDLED_LANGUAGES.map((lang) => lang.id)]).sort();

class DoubleHighlighter {
    private schemes = new Map<string, string>();

    constructor(private highlighter: Highlighter, private light: Theme, private dark: Theme) {}

    highlight(code: string, lang: string) {
        const lightTokens = this.highlighter.codeToThemedTokens(code, lang, this.light, { includeExplanation: false });
        const darkTokens = this.highlighter.codeToThemedTokens(code, lang, this.dark, { includeExplanation: false });

        // If this fails... something went *very* wrong.
        assert(lightTokens.length === darkTokens.length);

        const docEls: JSX.Element[] = [];

        for (const [lightLine, darkLine] of zip(lightTokens, darkTokens)) {
            // If this fails, something also went *very* wrong.
            assert(lightLine.length === darkLine.length);

            for (const [lightToken, darkToken] of zip(lightLine, darkLine)) {
                docEls.push(<span class={this.getClass(lightToken.color, darkToken.color)}>{lightToken.content}</span>);
            }
            docEls.push(<br />);
        }

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

        style.push("body.light {");
        style.push(...lightRules);
        style.push("}", "");

        style.push("body.dark {");
        style.push(...darkRules);
        style.push("}", "");

        for (i = 0; i < this.schemes.size; i++) {
            style.push(`.hl-${i} { color: var(--hl-${i}); }`);
        }
        style.push("pre, code { background: var(--code-background); }", "");

        return style.join("\n");
    }

    private getClass(lightColor?: string, darkColor?: string): string {
        const key = `${lightColor} | ${darkColor}`;
        let scheme = this.schemes.get(key);
        if (scheme == null) {
            scheme = `hl-${this.schemes.size}`;
            this.schemes.set(key, scheme);
        }
        return scheme;
    }
}

let highlighter: DoubleHighlighter | undefined;

export async function loadHighlighter(lightTheme: Theme, darkTheme: Theme) {
    if (highlighter) return;
    const hl = await getHighlighter({ themes: [lightTheme, darkTheme] });
    highlighter = new DoubleHighlighter(hl, lightTheme, darkTheme);
}

export function isSupportedLanguage(lang: string) {
    return getSupportedLanguages().includes(lang);
}

export function getSupportedLanguages(): string[] {
    return supportedLanguages;
}

export function highlight(code: string, lang: string): string {
    assert(highlighter, "Tried to highlight with an uninitialized highlighter");
    if (!isSupportedLanguage(lang)) {
        return code;
    }

    if (lang === "text") {
        return JSX.renderElement(<>{code}</>);
    }

    return highlighter.highlight(code, aliases.get(lang) ?? lang);
}

export function getStyles(): string {
    assert(highlighter, "Tried to highlight with an uninitialized highlighter");
    return highlighter.getStyles();
}
