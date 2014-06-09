module TypeDoc.Factories
{
    /**
     * Base class of all handlers.
     */
    export class BaseHandler
    {
        /**
         * The dispatcher this handler is attached to.
         */
        dispatcher:Dispatcher;


        /**
         * Create a new BaseHandler instance.
         *
         * @param dispatcher  The dispatcher this handler should be attached to.
         */
        constructor(dispatcher:Dispatcher) {
            this.dispatcher = dispatcher;
        }
    }
}