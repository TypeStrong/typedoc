module TypeDoc.Factories
{
    /**
     * A handler that tries to find the package.json and readme.md files of the
     * current project.
     *
     * The handler traverses the file tree upwards for each file processed by the processor
     * and records the nearest package info files it can find. Within the resolve files, the
     * contents of the found files will be read and appended to the ProjectReflection.
     */
    export class PackageHandler extends BaseHandler
    {
        /**
         * The file name of the found readme.md file.
         */
        private readmeFile:string;

        /**
         * The file name of the found package.json file.
         */
        private packageFile:string;

        /**
         * List of directories the handler already inspected.
         */
        private visited:string[] = [];


        /**
         * Create a new PackageHandler instance.
         *
         * Handlers are created automatically if they are registered in the static Dispatcher.FACTORIES array.
         *
         * @param dispatcher  The dispatcher this handler should be attached to.
         */
        constructor(dispatcher:Dispatcher) {
            super(dispatcher);

            dispatcher.on(Dispatcher.EVENT_BEGIN_DOCUMENT, this.onEnterDocument, this);
            dispatcher.on(Dispatcher.EVENT_BEGIN_RESOLVE, this.onEnterResolve, this);
        }


        /**
         * Triggered when the dispatcher begins processing a typescript document.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        onEnterDocument(state:DocumentState) {
            if (this.readmeFile && this.packageFile) {
                return;
            }

            var fileName = state.document.fileName;
            var dirName, parentDir = Path.resolve(Path.dirname(fileName));
            do {
                dirName = parentDir;
                if (this.visited.indexOf(dirName) != -1) {
                    break;
                }

                FS.readdirSync(dirName).forEach((file) => {
                    var lfile = file.toLowerCase();
                    if (!this.readmeFile && lfile == 'readme.md') {
                        this.readmeFile = Path.join(dirName, file);
                    }

                    if (!this.packageFile && lfile == 'package.json') {
                        this.packageFile = Path.join(dirName, file);
                    }
                });

                this.visited.push(dirName);
                parentDir = Path.resolve(Path.join(dirName, '..'));
            } while (dirName != parentDir);
        }


        /**
         * Triggered once after all documents have been read and the dispatcher
         * enters the resolving phase.
         */
        onEnterResolve(resolution:ResolveProjectEvent) {
            var project = resolution.project;
            if (this.readmeFile) {
                project.readme = FS.readFileSync(this.readmeFile, 'utf-8');
            }

            if (this.packageFile) {
                project.packageInfo = JSON.parse(FS.readFileSync(this.packageFile, 'utf-8'));
                if (!project.name) {
                    project.name = project.packageInfo.name;
                }
            }
        }
    }


    /**
     * Register this handler.
     */
    Dispatcher.HANDLERS.push(PackageHandler);
}