module td.converter
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
         * Triggered when the converter begins converting a source file.
         *
         * Create a new [[SourceFile]] instance for all TypeScript files.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently processed.
         * @param node  The node that is currently processed if available.
         */
        private onBeginDocument(context:Context, reflection:Reflection, node?:ts.SourceFile) {
            if (!node) return;
            var fileName = node.filename;
            this.basePath.add(fileName);
            this.getSourceFile(fileName, context.project);
        }


        /**
         * Triggered when the converter has created a declaration reflection.
         *
         * Attach the current source file to the [[DeclarationReflection.sources]] array.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently processed.
         * @param node  The node that is currently processed if available.
         */
        private onDeclaration(context:Context, reflection:Reflection, node?:ts.Node) {
            if (!node) return;
            var sourceFile      = ts.getSourceFileOfNode(node);
            var fileName        = sourceFile.filename;
            var file:SourceFile = this.getSourceFile(fileName, context.project);

            var position;
            if (node['name'] && node['name'].end) {
                position = sourceFile.getLineAndCharacterFromPosition(node['name'].end);
            } else {
                position = sourceFile.getLineAndCharacterFromPosition(node.pos);
            }

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
         * Triggered when the converter begins resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBeginResolve(context:Context) {
            context.project.files.forEach((file) => {
                var fileName = file.fileName = this.basePath.trim(file.fileName);
                this.fileMappings[fileName] = file;
            });
        }


        /**
         * Triggered when the converter resolves a reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently resolved.
         */
        private onResolve(context:Context, reflection:Reflection) {
            if (!reflection.sources) return;
            reflection.sources.forEach((source) => {
                source.fileName = this.basePath.trim(source.fileName);
            });
        }


        /**
         * Triggered when the converter has finished resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onEndResolve(context:Context) {
            var project = context.project;
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
    Converter.registerPlugin('source', SourcePlugin);
}