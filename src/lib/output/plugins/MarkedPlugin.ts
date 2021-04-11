import * as FS from "fs-extra";
import * as Path from "path";
import * as Marked from "marked";
import * as Handlebars from "handlebars";

import { Component, ContextAwareRendererComponent } from "../components";
import { RendererEvent, MarkdownEvent } from "../events";
import { BindOption, readFile } from "../../utils";
import { highlight, isSupportedLanguage } from "../../utils/highlighter";
import { Theme } from "shiki";

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
 * A plugin that exposes the markdown, compact and relativeURL helper to handlebars.
 *
 * Templates should parse all comments with the markdown handler so authors can
 * easily format their documentation. TypeDoc uses the Marked (https://github.com/markedjs/marked)
 * markdown parser and HighlightJS (https://github.com/isagalaev/highlight.js) to highlight
 * code blocks within markdown sections. Additionally this plugin allows to link to other symbols
 * using double angle brackets.
 *
 * You can use the markdown helper anywhere in the templates to convert content to html:
 *
 * ```handlebars
 * {{#markdown}}{{{comment.text}}}{{/markdown}}
 * ```
 *
 * The compact helper removes all newlines of its content:
 *
 * ```handlebars
 * {{#compact}}
 *   Compact
 *   this
 * {{/compact}}
 * ```
 *
 * The relativeURL helper simply transforms an absolute url into a relative url:
 *
 * ```handlebars
 * {{#relativeURL url}}
 * ```
 */
@Component({ name: "marked" })
export class MarkedPlugin extends ContextAwareRendererComponent {
    @BindOption("includes")
    includeSource!: string;

    @BindOption("media")
    mediaSource!: string;

    @BindOption("highlightTheme")
    theme!: Theme;

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
    initialize() {
        super.initialize();
        this.listenTo(this.owner, MarkdownEvent.PARSE, this.onParseMarkdown);

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        Handlebars.registerHelper("markdown", function (this: any, arg: any) {
            const root = arg.data.root;
            that.outputFileName = root.filename;
            that.sources = root.model.sources;
            return that.parseMarkdown(arg.fn(this), this);
        });
        Handlebars.registerHelper("relativeURL", (url: string) =>
            url ? this.getRelativeUrl(url) : url
        );
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

        return highlight(text, lang, this.theme);
    }

    /**
     * Parse the given markdown string and return the resulting html.
     *
     * @param text  The markdown string that should be parsed.
     * @param context  The current handlebars context.
     * @returns The resulting html string.
     */
    public parseMarkdown(text: string, context: any) {
        if (this.includes) {
            text = text.replace(this.includePattern, (_match, path) => {
                path = Path.join(this.includes!, path.trim());
                if (FS.existsSync(path) && FS.statSync(path).isFile()) {
                    const contents = readFile(path);
                    if (path.substr(-4).toLocaleLowerCase() === ".hbs") {
                        const template = Handlebars.compile(contents);
                        return template(context, {
                            allowProtoMethodsByDefault: true,
                            allowProtoPropertiesByDefault: true,
                        });
                    } else {
                        return contents;
                    }
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
                        FS.existsSync(fileName) &&
                        FS.statSync(fileName).isFile()
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
    protected onBeginRenderer(event: RendererEvent) {
        super.onBeginRenderer(event);

        Marked.setOptions(this.createMarkedOptions());

        delete this.includes;
        if (this.includeSource) {
            const includes = Path.resolve(this.includeSource);
            if (
                FS.existsSync(includes) &&
                FS.statSync(includes).isDirectory()
            ) {
                this.includes = includes;
            } else {
                this.application.logger.warn(
                    "Could not find provided includes directory: " + includes
                );
            }
        }

        if (this.mediaSource) {
            const media = Path.resolve(this.mediaSource);
            if (FS.existsSync(media) && FS.statSync(media).isDirectory()) {
                this.mediaDirectory = Path.join(event.outputDirectory, "media");
                FS.copySync(media, this.mediaDirectory);
            } else {
                this.mediaDirectory = undefined;
                this.application.logger.warn(
                    "Could not find provided media directory: " + media
                );
            }
        }
    }

    /**
     * Creates an object with options that are passed to the markdown parser.
     *
     * @returns The options object for the markdown parser.
     */
    private createMarkedOptions(): Marked.MarkedOptions {
        const markedOptions = (this.application.options.getValue(
            "markedOptions"
        ) ?? {}) as Marked.MarkedOptions;

        if (
            typeof markedOptions === "object" &&
            !Array.isArray(markedOptions)
        ) {
            // Set some default values if they are not specified via the TypeDoc option
            markedOptions.highlight ??= (text: any, lang: any) =>
                this.getHighlighted(text, lang);
            markedOptions.renderer ??= customMarkedRenderer;
            markedOptions.mangle ??= false; // See https://github.com/TypeStrong/typedoc/issues/1395

            return markedOptions;
        }

        throw new Error(
            "The value provided via the 'markedOptions' option must be a non-array object."
        );
    }

    /**
     * Triggered when [[MarkedPlugin]] parses a markdown string.
     *
     * @param event
     */
    onParseMarkdown(event: MarkdownEvent) {
        event.parsedText = Marked(event.parsedText);
    }
}
