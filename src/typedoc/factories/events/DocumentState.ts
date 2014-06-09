module TypeDoc.Factories
{
    /**
     * Root state containing the TypeScript document that is processed.
     */
    export class DocumentState extends BaseState
    {
        /**
         * The dispatcher that has created this state.
         */
        dispatcher:Dispatcher;

        /**
         * The TypeScript document all following declarations are derived from.
         */
        document:TypeScript.Document;

        /**
         * The project the reflections should be stored to.
         */
        reflection:Models.ProjectReflection;

        compiler:Compiler;



        /**
         * Create a new DocumentState instance.
         *
         * @param dispatcher  The dispatcher that has created this state.
         * @param document    The TypeScript document that contains the declarations.
         */
        constructor(dispatcher:Dispatcher, document:TypeScript.Document, project:Models.ProjectReflection, compiler:Compiler) {
            super(null, document.topLevelDecl(), project);
            this.dispatcher = dispatcher;
            this.document   = document;
            this.compiler   = compiler;
        }
    }
}