module td.converter
{
    export class ConverterPlugin implements IPluginInterface
    {
        /**
         * The converter this plugin is attached to.
         */
        protected converter:Converter;


        /**
         * Create a new CommentPlugin instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter:Converter) {
            this.converter = converter;
        }


        /**
         * Removes this plugin.
         */
        remove() {
            this.converter.off(null, null, this);
            this.converter = null;
        }
    }
}