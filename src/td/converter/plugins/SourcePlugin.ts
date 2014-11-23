module td
{
    /**
     * A handler that attaches source file information to reflections.
     */
    export class SourcePlugin extends ConverterPlugin
    {
        /**
         * Helper for resolving the base path of all source files.
         */
        private basePath = new BasePath();

        /**
         * A map of all generated [[SourceFile]] instances.
         */
        private fileMappings:{[name:string]:SourceFile} = {};


        /**
         * Create a new SourceHandler instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter:Converter) {
            super(converter);
            converter.on(Converter.EVENT_BEGIN,              this.onBegin,         this);
            converter.on(Converter.EVENT_FILE_BEGIN,         this.onBeginDocument, this);
            converter.on(Converter.EVENT_CREATE_DECLARATION, this.onDeclaration,   this);
            converter.on(Converter.EVENT_CREATE_SIGNATURE,   this.onDeclaration,   this);
            converter.on(Converter.EVENT_RESOLVE_BEGIN,      this.onBeginResolve,  this);
            converter.on(Converter.EVENT_RESOLVE,            this.onResolve,       this);
            converter.on(Converter.EVENT_RESOLVE_END,        this.onEndResolve,    this);
        }


        private getSourceFile(fileName:string, project:ProjectReflection):SourceFile {
            if (!this.fileMappings[fileName]) {
                var file = new SourceFile(fileName);
                this.fileMappings[fileName] = file;
                project.files.push(file);
            }

            return this.fileMappings[fileName];
        }


        /**
         * Triggered once per project before the dispatcher invokes the compiler.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onBegin() {
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
        private onBeginDocument(event:CompilerEvent) {
            var fileName = (<ts.SourceFile>event.node).filename;
            this.basePath.add(fileName);
            this.getSourceFile(fileName, event.getProject());
        }


        /**
         * Triggered when the dispatcher processes a declaration.
         *
         * Attach the current source file to the [[DeclarationReflection.sources]] array.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onDeclaration(event:CompilerEvent) {
            var sourceFile      = ts.getSourceFileOfNode(event.node);
            var fileName        = sourceFile.filename;
            var file:SourceFile = this.getSourceFile(fileName, event.getProject());

            var position;
            if (event.node['name'] && event.node['name'].end) {
                position = sourceFile.getLineAndCharacterFromPosition(event.node['name'].end);
            } else {
                position = sourceFile.getLineAndCharacterFromPosition(event.node.pos);
            }

            if (!event.reflection.sources) event.reflection.sources = [];
            if (event.reflection instanceof DeclarationReflection) {
                file.reflections.push(<DeclarationReflection>event.reflection);
            }

            event.reflection.sources.push({
                file: file,
                fileName: fileName,
                line: position.line,
                character: position.character
            });
        }


        /**
         * Triggered when the dispatcher enters the resolving phase.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onBeginResolve(event:ConverterEvent) {
            event.getProject().files.forEach((file) => {
                var fileName = file.fileName = this.basePath.trim(file.fileName);
                this.fileMappings[fileName] = file;
            });
        }


        /**
         * Triggered by the dispatcher for each reflection in the resolving phase.
         *
         * @param event  The event containing the reflection to resolve.
         */
        private onResolve(event:ResolveEvent) {
            if (!event.reflection.sources) return;
            event.reflection.sources.forEach((source) => {
                source.fileName = this.basePath.trim(source.fileName);
            });
        }


        /**
         * Triggered when the dispatcher leaves the resolving phase.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onEndResolve(event:ConverterEvent) {
            var project = event.getProject();
            var home = project.directory;
            project.files.forEach((file) => {
                var reflections = [];
                file.reflections.forEach((reflection) => {
                    reflections.push(reflection);
                });

                var directory = home;
                var path = Path.dirname(file.fileName);
                if (path != '.') {
                    path.split('/').forEach((path) => {
                        if (!directory.directories[path]) {
                            directory.directories[path] = new SourceDirectory(path, directory);
                        }
                        directory = directory.directories[path];
                    });
                }

                directory.files.push(file);
                // reflections.sort(GroupHandler.sortCallback);
                file.parent = directory;
                file.reflections = reflections;
            });
        }
    }


    /**
     * Register this handler.
     */
    Converter.registerPlugin('SourcePlugin', SourcePlugin);
}