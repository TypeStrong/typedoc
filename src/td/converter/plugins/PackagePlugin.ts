module td
{
    /**
     * A handler that tries to find the package.json and readme.md files of the
     * current project.
     *
     * The handler traverses the file tree upwards for each file processed by the processor
     * and records the nearest package info files it can find. Within the resolve files, the
     * contents of the found files will be read and appended to the ProjectReflection.
     */
    export class PackagePlugin implements IPluginInterface
    {
        /**
         * The converter this plugin is attached to.
         */
        private converter:Converter;

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
         * Should the readme file be ignored?
         */
        private noReadmeFile:boolean;


        /**
         * Create a new PackageHandler instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter:Converter) {
            this.converter = converter;

            converter.on(Converter.EVENT_BEGIN,         this.onBegin,         this);
            converter.on(Converter.EVENT_FILE_BEGIN,    this.onBeginDocument, this);
            converter.on(Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve,  this);
        }


        /**
         * Removes this plugin.
         */
        remove() {
            this.converter.off(null, null, this);
            this.converter = null;
        }


        /**
         * Triggered once per project before the dispatcher invokes the compiler.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        private onBegin(scope:IConverterScope) {
            this.readmeFile  = null;
            this.packageFile = null;
            this.visited     = [];

            var readme = scope.getSettings().readme;
            this.noReadmeFile = (readme == 'none');
            if (!this.noReadmeFile && readme) {
                readme = Path.resolve(readme);
                if (FS.existsSync(readme)) {
                    this.readmeFile = readme;
                }
            }
        }


        /**
         * Triggered when the dispatcher begins processing a typescript document.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        private onBeginDocument(sourceFile:ts.SourceFile) {
            if (this.readmeFile && this.packageFile) {
                return;
            }

            var fileName = sourceFile.filename;
            var dirName, parentDir = Path.resolve(Path.dirname(fileName));
            do {
                dirName = parentDir;
                if (this.visited.indexOf(dirName) != -1) {
                    break;
                }

                FS.readdirSync(dirName).forEach((file) => {
                    var lfile = file.toLowerCase();
                    if (!this.noReadmeFile && !this.readmeFile && lfile == 'readme.md') {
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
        private onBeginResolve(scope:IConverterScope) {
            var project = scope.getProject();
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
    Converter.registerPlugin('PackagePlugin', PackagePlugin);
}
