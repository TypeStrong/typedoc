import MarkdownIt from "markdown-it";
// @types/markdown-it is busted, this type isn't exported with ESM.
import type md from "markdown-it" with { "resolution-mode": "require" };

import { ContextAwareRendererComponent } from "../components.js";
import { MarkdownEvent, RendererEvent, type PageEvent } from "../events.js";
import { Option, renderElement, assertNever, type ValidationOptions } from "../../utils/index.js";
import { highlight, isLoadedLanguage, isSupportedLanguage } from "../../utils/highlighter.js";
import type { BundledTheme } from "@gerrit0/mini-shiki";
import { escapeHtml } from "../../utils/html.js";
import type { DefaultThemeRenderContext, Renderer } from "../index.js";
import { anchorIcon } from "./default/partials/anchor-icon.js";
import {
    type Reflection,
    ReflectionKind,
    type CommentDisplayPart,
    type RelativeLinkDisplayPart,
} from "../../models/index.js";
import type { TranslatedString, TranslationProxy } from "../../internationalization/index.js";

/**
 * Implements markdown and relativeURL helpers for templates.
 * @internal
 */
export class MarkedPlugin extends ContextAwareRendererComponent {
    @Option("lightHighlightTheme")
    accessor lightTheme!: BundledTheme;

    @Option("darkHighlightTheme")
    accessor darkTheme!: BundledTheme;

    @Option("markdownItOptions")
    accessor markdownItOptions!: Record<string, unknown>;

    @Option("markdownLinkExternal")
    accessor markdownLinkExternal!: boolean;

    @Option("validation")
    accessor validation!: ValidationOptions;

    private parser?: MarkdownIt;

    private renderedRelativeLinks: {
        source: Reflection;
        target: Reflection;
        link: RelativeLinkDisplayPart;
    }[] = [];

    /**
     * This needing to be here really feels hacky... probably some nicer way to do this.
     * Revisit when adding support for arbitrary pages in 0.26.
     */
    private renderContext: DefaultThemeRenderContext = null!;
    private lastHeaderSlug = "";

    constructor(owner: Renderer) {
        super(owner);
        this.owner.on(MarkdownEvent.PARSE, this.onParseMarkdown.bind(this));
        this.owner.on(RendererEvent.END, this.onEnd.bind(this));
    }

    /**
     * Highlight the syntax of the given text using Shiki.
     *
     * @param text  The text that should be highlighted.
     * @param lang  The language that should be used to highlight the string.
     * @return A html string with syntax highlighting.
     */
    public getHighlighted(text: string, lang?: string): string {
        lang = lang || "typescript";
        lang = lang.toLowerCase();
        if (!isSupportedLanguage(lang)) {
            this.application.logger.warn(
                this.application.i18n.unsupported_highlight_language_0_not_highlighted_in_comment_for_1(
                    lang,
                    this.page?.model.getFriendlyFullName() ?? "(unknown)",
                ),
            );
            return text;
        }
        if (!isLoadedLanguage(lang)) {
            this.application.logger.warn(
                this.application.i18n.unloaded_language_0_not_highlighted_in_comment_for_1(
                    lang,
                    this.page?.model.getFriendlyFullName() ?? "(unknown)",
                ),
            );
            return text;
        }

        return highlight(text, lang);
    }

    /**
     * Parse the given markdown string and return the resulting html.
     *
     * @param input  The markdown string that should be parsed.
     * @returns The resulting html string.
     */
    public parseMarkdown(
        input: string | readonly CommentDisplayPart[],
        page: PageEvent<any>,
        context: DefaultThemeRenderContext,
    ) {
        let markdown = input;
        if (typeof markdown !== "string") {
            markdown = this.displayPartsToMarkdown(page, context, markdown);
        }

        this.renderContext = context;
        const event = new MarkdownEvent(page, markdown, markdown);

        this.owner.trigger(MarkdownEvent.PARSE, event);
        this.renderContext = null!;
        return event.parsedText;
    }

