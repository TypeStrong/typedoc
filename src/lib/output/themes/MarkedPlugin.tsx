import markdown from "markdown-it";

import { Component, ContextAwareRendererComponent } from "../components";
import { type RendererEvent, MarkdownEvent, type PageEvent } from "../events";
import { Option, type Logger, renderElement, assertNever } from "../../utils";
import { highlight, isLoadedLanguage, isSupportedLanguage } from "../../utils/highlighter";
import type { BundledTheme } from "shiki" with { "resolution-mode": "import" };
import { escapeHtml } from "../../utils/html";
import type { DefaultTheme } from "..";
import { Slugger } from "./default/DefaultTheme";
import { anchorIcon } from "./default/partials/anchor-icon";
import type { DefaultThemeRenderContext } from "..";
import { ReflectionKind, type CommentDisplayPart } from "../../models";

let defaultSlugger: Slugger | undefined;
function getDefaultSlugger(logger: Logger) {
    if (!defaultSlugger) {
        logger.warn(logger.i18n.custom_theme_does_not_define_getSlugger());
        defaultSlugger = new Slugger();
    }
    return defaultSlugger;
}

/**
 * Implements markdown and relativeURL helpers for templates.
 * @internal
 */
@Component({ name: "marked" })
export class MarkedPlugin extends ContextAwareRendererComponent {
    @Option("lightHighlightTheme")
    accessor lightTheme!: BundledTheme;

    @Option("darkHighlightTheme")
    accessor darkTheme!: BundledTheme;

    @Option("markdownItOptions")
    accessor markdownItOptions!: Record<string, unknown>;

    private parser?: markdown;

    /**
     * This needing to be here really feels hacky... probably some nicer way to do this.
     * Revisit when adding support for arbitrary pages in 0.26.
     */
    private renderContext: DefaultThemeRenderContext = null!;
    private lastHeaderSlug = "";

    /**
     * Create a new MarkedPlugin instance.
     */
    override initialize() {
        super.initialize();
        this.owner.on(MarkdownEvent.PARSE, this.onParseMarkdown.bind(this));
    }

    /**
     * Highlight the syntax of the given text using HighlightJS.
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
        page: PageEvent<any>,
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
                                    // tried and failed during the resolution step.
                                    url = context.urlTo(part.target);
                                    kindClass = ReflectionKind.classString(part.target.kind);
                                }

                                if (useHtml) {
                                    const text = part.tag === "@linkcode" ? `<code>${part.text}</code>` : part.text;
                                    result.push(
                                        url
                                            ? `<a href="${url}"${kindClass ? ` class="${kindClass}"` : ""}>${text}</a>`
                                            : part.text,
                                    );
                                } else {
                                    const text = part.tag === "@linkcode" ? "`" + part.text + "`" : part.text;
                                    result.push(url ? `[${text}](${url})` : text);
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
                            const refl = page.project.files.resolve(part.target);
                            if (typeof refl === "object") {
                                result.push(context.urlTo(refl));
                                break;
                            }

                            const fileName = page.project.files.getName(part.target);
                            if (fileName) {
                                result.push(context.relativeURL(`media/${fileName}`));
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
        if ("getSlugger" in this.owner.theme!) {
            return (this.owner.theme as DefaultTheme).getSlugger(this.page!.model);
        }
        return getDefaultSlugger(this.application.logger);
    }

    /**
     * Creates an object with options that are passed to the markdown parser.
     *
     * @returns The options object for the markdown parser.
     */
    private setupParser() {
        this.parser = markdown({
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

        const loader = this.application.options.getValue("markdownItLoader");
        loader(this.parser);

        // Add anchor links for headings in readme, and add them to the "On this page" section
        this.parser.renderer.rules["heading_open"] = (tokens, idx) => {
            const token = tokens[idx];
            const content = getTokenTextContent(tokens[idx + 1]);
            const level = token.markup.length;

            const slug = this.getSlugger().slug(content);
            this.lastHeaderSlug = slug;

            // Prefix the slug with an extra `md:` to prevent conflicts with TypeDoc's anchors.
            this.page!.pageHeadings.push({
                link: `#md:${slug}`,
                text: content,
                level,
            });

            return `<a id="md:${slug}" class="tsd-anchor"></a><${token.tag} class="tsd-anchor-link">`;
        };
        this.parser.renderer.rules["heading_close"] = (tokens, idx) => {
            return `${renderElement(anchorIcon(this.renderContext, `md:${this.lastHeaderSlug}`))}</${tokens[idx].tag}>`;
        };

        // Rewrite anchor links inline in a readme file to links targeting the `md:` prefixed anchors
        // that TypeDoc creates.
        this.parser.renderer.rules["link_open"] = (tokens, idx, options, _env, self) => {
            const token = tokens[idx];
            const href = token.attrGet("href")?.replace(/^#(?:md:)?(.+)/, "#md:$1");
            if (href) {
                token.attrSet("href", href);
            }
            return self.renderToken(tokens, idx, options);
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

function getTokenTextContent(token: markdown.Token): string {
    if (token.children) {
        return token.children.map(getTokenTextContent).join("");
    }
    return token.content;
}
