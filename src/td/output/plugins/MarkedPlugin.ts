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

module td
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
    export class MarkedPlugin extends RendererPlugin implements IParameterProvider
    {
        /**
         * The project that is currently processed.
         */
        private project:ProjectReflection;

        /**
         * The reflection that is currently processed.
         */
        private reflection:DeclarationReflection;

        /**
         * The url of the document that is being currently generated.
         */
        private location:string;

        /**
         * The path referenced files are located in.
         */
        private includes:string;

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
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer:Renderer) {
            super(renderer);
            renderer.on(Renderer.EVENT_BEGIN, this.onRendererBegin, this);
            renderer.on(Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);

            var that = this;
            Handlebars.registerHelper('markdown', function(arg:any) { return that.parseMarkdown(arg.fn(this), this); });
            Handlebars.registerHelper('compact',  function(arg:any) { return that.getCompact(arg.fn(this)); });
            Handlebars.registerHelper('relativeURL', (url:string) => this.getRelativeUrl(url));
            Handlebars.registerHelper('wbr', (str:string) => this.getWordBreaks(str));
            Handlebars.registerHelper('ifCond', function(v1, operator, v2, options) { return that.getIfCond(v1, operator, v2, options, this) });

            HighlightJS.registerLanguage('typescript', highlightTypeScript);

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
         * Transform the given absolute path into a relative path.
         *
         * @param absolute  The absolute path to transform.
         * @returns A path relative to the document currently processed.
         */
        public getRelativeUrl(absolute:string):string {
            var relative = Path.relative(Path.dirname(this.location), Path.dirname(absolute));
            return Path.join(relative, Path.basename(absolute)).replace(/\\/g, '/');
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

            text = text.replace(this.mediaPattern, (match:string, path:string) => {
                return this.getRelativeUrl('media') + '/' + path;
            });

            return this.parseReferences(Marked(text));
        }


        /**
         * Find all references to symbols within the given text and transform them into a link.
         *
         * The references must be surrounded with double angle brackets. When the reference could
         * not be found, the original text containing the brackets will be returned.
         *
         * This function is aware of the current context and will try to find the symbol within the
         * current reflection. It will walk up the reflection chain till the symbol is found or the
         * root reflection is reached. As a last resort the function will search the entire project
         * for the given symbol.
         *
         * @param text  The text that should be parsed.
         * @returns The text with symbol references replaced by links.
         */
        public parseReferences(text:string) {
            return text.replace(/\[\[([^\]]+)\]\]/g, (match:string, name:string) => {
                var reflection:Reflection;
                if (this.reflection) {
                    reflection = this.reflection.findReflectionByName(name);
                } else if (this.project) {
                    reflection = this.project.findReflectionByName(name);
                }

                if (reflection && reflection.url) {
                    return Util.format('<a href="%s">%s</a>', this.getRelativeUrl(reflection.url), name);
                } else {
                    return match;
                }
            });
        }


        /**
         * Triggered before the renderer starts rendering a project.
         *
         * @param event  An event object describing the current render operation.
         */
        private onRendererBegin(event:OutputEvent) {
            this.project = event.project;

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
                    var to = Path.join(event.outputDirectory, 'media');
                    FS.copySync(media, to);
                } else {
                    this.renderer.application.logger.warn('Could not find provided includes directory: ' + includes);
                }
            }
        }


        /**
         * Triggered before a document will be rendered.
         *
         * @param page  An event object describing the current render operation.
         */
        private onRendererBeginPage(page:OutputPageEvent) {
            this.location   = page.url;
            this.reflection = page.model instanceof DeclarationReflection ? page.model : null;
        }
    }


    /**
     * TypeScript HighlightJS definition.
     */
    function highlightTypeScript(hljs) {
        var IDENT_RE = '[a-zA-Z_$][a-zA-Z0-9_$]*';
        var IDENT_FUNC_RETURN_TYPE_RE = '([*]|[a-zA-Z_$][a-zA-Z0-9_$]*)';
        var AS3_REST_ARG_MODE = {
            className: 'rest_arg',
            begin: '[.]{3}', end: IDENT_RE,
            relevance: 10
        };

        return {
            aliases: ['ts'],
            keywords: {
                keyword:
                    'in if for while finally var new function do return void else break catch ' +
                    'instanceof with throw case default try this switch continue typeof delete ' +
                    'let yield const class interface enum static private public',
                literal:
                    'true false null undefined NaN Infinity any string number void',
                built_in:
                    'eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent ' +
                    'encodeURI encodeURIComponent escape unescape Object Function Boolean Error ' +
                    'EvalError InternalError RangeError ReferenceError StopIteration SyntaxError ' +
                    'TypeError URIError Number Math Date String RegExp Array Float32Array ' +
                    'Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array ' +
                    'Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require'
            },
            contains: [
                hljs.APOS_STRING_MODE,
                hljs.QUOTE_STRING_MODE,
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                hljs.C_NUMBER_MODE,
                {
                    className: 'module',
                    beginKeywords: 'module', end: '{',
                    contains: [hljs.TITLE_MODE]
                },
                {
                    className: 'class',
                    beginKeywords: 'class interface', end: '{',
                    contains: [
                        {
                            beginKeywords: 'extends implements'
                        },
                        hljs.TITLE_MODE
                    ]
                },
                {
                    className: 'function',
                    beginKeywords: 'function', end: '[{;]',
                    illegal: '\\S',
                    contains: [
                        hljs.TITLE_MODE,
                        {
                            className: 'params',
                            begin: '\\(', end: '\\)',
                            contains: [
                                hljs.APOS_STRING_MODE,
                                hljs.QUOTE_STRING_MODE,
                                hljs.C_LINE_COMMENT_MODE,
                                hljs.C_BLOCK_COMMENT_MODE,
                                AS3_REST_ARG_MODE
                            ]
                        },
                        {
                            className: 'type',
                            begin: ':',
                            end: IDENT_FUNC_RETURN_TYPE_RE,
                            relevance: 10
                        }
                    ]
                }
            ]
        };
    }


    /**
     * Register this plugin.
     */
    Renderer.registerPlugin('marked', MarkedPlugin);
}