    private displayPartsToMarkdown(
        page: PageEvent<Reflection>,
        context: DefaultThemeRenderContext,
        parts: readonly CommentDisplayPart[],
    ): string {
        const useHtml = !!this.markdownItOptions["html"];
        const result: string[] = [];

        for (const part of parts) {
            switch (part.kind) {
                case "text":
                case "code":
                    result.push(part.text);
                    break;
                case "inline-tag":
                    switch (part.tag) {
                        case "@label":
                        case "@inheritdoc": // Shouldn't happen
                            break; // Not rendered.
                        case "@link":
                        case "@linkcode":
                        case "@linkplain": {
                            if (part.target) {
                                let url: string | undefined;
                                let kindClass: string | undefined;
                                if (typeof part.target === "string") {
                                    url = part.target;
                                } else if ("id" in part.target) {
                                    // No point in trying to resolve a ReflectionSymbolId at this point, we've already
                                    // tried and failed during the resolution step. Warnings related to those broken links
                                    // have already been emitted.
                                    url = context.urlTo(part.target);
                                    kindClass = ReflectionKind.classString(part.target.kind);

                                    // If we don't have a URL the user probably linked to some deeply nested property
                                    // which doesn't get an assigned URL. We'll walk upwards until we find a reflection
                                    // which has a URL and link to that instead.
                                    if (!url) {
                                        // Walk upwards to find something we can link to.
                                        let target = part.target.parent!;
                                        url = context.urlTo(target);
                                        while (!url && target.parent) {
                                            target = target.parent;
                                            // We know we'll always end up with a URL here eventually as the
                                            // project always has a URL.
                                            url = context.urlTo(target)!;
                                        }

                                        if (this.validation.rewrittenLink) {
                                            this.application.logger.warn(
                                                this.application.i18n.reflection_0_links_to_1_with_text_2_but_resolved_to_3(
                                                    page.model.getFriendlyFullName(),
                                                    part.target.getFriendlyFullName(),
                                                    part.text,
                                                    target.getFriendlyFullName(),
                                                ),
                                            );
                                        }
                                    }
                                }

                                if (useHtml) {
                                    const text = part.tag === "@linkcode" ? `<code>${part.text}</code>` : part.text;
                                    result.push(
                                        `<a href="${url}"${kindClass ? ` class="${kindClass}"` : ""}>${text}</a>`,
                                    );
                                } else {
                                    const text = part.tag === "@linkcode" ? "`" + part.text + "`" : part.text;
                                    result.push(`[${text}](${url})`);
                                }
                            } else {
                                result.push(part.text);
                            }
                            break;
                        }
                        default:
                            // Hmm... probably want to be able to render these somehow, so custom inline tags can be given
                            // special rendering rules. Future capability. For now, just render their text.
                            result.push(`{${part.tag} ${part.text}}`);
                            break;
                    }
                    break;
                case "relative-link":
                    switch (typeof part.target) {
                        case "number": {
                            const refl = page.project.files.resolve(part.target, page.model.project);
                            let url: string | undefined;
                            if (typeof refl === "object") {
                                url = context.urlTo(refl);
                            } else {
                                const fileName = page.project.files.getName(part.target);
                                if (fileName) {
                                    url = context.relativeURL(`media/${fileName}`);
                                }
                            }

                            if (url) {
                                if (part.targetAnchor) {
                                    url += "#" + part.targetAnchor;

                                    if (typeof refl === "object") {
                                        this.renderedRelativeLinks.push({
                                            source: this.page!.model,
                                            target: refl,
                                            link: part,
                                        });
                                    }
                                }
                                result.push(url);
                                break;
                            }
                        }
                        // fall through
                        case "undefined":
                            result.push(part.text);
                            break;
                    }
                    break;
                default:
                    assertNever(part);
            }
        }

        return result.join("");
    }

