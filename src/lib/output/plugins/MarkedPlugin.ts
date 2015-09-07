declare module td
{
    export interface IOptions
    {
        /**
         * Specifies the location to look for included documents.
         */
        includes?:string;

        /**
         * Specifies the location with media files that should be copied to the output directory.
         */
        media?:string;
    }
}

module td.output
{
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
    export class MarkedPlugin extends ContextAwareRendererPlugin implements IParameterProvider
    {
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
         * Triggered on the renderer when this plugin parses a markdown string.
         * @event
         */
        static EVENT_PARSE_MARKDOWN:string = 'parseMarkdown';



        /**
         * Create a new MarkedPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer:Renderer) {
            super(renderer);
            renderer.on(MarkedPlugin.EVENT_PARSE_MARKDOWN, this.onParseMarkdown, this);

            var that = this;
            Handlebars.registerHelper('markdown', function(arg:any) { return that.parseMarkdown(arg.fn(this), this); });
            Handlebars.registerHelper('compact',  function(arg:any) { return that.getCompact(arg.fn(this)); });
            Handlebars.registerHelper('relativeURL', (url:string) => this.getRelativeUrl(url));
            Handlebars.registerHelper('wbr', (str:string) => this.getWordBreaks(str));
            Handlebars.registerHelper('ifCond', function(v1, operator, v2, options) { return that.getIfCond(v1, operator, v2, options, this) });
            Handlebars.registerHelper('ifSignature', function(obj:any, arg:any) { return obj instanceof models.SignatureReflection ? arg.fn(this) : arg.inverse(this) });

            Marked.setOptions({
                highlight: (text, lang) => this.getHighlighted(text, lang)
            });
        }


        getParameters():IParameter[] {
            return <IParameter[]>[{
                name: 'includes',
                help: 'Specifies the location to look for included documents (use [[include:FILENAME]] in comments).',
                hint: ParameterHint.Directory
            },{
                name: 'media',
                help: 'Specifies the location with media files that should be copied to the output directory.',
                hint: ParameterHint.Directory
            }];
        }


        /**
         * Compress the given string by removing all newlines.
         *
         * @param text  The string that should be compressed.
         * @returns The string with all newlsines stripped.
         */
        public getCompact(text:string):string {
            var lines = text.split('\n');
            for (var i = 0, c = lines.length; i < c; i++) {
                lines[i] = lines[i].trim().replace(/&nbsp;/, ' ');
            }
            return lines.join('');
        }


        /**
         * Insert word break tags ``<wbr>`` into the given string.
         *
         * Breaks the given string at ``_``, ``-`` and captial letters.
         *
         * @param str  The string that should be split.
         * @return     The original string containing ``<wbr>`` tags where possible.
         */
        public getWordBreaks(str:string):string {
            str = str.replace(/([^_\-][_\-])([^_\-])/g, (m, a, b) => a + '<wbr>' + b);
            str = str.replace(/([^A-Z])([A-Z][^A-Z])/g, (m, a, b) => a + '<wbr>' + b);
            return str;
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
                this.renderer.application.logger.warn(error.message);
                return text;
            }
        }


        /**
         * Handlebars if helper with condition.
         *
         * @param v1        The first value to be compared.
         * @param operator  The operand to perform on the two given values.
         * @param v2        The second value to be compared
         * @param options   The current handlebars object.
         * @param context   The current handlebars context.
         * @returns {*}
         */
        public getIfCond(v1, operator, v2, options, context) {
            switch (operator) {
                case '==':
                    return (v1 == v2) ? options.fn(context) : options.inverse(context);
                case '===':
                    return (v1 === v2) ? options.fn(context) : options.inverse(context);
                case '<':
                    return (v1 < v2) ? options.fn(context) : options.inverse(context);
                case '<=':
                    return (v1 <= v2) ? options.fn(context) : options.inverse(context);
                case '>':
                    return (v1 > v2) ? options.fn(context) : options.inverse(context);
                case '>=':
                    return (v1 >= v2) ? options.fn(context) : options.inverse(context);
                case '&&':
                    return (v1 && v2) ? options.fn(context) : options.inverse(context);
                case '||':
                    return (v1 || v2) ? options.fn(context) : options.inverse(context);
                default:
                    return options.inverse(context);
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

            var event = new MarkdownEvent();
            event.originalText = text;
            event.parsedText = text;

            this.renderer.dispatch(MarkedPlugin.EVENT_PARSE_MARKDOWN, event);
            return event.parsedText;
        }


        /**
         * Triggered before the renderer starts rendering a project.
         *
         * @param event  An event object describing the current render operation.
         */
        protected onRendererBegin(event:OutputEvent) {
            super.onRendererBegin(event);

            delete this.includes;
            if (event.settings.includes) {
                var includes = Path.resolve(event.settings.includes);
                if (FS.existsSync(includes) && FS.statSync(includes).isDirectory()) {
                    this.includes = includes;
                } else {
                    this.renderer.application.logger.warn('Could not find provided includes directory: ' + includes);
                }
            }

            if (event.settings.media) {
                var media = Path.resolve(event.settings.media);
                if (FS.existsSync(media) && FS.statSync(media).isDirectory()) {
                    this.mediaDirectory = Path.join(event.outputDirectory, 'media');
                    FS.copySync(media, this.mediaDirectory);
                } else {
                    this.mediaDirectory = null;
                    this.renderer.application.logger.warn('Could not find provided includes directory: ' + includes);
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


    /**
     * Register this plugin.
     */
    Renderer.registerPlugin('marked', MarkedPlugin);
}