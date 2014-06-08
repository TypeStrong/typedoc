module TypeDoc.Output
{
    /**
     * A plugin that exposes the markdown and relativeURL helper to handlebars.
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
     * The relativeURL helper simply transforms an absolute url into a relative url:
     *
     * ```handlebars
     * {{#relativeURL url}}
     * ```
     */
    export class MarkedPlugin extends BasePlugin
    {
        /**
         * The project that is currently processed.
         */
        private project:Models.ProjectReflection;

        /**
         * The reflection that is currently processed.
         */
        private reflection:Models.DeclarationReflection;

        /**
         * The current url that is currently generated.
         */
        private location:string;


        /**
         * Create a new MarkedPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer:Renderer) {
            super(renderer);
            renderer.on('beginTarget', (t) => this.onRendererBeginTarget(t));
            renderer.on('beginOutput', (o) => this.onRendererBeginOutput(o));

            Marked.setOptions({
                highlight: (code:string, lang:string) => {
                    try {
                        if (lang) {
                            return HighlightJS.highlight(lang, code).value;
                        } else {
                            return HighlightJS.highlightAuto(code).value;
                        }
                    } catch (error) {
                        renderer.application.log(error.message, LogLevel.Warn);
                        return code;
                    }
                }
            });

            var that = this;
            Handlebars.registerHelper('markdown', function(arg:any) { return that.parseMarkdown(arg.fn(this)); });
            Handlebars.registerHelper('relativeURL', (url:string) => this.getRelativeUrl(url));
        }


        /**
         * Transform the given absolute to a relative path.
         *
         * @param absolute  The absolute path to transform.
         * @returns A path relative to the document currently processed.
         */
        public getRelativeUrl(absolute:string) {
            var relative = Path.relative(Path.dirname(this.location), Path.dirname(absolute));
            return Path.join(relative, Path.basename(absolute)).replace(/\\/g, '/');
        }


        /**
         * Parse the given markdown string and return the resulting html.
         *
         * @param text  The markdown string that should be parsed.
         * @returns The resulting html string.
         */
        public parseMarkdown(text:string) {
            var html = Marked(text);
            return this.parseReferences(html);
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
                var reflection:Models.DeclarationReflection;
                if (this.reflection) {
                    reflection = this.reflection.findReflectionByName(name);
                } else if (this.project) {
                    reflection = this.project.findReflectionByName(name);
                }

                if (reflection) {
                    return Util.format('<a href="%s">%s</a>', this.getRelativeUrl(reflection.url), name);
                } else {
                    return match;
                }
            });
        }


        /**
         * Triggered when the renderer begins processing a project.
         *
         * @param target  Defines the current target context of the renderer.
         */
        private onRendererBeginTarget(target:Models.RenderTarget) {
            this.project = target.project;
        }


        /**
         * Triggered when the renderer begins processing a single output file.
         *
         * @param output  Defines the current output context of the renderer.
         */
        private onRendererBeginOutput(output:Models.RenderOutput) {
            this.location        = output.url;
            this.reflection = output.model instanceof Models.DeclarationReflection ? output.model : null;
        }
    }


    /**
     * Register this plugin.
     */
    Renderer.PLUGIN_CLASSES.push(MarkedPlugin);
}