    private onEnd() {
        for (const { source, target, link } of this.renderedRelativeLinks) {
            const slugger = this.owner.theme!.getSlugger(target);
            if (!slugger.hasAnchor(link.targetAnchor!)) {
                this.application.logger.warn(
                    this.application.i18n.reflection_0_links_to_1_but_anchor_does_not_exist_try_2(
                        source.getFriendlyFullName(),
                        link.text,
                        slugger
                            .getSimilarAnchors(link.targetAnchor!)
                            .map((a) => link.text.replace(/#.*/, "#" + a))
                            .join("\n\t"),
                    ),
                );
            }
        }

        // In case we're in watch mode
        this.renderedRelativeLinks = [];
    }

    /**
     * Triggered before the renderer starts rendering a project.
     *
     * @param event  An event object describing the current render operation.
     */
    protected override onBeginRenderer(event: RendererEvent) {
        super.onBeginRenderer(event);
        this.setupParser();
    }

    private getSlugger() {
        return this.owner.theme!.getSlugger(this.page!.model);
    }

    /**
     * Creates an object with options that are passed to the markdown parser.
     *
     * @returns The options object for the markdown parser.
     */
    private setupParser() {
        this.parser = MarkdownIt({
            ...this.markdownItOptions,
            highlight: (code, lang) => {
                code = this.getHighlighted(code, lang || "ts");
                code = code.replace(/\n$/, "") + "\n";

                if (!lang) {
                    return `<pre><code>${code}</code><button>${this.application.i18n.theme_copy()}</button></pre>\n`;
                }

                return `<pre><code class="${escapeHtml(lang)}">${code}</code><button type="button">${this.application.i18n.theme_copy()}</button></pre>\n`;
            },
        });

        githubAlertMarkdownPlugin(this.parser, this.application.i18n);

        const loader = this.application.options.getValue("markdownItLoader");
        loader(this.parser);

        // Add anchor links for headings in readme, and add them to the "On this page" section
        this.parser.renderer.rules["heading_open"] = (tokens, idx) => {
            const token = tokens[idx];
            const content = getTokenTextContent(tokens[idx + 1]);
            const level = token.markup.length;

            const slug = this.getSlugger().slug(content);
            this.lastHeaderSlug = slug;

            this.page!.pageHeadings.push({
                link: `#${slug}`,
                text: content,
                level,
            });

            return `<a id="${slug}" class="tsd-anchor"></a><${token.tag} class="tsd-anchor-link">`;
        };
        this.parser.renderer.rules["heading_close"] = (tokens, idx) => {
            return `${renderElement(anchorIcon(this.renderContext, this.lastHeaderSlug))}</${tokens[idx].tag}>`;
        };

        // Rewrite anchor links inline in a readme file to links targeting the `md:` prefixed anchors
        // that TypeDoc creates.
        this.parser.renderer.rules["link_open"] = (tokens, idx, options, _env, self) => {
            const token = tokens[idx];
            const href = token.attrGet("href");
            if (href) {
                // Note: This doesn't catch @link tags to reflections as those
                // will be relative links. This will likely have to change with
                // the introduction of support for customized routers whenever
                // that becomes a real thing.
                if (
                    this.markdownLinkExternal &&
                    /https?:\/\//i.test(href) &&
                    !(href + "/").startsWith(this.hostedBaseUrl)
                ) {
                    token.attrSet("target", "_blank");
                    const classes = token.attrGet("class")?.split(" ") || [];
                    classes.push("external");
                    token.attrSet("class", classes.join(" "));
                }

                token.attrSet("href", href);
            }
            return self.renderToken(tokens, idx, options);
        };

        this.parser.renderer.rules["alert_open"] = (tokens, idx) => {
            const icon = this.renderContext.icons[tokens[idx].attrGet("icon") as AlertIconName];
            const iconHtml = renderElement(icon());

            return `<div class="${tokens[idx].attrGet("class")}"><div class="tsd-alert-title">${iconHtml}<span>${tokens[idx].attrGet("alert")}</span></div>`;
        };
    }

    /**
     * Triggered when {@link MarkedPlugin} parses a markdown string.
     *
     * @param event
     */
    onParseMarkdown(event: MarkdownEvent) {
        event.parsedText = this.parser!.render(event.parsedText);
    }
}

function getTokenTextContent(token: md.Token): string {
    if (token.children) {
        return token.children.map(getTokenTextContent).join("");
    }
    return token.content;
}

const kindNames = ["note", "tip", "important", "warning", "caution"];
const iconNames = ["alertNote", "alertTip", "alertImportant", "alertWarning", "alertCaution"] as const;
type AlertIconName = (typeof iconNames)[number];
const kindTranslations: Array<(i18n: TranslationProxy) => TranslatedString> = [
    (i18n) => i18n.alert_note(),
    (i18n) => i18n.alert_tip(),
    (i18n) => i18n.alert_important(),
    (i18n) => i18n.alert_warning(),
    (i18n) => i18n.alert_caution(),
];

function githubAlertMarkdownPlugin(md: MarkdownIt, i18n: TranslationProxy) {
    md.core.ruler.after("block", "typedoc-github-alert-plugin", (state) => {
        const bqStarts: number[] = [];

        for (let i = 0; i < state.tokens.length; ++i) {
            const token = state.tokens[i];
            if (token.type === "blockquote_open") {
                bqStarts.push(i);
            } else if (token.type === "blockquote_close") {
                if (bqStarts.length === 1) {
                    checkForAlert(state.tokens, bqStarts[0], i, i18n);
                }
                bqStarts.pop();
            }
        }
    });
}

function checkForAlert(tokens: md.Token[], start: number, end: number, i18n: TranslationProxy) {
    let alertKind = -1;

    // Search for the first "inline" token. That will be the blockquote text.
    for (let i = start; i < end; ++i) {
        if (tokens[i].type === "inline") {
            // Check for `[!NOTE]`
            const kindString = tokens[i].content.match(/^\[!(\w+)\]/);
            const kindIndex = kindNames.indexOf(kindString?.[1].toLowerCase() || "");
            if (kindIndex !== -1) {
                tokens[i].content = tokens[i].content.substring(kindString![0].length);
                alertKind = kindIndex;
            }
            break;
        }
    }

    // If we found an alert, then replace the blockquote_open and blockquote_close tokens with
    // alert_open and alert_close tokens that can be rendered specially.
    if (alertKind === -1) return;

    tokens[start].type = "alert_open";
    tokens[start].tag = "div";
    tokens[start].attrPush(["class", `tsd-alert tsd-alert-${kindNames[alertKind]}`]);
    tokens[start].attrPush(["alert", kindTranslations[alertKind](i18n)]);
    tokens[start].attrPush(["icon", iconNames[alertKind]]);

    tokens[end].type = "alert_close";
    tokens[end].tag = "div";
}
