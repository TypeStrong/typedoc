import * as fs from "fs";
import * as Path from "path";
import * as Marked from "marked";

import { Component, ContextAwareRendererComponent } from "../components";
import { RendererEvent, MarkdownEvent } from "../events";
import { BindOption, readFile, copySync } from "../../utils";
import { highlight, isSupportedLanguage } from "../../utils/highlighter";
import type { Theme } from "shiki";

const customMarkedRenderer = new Marked.Renderer();

customMarkedRenderer.heading = (text, level, _, slugger) => {
    const slug = slugger.slug(text);

    return `
<a href="#${slug}" id="${slug}" style="color: inherit; text-decoration: none;">
  <h${level}>${text}</h${level}>
</a>
`;
};

/**
 * Implements markdown and relativeURL helpers for templates.
 * @internal
 */
@Component({ name: "marked" })
export class MarkedPlugin extends ContextAwareRendererComponent {
    @BindOption("includes")
    includeSource!: string;

    @BindOption("media")
    mediaSource!: string;

    @BindOption("lightHighlightTheme")
    lightTheme!: Theme;

    @BindOption("darkHighlightTheme")
    darkTheme!: Theme;

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

    private sources?: { fileName: string; line: number }[];
    private outputFileName?: string;

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
            // Extra newline because of the progress bar
            this.application.logger.warn(`
Unsupported highlight language "${lang}" will not be highlighted. Run typedoc --help for a list of supported languages.
target code block :
\t${text.split("\n").join("\n\t")}
source files :${this.sources?.map((source) => `\n\t${source.fileName}`).join()}
output file :
\t${this.outputFileName}`);
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
    public parseMarkdown(text: string) {
        if (this.includes) {
            text = text.replace(this.includePattern, (_match, path) => {
                path = Path.join(this.includes!, path.trim());
                if (fs.existsSync(path) && fs.statSync(path).isFile()) {
                    const contents = readFile(path);
                    return contents;
                } else {
                    this.application.logger.warn(
                        "Could not find file to include: " + path
                    );
                    return "";
                }
            });
        }

        if (this.mediaDirectory) {
            text = text.replace(
                this.mediaPattern,
                (match: string, path: string) => {
                    const fileName = Path.join(this.mediaDirectory!, path);

                    if (
                        fs.existsSync(fileName) &&
                        fs.statSync(fileName).isFile()
                    ) {
                        return this.getRelativeUrl("media") + "/" + path;
                    } else {
                        this.application.logger.warn(
                            "Could not find media file: " + fileName
                        );
                        return match;
                    }
                }
            );
        }

        const event = new MarkdownEvent(MarkdownEvent.PARSE, text, text);

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

        Marked.marked.setOptions(this.createMarkedOptions());

        delete this.includes;
        if (this.includeSource) {
            if (
                fs.existsSync(this.includeSource) &&
                fs.statSync(this.includeSource).isDirectory()
            ) {
                this.includes = this.includeSource;
            } else {
                this.application.logger.warn(
                    "Could not find provided includes directory: " +
                        this.includeSource
                );
            }
        }

        if (this.mediaSource) {
            if (
                fs.existsSync(this.mediaSource) &&
                fs.statSync(this.mediaSource).isDirectory()
            ) {
                this.mediaDirectory = Path.join(event.outputDirectory, "media");
                copySync(this.mediaSource, this.mediaDirectory);
            } else {
                this.mediaDirectory = undefined;
                this.application.logger.warn(
                    "Could not find provided media directory: " +
                        this.mediaSource
                );
            }
        }
    }

    /**
     * Creates an object with options that are passed to the markdown parser.
     *
     * @returns The options object for the markdown parser.
     */
    private createMarkedOptions(): Marked.marked.MarkedOptions {
        const markedOptions = (this.application.options.getValue(
            "markedOptions"
        ) ?? {}) as Marked.marked.MarkedOptions;

        // Set some default values if they are not specified via the TypeDoc option
        markedOptions.highlight ??= (text, lang) =>
            this.getHighlighted(text, lang);
        markedOptions.renderer ??= customMarkedRenderer;
        markedOptions.mangle ??= false; // See https://github.com/TypeStrong/typedoc/issues/1395

        return markedOptions;
    }

    /**
     * Triggered when {@link MarkedPlugin} parses a markdown string.
     *
     * @param event
     */
    onParseMarkdown(event: MarkdownEvent) {
        event.parsedText = Marked.marked(event.parsedText);
    }
}
