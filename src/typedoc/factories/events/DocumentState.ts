module TypeDoc.Factories
{
    /**
     * Root state containing the TypeScript document that is processed.
     */
    export class DocumentState extends BaseState
    {
        /**
         * The TypeScript document all following declarations are derived from.
         */
        document:TypeScript.Document;



        /**
         * Create a new DocumentState instance.
         *
         * @param parent    The parent dispatcher event.
         * @param document  The TypeScript document that is being processed.
         */
        constructor(parent:DispatcherEvent, document:TypeScript.Document) {
            super(parent, document.topLevelDecl(), parent.project);
            this.document = document;
        }
    }
}