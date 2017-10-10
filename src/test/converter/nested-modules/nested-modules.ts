module TestModule
{
    /**
     * TestClass class comment.
     */
    export class TestClass
    {
        /**
         * This is a property.
         */
        public property = 'property';
        
        /**
         * This is a method.
         */
        public method(): void
        {

        }
    }

    /**
     * TestClass module comment.
     */
    export module TestClass
    {
        /**
         * This is an exported variable.
         */
        export const exportedVar = 'exported';

        /**
         * This is an internal variable.
         */
        const internalVar = 'internal';

        /**
         * This is an internal function.
         */
        function internalFunction(): void
        {

        }
    }
}
