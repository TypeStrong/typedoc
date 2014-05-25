module TypeDoc
{
    export class Application extends TypeScript.BatchCompiler
    {
        project:Models.ProjectReflection;

        renderer:Renderer.Renderer;



        constructor() {
            super(TypeScript.IO);
            this.project  = new Models.ProjectReflection();
            this.renderer = new Renderer.Renderer(this);
        }


        runFromCLI() {
            if (this.parseOptions()) {
                this.batchCompile();
                this.renderer.render();
            }

            // this.ioHost.quit(this.hasErrors ? 1 : 0);
        }


        alterOptionsParser(opts:TypeScript.OptionsParser) {
            var options = [];
            var invalidOptions = {out:true, outDir:true, sourcemap:true, sourceRoot:true, declaration:true, watch:true, removeComments:true};
            opts.options.forEach((opt) => {
                if (opt.name in invalidOptions) return;
                options.push(opt);
            });
            opts.options = options;

            opts.option('out', {
                usage: {
                    locCode: 'Specifies the location the documentation should be written to.',
                    args: null
                },
                type: TypeScript.DiagnosticCode.DIRECTORY,
                set: (str) => {
                    this.renderer.dirName = this.resolvePath(str);
                }
            });

            opts.option('name', {
                usage: {
                    locCode: 'Set the name of the project that will be used in the header of the template.',
                    args: null
                },
                set: (str) => {
                    this.project.name = str;
                }
            });
        }


        postOptionsParse() {
            if (!this.renderer.dirName) {
                return true;
            }

            var files = [];
            function add(dirname) {
                FS.readdirSync(dirname).forEach((file) => {
                    var realpath = TypeScript.IOUtils.combine(dirname, file);
                    if (FS.statSync(realpath).isDirectory()) {
                        add(realpath);
                    } else if (/\.ts$/.test(realpath)) {
                        files.push(realpath);
                    }
                });
            }

            this.inputFiles.forEach((file) => {
                file = this.resolvePath(file);
                if (FS.statSync(file).isDirectory()) {
                    add(file);
                } else {
                    files.push(file);
                }
            });

            this.inputFiles = files;
            return false;
        }


        public compile():void {
            var compiler = new TypeScript.TypeScriptCompiler(this.logger, this.compilationSettings);
            var dispatcher = new Factories.Dispatcher(this.project, this);

            this.resolvedFiles.forEach(resolvedFile => {
                var sourceFile = this.getSourceFile(resolvedFile.path);
                compiler.addFile(resolvedFile.path, sourceFile.scriptSnapshot, sourceFile.byteOrderMark, /*version:*/ 0, /*isOpen:*/ false, resolvedFile.referencedFiles);
            });

            for (var it = compiler.compile((path: string) => this.resolvePath(path)); it.moveNext();) {
                var result = it.current();
                result.diagnostics.forEach(d => this.addDiagnostic(d));
            }

            compiler.fileNames().forEach((fileName) => {
                dispatcher.attachDocument(compiler.getDocument(fileName));
            });

            dispatcher.resolve();
        }


        getDefaultLibraryFilePath():string {
            return this.resolvePath(TypeScript.IOUtils.combine(TypeScript.typescriptPath, "lib.d.ts"));
        }
    }
}