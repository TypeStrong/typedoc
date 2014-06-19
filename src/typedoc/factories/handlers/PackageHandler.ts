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
        private visited:string[];


        /**
         * Create a new PackageHandler instance.
         *
         * @param dispatcher  The dispatcher this handler should be attached to.
         */
        constructor(dispatcher:Dispatcher) {
            super(dispatcher);

            dispatcher.on(Dispatcher.EVENT_BEGIN, this.onBegin,                  this);
            dispatcher.on(Dispatcher.EVENT_BEGIN_DOCUMENT, this.onBeginDocument, this);
            dispatcher.on(Dispatcher.EVENT_BEGIN_RESOLVE,  this.onBeginResolve,  this);
        }


        /**
         * Triggered once per project before the dispatcher invokes the compiler.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onBegin(event:DispatcherEvent) {
            this.readmeFile  = null;
            this.packageFile = null;
            this.visited     = [];
        }


        /**
         * Triggered when the dispatcher begins processing a typescript document.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onBeginDocument(state:DocumentState) {
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
         * Triggered when the dispatcher enters the resolving phase.
         *
         * @param event  The event containing the project and compiler.
         */
        private onBeginResolve(event:DispatcherEvent) {
            var project = event.project;
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