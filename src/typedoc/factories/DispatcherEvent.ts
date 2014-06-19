module TypeDoc.Factories
{
    /**
     * Event object dispatched by [[Dispatcher]].
     *
     * This event is used when the dispatcher is not processing a specific declaration but
     * when a certain state is reached.
     *
     * @see [[Dispatcher.EVENT_BEGIN]]
     * @see [[Dispatcher.EVENT_BEGIN_RESOLVE]]
     * @see [[Dispatcher.EVENT_END_RESOLVE]]
     */
    export class DispatcherEvent extends Event
    {
        /**
         * The dispatcher that has created this event.
         */
        dispatcher:Dispatcher;

        /**
         * The current compiler used by the dispatcher.
         */
        compiler:Compiler;

        /**
         * The project the reflections are written to.
         */
        project:Models.ProjectReflection;


        /**
         * Create a new DispatcherEvent instance.
         *
         * @param dispatcher  The dispatcher that has created this event.
         * @param compiler    The current compiler used by the dispatcher.
         * @param project     The project the reflections are written to.
         */
        constructor(dispatcher:Dispatcher, compiler:Compiler, project:Models.ProjectReflection) {
            super();
            this.dispatcher = dispatcher;
            this.compiler   = compiler;
            this.project    = project;
        }


        /**
         * Create a [[ReflectionEvent]] based on this event and the given reflection.
         *
         * @param reflection  The reflection the returned event should represent.
         * @returns           A newly created instance of [[ReflectionEvent]].
         */
        createReflectionEvent(reflection:Models.DeclarationReflection):ReflectionEvent {
            return new ReflectionEvent(this, reflection)
        }


        /**
         * Create a [[DocumentState]] based on this event and the given document.
         *
         * @param document  The document the returned state should represent.
         * @returns         A newly created instance of [[DocumentState]].
         */
        createDocumentState(document:TypeScript.Document):DocumentState {
            return new DocumentState(this, document);
        }
    }
}