module TypeDoc.Factories
{
    /**
     * A handler that attaches source file information to reflections.
     */
    export class SourceHandler extends BaseHandler
    {
        /**
         * Helper for resolving the base path of all source files.
         */
        private basePath = new BasePath();

        /**
         * A map of all generated [[SourceFile]] instances.
         */
        private fileMappings:{[name:string]:Models.SourceFile} = {};


        /**
         * Create a new SourceHandler instance.
         *
         * @param dispatcher  The dispatcher this handler should be attached to.
         */
        constructor(dispatcher:Dispatcher) {
            super(dispatcher);

            dispatcher.on(Dispatcher.EVENT_BEGIN,          this.onBegin,         this);
            dispatcher.on(Dispatcher.EVENT_BEGIN_DOCUMENT, this.onBeginDocument, this);
            dispatcher.on(Dispatcher.EVENT_DECLARATION,    this.onDeclaration,   this);
            dispatcher.on(Dispatcher.EVENT_BEGIN_RESOLVE,  this.onBeginResolve,  this);
            dispatcher.on(Dispatcher.EVENT_RESOLVE,        this.onResolve,       this);
            dispatcher.on(Dispatcher.EVENT_END_RESOLVE,    this.onEndResolve,    this, 512);
        }


        /**
         * Triggered once per project before the dispatcher invokes the compiler.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onBegin(event:DispatcherEvent) {
            this.basePath.reset();
            this.fileMappings = {};
        }


        /**
         * Triggered when the dispatcher starts processing a TypeScript document.
         *
         * Create a new [[SourceFile]] instance for all TypeScript files.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onBeginDocument(state:DocumentState) {
            var fileName = state.document.fileName;
            this.basePath.add(fileName);

            if (!this.fileMappings[fileName]) {
                var file = new Models.SourceFile(fileName);
                this.fileMappings[fileName] = file;
                state.project.files.push(file);
            }
        }


        /**
         * Triggered when the dispatcher processes a declaration.
         *
         * Attach the current source file to the [[DeclarationReflection.sources]] array.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onDeclaration(state:DeclarationState) {
            if (state.isInherited) {
                if (state.kindOf([Models.Kind.Class, Models.Kind.Interface])) return;
                if (state.reflection.overwrites) return;
            } else if (!state.isSignature && !state.kindOf(Models.Kind.Parameter)) {
                var fileName = state.originalDeclaration.ast().fileName();
                if (this.fileMappings[fileName]) {
                    this.fileMappings[fileName].reflections.push(state.reflection);
                }
            }

            var ast      = state.declaration.ast();
            var fileName = state.declaration.ast().fileName();
            var snapshot = state.getSnapshot(fileName);

            this.basePath.add(fileName);
            state.reflection.sources.push({
                file:     this.fileMappings[fileName],
                fileName: fileName,
                line:     snapshot.getLineNumber(ast.start()) + 1
            });
        }


        /**
         * Triggered when the dispatcher enters the resolving phase.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onBeginResolve(event:DispatcherEvent) {
            event.project.files.forEach((file) => {
                var fileName = file.fileName = this.basePath.trim(file.fileName);
                this.fileMappings[fileName] = file;
            });
        }


        /**
         * Triggered by the dispatcher for each reflection in the resolving phase.
         *
         * @param event  The event containing the reflection to resolve.
         */
        private onResolve(event:ReflectionEvent) {
            event.reflection.sources.forEach((source) => {
                source.fileName = this.basePath.trim(source.fileName);
            });
        }


        /**
         * Triggered when the dispatcher leaves the resolving phase.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onEndResolve(event:DispatcherEvent) {
            var home = event.project.directory;
            event.project.files.forEach((file) => {
                var reflections = [];
                file.reflections.forEach((reflection) => {
                    if (reflection.sources.length > 1) return;
                    var parent = reflection.parent;
                    while (!(parent instanceof Models.ProjectReflection)) {
                        if (reflections.indexOf(<Models.DeclarationReflection>parent) != -1) return;
                        parent = parent.parent;
                    }

                    reflections.push(reflection);
                });

                var directory = home;
                var path = Path.dirname(file.fileName);
                if (path != '.') {
                    path.split('/').forEach((path) => {
                        if (!directory.directories[path]) {
                            directory.directories[path] = new Models.SourceDirectory(path, directory);
                        }
                        directory = directory.directories[path];
                    });
                }

                directory.files.push(file);
                reflections.sort(GroupHandler.sortCallback);
                file.parent = directory;
                file.reflections = reflections;
            });
        }
    }


    /**
     * Register this handler.
     */
    Dispatcher.HANDLERS.push(SourceHandler);
}