module td
{
    /**
     * A handler that attaches source file information to reflections.
     */
    export class SourcePlugin implements IPluginInterface
    {
        /**
         * The converter this plugin is attached to.
         */
        private converter:Converter;

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
            this.converter = converter;

            converter.on(Converter.EVENT_BEGIN,              this.onBegin,         this);
            converter.on(Converter.EVENT_FILE_BEGIN,         this.onBeginDocument, this);
            converter.on(Converter.EVENT_CREATE_DECLARATION, this.onDeclaration,   this);
            converter.on(Converter.EVENT_CREATE_SIGNATURE,   this.onDeclaration,   this);
            converter.on(Converter.EVENT_RESOLVE_BEGIN,      this.onBeginResolve,  this);
            converter.on(Converter.EVENT_RESOLVE,            this.onResolve,       this);
            converter.on(Converter.EVENT_RESOLVE_END,        this.onEndResolve,    this);
        }


        /**
         * Removes this plugin.
         */
        remove() {
            this.converter.off(null, null, this);
            this.converter = null;
        }


        private getSourceFile(fileName:string, scope:IConverterScope):SourceFile {
            if (!this.fileMappings[fileName]) {
                var file = new SourceFile(fileName);
                this.fileMappings[fileName] = file;
                scope.getProject().files.push(file);
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
        private onBeginDocument(sourceFile:ts.SourceFile, scope:IConverterScope) {
            var fileName = sourceFile.filename;
            this.basePath.add(fileName);
            this.getSourceFile(fileName, scope);
        }


        /**
         * Triggered when the dispatcher processes a declaration.
         *
         * Attach the current source file to the [[DeclarationReflection.sources]] array.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onDeclaration(reflection:ISourceContainer, node:ts.Node, scope:IConverterScope) {
            var sourceFile      = ts.getSourceFileOfNode(node);
            var fileName        = sourceFile.filename;
            var file:SourceFile = this.getSourceFile(fileName, scope);
            var position        = sourceFile.getLineAndCharacterFromPosition(node.pos);

            if (!reflection.sources) reflection.sources = [];
            if (reflection instanceof DeclarationReflection) {
                file.reflections.push(<DeclarationReflection>reflection);
            }

            reflection.sources.push({
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
        private onBeginResolve(scope:IConverterScope) {
            scope.getProject().files.forEach((file) => {
                var fileName = file.fileName = this.basePath.trim(file.fileName);
                this.fileMappings[fileName] = file;
            });
        }


        /**
         * Triggered by the dispatcher for each reflection in the resolving phase.
         *
         * @param event  The event containing the reflection to resolve.
         */
        private onResolve(reflection:ISourceContainer) {
            if (!reflection.sources) return;
            reflection.sources.forEach((source) => {
                source.fileName = this.basePath.trim(source.fileName);
            });
        }


        /**
         * Triggered when the dispatcher leaves the resolving phase.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onEndResolve(scope:IConverterScope) {
            var project = scope.getProject();
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