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
         * @param parent    The parent dispatcher event.
         * @param reflection  The final reflection that should be resolved.
         */
        constructor(parent:DispatcherEvent, reflection?:Models.DeclarationReflection) {
            super(parent.dispatcher, parent.compiler, parent.project);
            this.reflection = reflection;
        }
    }
}