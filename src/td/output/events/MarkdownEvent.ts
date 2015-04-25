module td.output
{
    /**
     * An event emitted by the [[MarkedPlugin]] on the [[Renderer]] after a chunk of
     * markdown has been processed. Allows other plugins to manipulate the result.
     *
     * @see [[MarkedPlugin.EVENT_PARSE_MARKDOWN]]
     */
    export class MarkdownEvent extends Event
    {
        /**
         * The unparsed original text.
         */
        originalText:string;

        /**
         * The parsed output.
         */
        parsedText:string;
    }
}