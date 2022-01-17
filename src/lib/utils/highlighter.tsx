import { ok as assert } from "assert";
import { BUNDLED_LANGUAGES, getHighlighter, Highlighter, Theme } from "shiki";
import { unique } from "./array";
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

        const docEls: JSX.Element[][] = [];

        for (let line = 0; line < lightTokens.length; line++) {
            const lightLine = lightTokens[line];
            const darkLine = darkTokens[line];

            // Different themes can have different grammars... so unfortunately we have to deal with different
            // sets of tokens.Example: light_plus and dark_plus tokenize " = " differently in the `schemes`
            // declaration for this file.

            const lineEls: JSX.Element[] = [];

            while (lightLine.length && darkLine.length) {
                // Simple case, same token.
                if (lightLine[0].content === darkLine[0].content) {
                    lineEls.push(
                        <span class={this.getClass(lightLine[0].color, darkLine[0].color)}>{lightLine[0].content}</span>
                    );
                    lightLine.shift();
                    darkLine.shift();
                    continue;
                }

                if (lightLine[0].content.length < darkLine[0].content.length) {
                    lineEls.push(
                        <span class={this.getClass(lightLine[0].color, darkLine[0].color)}>{lightLine[0].content}</span>
                    );
                    darkLine[0].content = darkLine[0].content.substr(lightLine[0].content.length);
                    lightLine.shift();
                    continue;
                }

                lineEls.push(
                    <span class={this.getClass(lightLine[0].color, darkLine[0].color)}>{darkLine[0].content}</span>
                );
                lightLine[0].content = lightLine[0].content.substr(darkLine[0].content.length);
                darkLine.shift();
            }

            if (line + 1 !== lightTokens.length) {
                lineEls.push(<br />);
            }
            docEls.push(lineEls);
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

        // GH#1836, our page background is white, but it would be nice to be able to see
        // a difference between the code blocks and the background of the page. There's
        // probably a better solution to this... revisit once #1794 is merged.
        let lightBackground = this.highlighter.getTheme(this.light).bg;
        if (isWhite(lightBackground)) {
            lightBackground = "#F5F5F5";
        }

        style.push(`    --light-code-background: ${lightBackground};`);
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

function isWhite(color: string) {
    const colors = new Set(color.toLowerCase().replace(/[^a-f0-9]/g, ""));
    return colors.size === 1 && colors.has("f");
}
