module TypeDoc.Factories
{
    /**
     * Event object dispatched by [[Dispatcher]] during the resolving phase.
     *
     * @see [[Dispatcher.EVENT_RESOLVE]]
     */
    export class ReflectionEvent extends DispatcherEvent
    {
        /**
         * The final reflection that should be resolved.
         */
        reflection:Models.DeclarationReflection;


        /**
         * Create a new ReflectionEvent instance.
         *
         * @param compiler    The current compiler used by the dispatcher.
         * @param project     The project the reflections are written to.
         * @param reflection  The final reflection that should be resolved.
         */
        constructor(compiler:Compiler, project:Models.ProjectReflection, reflection?:Models.DeclarationReflection) {
            super(compiler, project);
            this.reflection = reflection;
        }
    }
}