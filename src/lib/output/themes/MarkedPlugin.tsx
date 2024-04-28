import * as fs from "fs";
import * as Path from "path";
import markdown from "markdown-it";

import { Component, ContextAwareRendererComponent } from "../components";
import { type RendererEvent, MarkdownEvent, type PageEvent } from "../events";
import { Option, readFile, copySync, isFile, type Logger } from "../../utils";
import { highlight, isSupportedLanguage } from "../../utils/highlighter";
import type { Theme } from "shiki";
import { escapeHtml, getTextContent } from "../../utils/html";
import type { DefaultTheme } from "..";
import { Slugger } from "./default/DefaultTheme";

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
    @Option("includes")
    accessor includeSource!: string;

    @Option("media")
    accessor mediaSource!: string;

    @Option("lightHighlightTheme")
    accessor lightTheme!: Theme;

    @Option("darkHighlightTheme")
    accessor darkTheme!: Theme;

    private parser?: MarkdownIt;

    /**
     * The path referenced files are located in.
     */
    private includes?: string;

    /**
     * Path to the output media directory.
     */
    private mediaDirectory?: string;

    /**
     * The pattern used to find references in markdown.
     */
    private includePattern = /\[\[include:([^\]]+?)\]\]/g;

    /**
     * The pattern used to find media links.
     */
    private mediaPattern = /media:\/\/([^ ")\]}]+)/g;

    /**
     * Create a new MarkedPlugin instance.
     */
    override initialize() {
        super.initialize();
        this.listenTo(this.owner, MarkdownEvent.PARSE, this.onParseMarkdown);
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

        return highlight(text, lang);
    }

    /**
     * Parse the given markdown string and return the resulting html.
     *
     * @param text  The markdown string that should be parsed.
     * @returns The resulting html string.
     */
    public parseMarkdown(text: string, page: PageEvent<any>) {
        if (this.includes) {
            text = text.replace(this.includePattern, (_match, path) => {
                path = Path.join(this.includes!, path.trim());
                if (isFile(path)) {
                    const contents = readFile(path);
                    const event = new MarkdownEvent(MarkdownEvent.INCLUDE, page, contents, contents);
                    this.owner.trigger(event);
                    return event.parsedText;
                } else {
                    this.application.logger.warn(this.application.i18n.could_not_find_file_to_include_0(path));
                    return "";
                }
            });
        }

        if (this.mediaDirectory) {
            text = text.replace(this.mediaPattern, (match: string, path: string) => {
                const fileName = Path.join(this.mediaDirectory!, path);

                if (isFile(fileName)) {
                    return this.getRelativeUrl("media") + "/" + path;
                } else {
                    this.application.logger.warn(this.application.i18n.could_not_find_media_file_0(fileName));
                    return match;
                }
            });
        }

        const event = new MarkdownEvent(MarkdownEvent.PARSE, page, text, text);

        this.owner.trigger(event);
        return event.parsedText;
    }

    /**
     * Triggered before the renderer starts rendering a project.
     *
     * @param event  An event object describing the current render operation.
     */
    protected override onBeginRenderer(event: RendererEvent) {
        super.onBeginRenderer(event);

        this.setupParser();

        delete this.includes;
        if (this.includeSource) {
            if (fs.existsSync(this.includeSource) && fs.statSync(this.includeSource).isDirectory()) {
                this.includes = this.includeSource;
            } else {
                this.application.logger.warn(
                    this.application.i18n.could_not_find_includes_directory_0(this.includeSource),
                );
            }
        }

        if (this.mediaSource) {
            if (fs.existsSync(this.mediaSource) && fs.statSync(this.mediaSource).isDirectory()) {
                this.mediaDirectory = Path.join(event.outputDirectory, "media");
                copySync(this.mediaSource, this.mediaDirectory);
            } else {
                this.mediaDirectory = undefined;
                this.application.logger.warn(this.application.i18n.could_not_find_media_directory_0(this.mediaSource));
            }
        }
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
            ...(this.application.options.getValue("markdownItOptions") as {}),
            highlight: (code, lang) => {
                code = highlight(code, lang || "ts");
                code = code.replace(/\n$/, "") + "\n";

                if (!lang) {
                    return `<pre><code>${code}</code><button>Copy</button></pre>\n`;
                }

                return `<pre><code class="${escapeHtml(lang)}">${code}</code><button>Copy</button></pre>\n`;
            },
        });

        const loader = this.application.options.getValue("markdownItLoader");
        loader(this.parser);

        // Add anchor links for headings in readme, and add them to the "On this page" section
        this.parser.renderer.rules["heading_open"] = (tokens, idx) => {
            const token = tokens[idx];
            const content = tokens[idx + 1].content;
            const level = token.markup.length;

            const slug = this.getSlugger().slug(content);
            // Prefix the slug with an extra `md:` to prevent conflicts with TypeDoc's anchors.
            this.page!.pageHeadings.push({
                link: `#md:${slug}`,
                text: getTextContent(content),
                level,
            });

            return `<a id="md:${slug}" class="tsd-anchor"></a><${token.tag}><a href="#md:${slug}">`;
        };
        this.parser.renderer.rules["heading_close"] = (tokens, idx) => {
            return `</a></${tokens[idx].tag}>`;
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
