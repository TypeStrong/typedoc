module td.output
{
    /**
     * A plugin that builds links in markdown texts.
     */
    export class MarkedLinksPlugin extends ContextAwareRendererPlugin
    {
        /**
         * Regular expression for detecting bracket links.
         */
        private brackets:RegExp = /\[\[([^\]]+)\]\]/g;

        /**
         * Regular expression for detecting inline tags like {@link ...}.
         */
        private inlineTag:RegExp = /(?:\[(.+?)\])?\{@(link|linkcode|linkplain)\s+((?:.|\n)+?)\}/gi;

        /**
         * Regular expression to test if a string looks like an external url.
         */
        private urlPrefix:RegExp = /^(http|ftp)s?:\/\//;



        /**
         * Create a new MarkedLinksPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer:Renderer) {
            super(renderer);
            renderer.on(MarkedPlugin.EVENT_PARSE_MARKDOWN, this.onParseMarkdown, this, 100);
        }


        /**
         * Find all references to symbols within the given text and transform them into a link.
         *
         * This function is aware of the current context and will try to find the symbol within the
         * current reflection. It will walk up the reflection chain till the symbol is found or the
         * root reflection is reached. As a last resort the function will search the entire project
         * for the given symbol.
         *
         * @param text  The text that should be parsed.
         * @returns The text with symbol references replaced by links.
         */
        private replaceBrackets(text:string):string {
            return text.replace(this.brackets, (match:string, content:string):string => {
                var split = MarkedLinksPlugin.splitLinkText(content);
                return this.buildLink(match, split.target, split.caption);
            });
        }


        /**
         * Find symbol {@link ...} strings in text and turn into html links
         *
         * @param text  The string in which to replace the inline tags.
         * @return      The updated string.
         */
        private replaceInlineTags(text:string):string {
            return text.replace(this.inlineTag, (match:string, leading:string, tagName:string, content:string):string => {
                var split   = MarkedLinksPlugin.splitLinkText(content);
                var target  = split.target;
                var caption = leading || split.caption;

                var monospace;
                if (tagName == 'linkcode') monospace = true;
                if (tagName == 'linkplain') monospace = false;

                return this.buildLink(match, target, caption, monospace);
            });
        }


        /**
         * Format a link with the given text and target.
         *
         * @param original   The original link string, will be returned if the target cannot be resolved..
         * @param target     The link target.
         * @param caption    The caption of the link.
         * @param monospace  Whether to use monospace formatting or not.
         * @returns A html link tag.
         */
        private buildLink(original:string, target:string, caption:string, monospace?:boolean):string {
            var attributes = '';
            if (this.urlPrefix.test(target)) {
                attributes = ' class="external"';
            } else {
                var reflection;
                if (this.reflection) {
                    reflection = this.reflection.findReflectionByName(target);
                } else if (this.project) {
                    reflection = this.project.findReflectionByName(target);
                }

                if (reflection && reflection.url) {
                    target = this.getRelativeUrl(reflection.url);
                } else {
                    return original;
                }
            }

            if (monospace) {
                caption = '<code>' + caption + '</code>';
            }

            return Util.format('<a href="%s"%s>%s</a>', target, attributes, caption);
        }


        /**
         * Triggered when [[MarkedPlugin]] parses a markdown string.
         *
         * @param event
         */
        onParseMarkdown(event:MarkdownEvent) {
            event.parsedText = this.replaceInlineTags(this.replaceBrackets(event.parsedText));
        }


        /**
         * Split the given link into text and target at first pipe or space.
         *
         * @param text  The source string that should be checked for a split character.
         * @returns An object containing the link text and target.
         */
        static splitLinkText(text:string):{caption:string;target:string;} {
            var splitIndex = text.indexOf('|');
            if (splitIndex === -1) {
                splitIndex = text.search(/\s/);
            }

            if (splitIndex !== -1) {
                return {
                    caption: text.substr(splitIndex + 1).replace(/\n+/, ' '),
                    target: text.substr(0, splitIndex)
                };
            } else {
                return {
                    caption: text,
                    target: text
                };
            }
        }
    }


    /**
     * Register this plugin.
     */
    Renderer.registerPlugin('markedLinks', MarkedLinksPlugin);
}