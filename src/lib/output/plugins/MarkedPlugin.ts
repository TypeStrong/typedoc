import * as FS from "fs-extra";
import * as Path from "path";
import * as Marked from "marked";
import * as HighlightJS from "highlight.js";
import * as Handlebars from "handlebars";

import {Component, ContextAwareRendererComponent} from "../components";
import {RendererEvent, MarkdownEvent} from "../events";
import {Option} from "../../utils/component";
import {ParameterHint} from "../../utils/options/declaration";


/**
 * A plugin that exposes the markdown, compact and relativeURL helper to handlebars.
 *
 * Templates should parse all comments with the markdown handler so authors can
 * easily format their documentation. TypeDoc uses the Marked (https://github.com/chjj/marked)
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
@Component({name:"marked"})
export class MarkedPlugin extends ContextAwareRendererComponent
{
    @Option({
        name: 'includes',
        help: 'Specifies the location to look for included documents (use [[include:FILENAME]] in comments).',
        hint: ParameterHint.Directory
    })
    includeSource:string;

    @Option({
        name: 'media',
        help: 'Specifies the location with media files that should be copied to the output directory.',
        hint: ParameterHint.Directory
    })
    mediaSource:string;

    /**
     * The path referenced files are located in.
     */
    private includes:string;

    /**
     * Path to the output media directory.
     */
    private mediaDirectory:string;

    /**
     * The pattern used to find references in markdown.
     */
    private includePattern:RegExp = /\[\[include:([^\]]+?)\]\]/g;

    /**
     * The pattern used to find media links.
     */
    private mediaPattern:RegExp = /media:\/\/([^ "\)\]\}]+)/g;



    /**
     * Create a new MarkedPlugin instance.
     */
    initialize() {
        super.initialize();
        this.listenTo(this.owner, MarkdownEvent.PARSE, this.onParseMarkdown);

        var that = this;
        Handlebars.registerHelper('markdown', function(arg:any) { return that.parseMarkdown(arg.fn(this), this); });
        Handlebars.registerHelper('relativeURL', (url:string) => url ? this.getRelativeUrl(url) : url);

        Marked.setOptions({
            highlight: (text:any, lang:any) => this.getHighlighted(text, lang)
        });
    }


    /**
     * Highlight the synatx of the given text using HighlightJS.
     *
     * @param text  The text taht should be highlightes.
     * @param lang  The language that should be used to highlight the string.
     * @return A html string with syntax highlighting.
     */
    public getHighlighted(text:string, lang?:string):string {
        try {
            if (lang) {
                return HighlightJS.highlight(lang, text).value;
            } else {
                return HighlightJS.highlightAuto(text).value;
            }
        } catch (error) {
            this.application.logger.warn(error.message);
            return text;
        }
    }


    /**
     * Parse the given markdown string and return the resulting html.
     *
     * @param text  The markdown string that should be parsed.
     * @param context  The current handlebars context.
     * @returns The resulting html string.
     */
    public parseMarkdown(text:string, context:any) {
        if (this.includes) {
            text = text.replace(this.includePattern, (match:string, path:string) => {
                path = Path.join(this.includes, path.trim());
                if (FS.existsSync(path) && FS.statSync(path).isFile()) {
                    var contents = FS.readFileSync(path, 'utf-8');
                    if (path.substr(-4).toLocaleLowerCase() == '.hbs') {
                        var template = Handlebars.compile(contents);
                        return template(context);
                    } else {
                        return contents;
                    }
                } else {
                    return '';
                }
            });
        }

        if (this.mediaDirectory) {
            text = text.replace(this.mediaPattern, (match:string, path:string) => {
                if (FS.existsSync(Path.join(this.mediaDirectory, path))) {
                    return this.getRelativeUrl('media') + '/' + path;
                } else {
                    return match;
                }
            });
        }

        var event = new MarkdownEvent(MarkdownEvent.PARSE);
        event.originalText = text;
        event.parsedText = text;

        this.owner.trigger(event);
        return event.parsedText;
    }


    /**
     * Triggered before the renderer starts rendering a project.
     *
     * @param event  An event object describing the current render operation.
     */
    protected onBeginRenderer(event:RendererEvent) {
        super.onBeginRenderer(event);

        delete this.includes;
        if (this.includeSource) {
            var includes = Path.resolve(this.includeSource);
            if (FS.existsSync(includes) && FS.statSync(includes).isDirectory()) {
                this.includes = includes;
            } else {
                this.application.logger.warn('Could not find provided includes directory: ' + includes);
            }
        }

        if (this.mediaSource) {
            var media = Path.resolve(this.mediaSource);
            if (FS.existsSync(media) && FS.statSync(media).isDirectory()) {
                this.mediaDirectory = Path.join(event.outputDirectory, 'media');
                FS.copySync(media, this.mediaDirectory);
            } else {
                this.mediaDirectory = null;
                this.application.logger.warn('Could not find provided media directory: ' + media);
            }
        }
    }


    /**
     * Triggered when [[MarkedPlugin]] parses a markdown string.
     *
     * @param event
     */
    onParseMarkdown(event:MarkdownEvent) {
        event.parsedText = Marked(event.parsedText);
    }
}
