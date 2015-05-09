declare module td
{
    export interface IOptions
    {
        /**
         * The location of the readme file that should be displayed on the index page. Set this to 'none' to
         * remove the index page and start with the globals page.
         */
        readme?:string;
    }
}

module td.converter
{
    /**
     * A handler that tries to find the package.json and readme.md files of the
     * current project.
     *
     * The handler traverses the file tree upwards for each file processed by the processor
     * and records the nearest package info files it can find. Within the resolve files, the
     * contents of the found files will be read and appended to the ProjectReflection.
     */
    export class PackagePlugin extends ConverterPlugin implements IParameterProvider
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
         * Should the readme file be ignored?
         */
        private noReadmeFile:boolean;


        /**
         * Create a new PackageHandler instance.
         *
         * @param converter  The converter this plugin should be attached to.
         */
        constructor(converter:Converter) {
            super(converter);
            converter.on(Converter.EVENT_BEGIN,         this.onBegin,         this);
            converter.on(Converter.EVENT_FILE_BEGIN,    this.onBeginDocument, this);
            converter.on(Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve,  this);
        }


        getParameters():IParameter[] {
            return <IParameter[]>[{
                name: 'readme',
                help: 'Path to the readme file that should be displayed on the index page. Pass `none` to disable the index page and start the documentation on the globals page.'
            }];
        }


        /**
         * Triggered when the converter begins converting a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBegin(context:Context) {
            this.readmeFile  = null;
            this.packageFile = null;
            this.visited     = [];

            var readme = context.getOptions().readme;
            this.noReadmeFile = (readme == 'none');
            if (!this.noReadmeFile && readme) {
                readme = Path.resolve(readme);
                if (FS.existsSync(readme)) {
                    this.readmeFile = readme;
                }
            }
        }


        /**
         * Triggered when the converter begins converting a source file.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The reflection that is currently processed.
         * @param node  The node that is currently processed if available.
         */
        private onBeginDocument(context:Context, reflection:models.Reflection, node?:ts.SourceFile) {
            if (!node) return;
            if (this.readmeFile && this.packageFile) {
                return;
            }

            var fileName = node.fileName;
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
         * Triggered when the converter begins resolving a project.
         *
         * @param context  The context object describing the current state the converter is in.
         */
        private onBeginResolve(context:Context) {
            var project = context.project;
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
    Converter.registerPlugin('package', PackagePlugin);
}
