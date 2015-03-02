/// <reference path="../PluginHost.ts" />

module td
{
    export interface IConverterResult {
        project:any;
        errors:ts.Diagnostic[];
    }


    export class Converter extends PluginHost<ConverterPlugin> implements ts.CompilerHost
    {
        private application:IApplication;

        private currentDirectory: string;

        static ERROR_UNSUPPORTED_FILE_ENCODING = -2147024809;

        static EVENT_BEGIN:string = 'begin';
        static EVENT_END:string = 'end';

        static EVENT_FILE_BEGIN:string = 'fileBegin';
        static EVENT_CREATE_DECLARATION:string = 'createDeclaration';
        static EVENT_CREATE_SIGNATURE:string = 'createSignature';
        static EVENT_CREATE_PARAMETER:string = 'createParameter';
        static EVENT_CREATE_TYPE_PARAMETER:string = 'createTypeParameter';
        static EVENT_FUNCTION_IMPLEMENTATION:string = 'functionImplementation';

        static EVENT_RESOLVE_BEGIN:string = 'resolveBegin';
        static EVENT_RESOLVE_END:string = 'resolveEnd';
        static EVENT_RESOLVE:string = 'resolveReflection';



        constructor(application:IApplication) {
            super();
            this.application = application;

            Converter.loadPlugins(this);
        }


        /**
         * Compile the given source files and create a reflection tree for them.
         *
         * @param fileNames  Array of the file names that should be compiled.
         * @param settings   The settings that should be used to compile the files.
         */
        convert(fileNames:string[]):IConverterResult {
            for (var i = 0, c = fileNames.length; i < c; i++) {
                fileNames[i] = ts.normalizePath(ts.normalizeSlashes(fileNames[i]));
            }

            var dispatcher = this;
            var settings = this.application.settings;
            var program = ts.createProgram(fileNames, settings.compilerOptions, this);
            var checker = program.getTypeChecker(true);
            var project = new ProjectReflection(settings.name);


            return compile();


            function compile():IConverterResult {
                var errors = program.getDiagnostics();
                errors = errors.concat(checker.getDiagnostics());

                var converterEvent = new ConverterEvent(checker, project, settings);
                dispatcher.dispatch(Converter.EVENT_BEGIN, converterEvent);

                var context = new Context(dispatcher, settings, fileNames, checker, project);

                program.getSourceFiles().forEach((sourceFile) => {
                    visit(context, sourceFile);
                });

                dispatcher.dispatch(Converter.EVENT_RESOLVE_BEGIN, converterEvent);
                var resolveEvent = new ResolveEvent(checker, project, settings);
                for (var id in project.reflections) {
                    resolveEvent.reflection = project.reflections[id];
                    dispatcher.dispatch(Converter.EVENT_RESOLVE, resolveEvent);
                }

                dispatcher.dispatch(Converter.EVENT_RESOLVE_END, converterEvent);
                dispatcher.dispatch(Converter.EVENT_END, converterEvent);

                return {
                    errors: errors,
                    project: project
                }
            }
        }

        getSourceFile(filename:string, languageVersion:ts.ScriptTarget, onError?: (message: string) => void):ts.SourceFile {
            try {
                var text = ts.sys.readFile(filename, this.application.settings.compilerOptions.charset);
            } catch (e) {
                if (onError) {
                    onError(e.number === Converter.ERROR_UNSUPPORTED_FILE_ENCODING ?
                        'Unsupported file encoding' :
                        e.message);
                }
                text = "";
            }

            return text !== undefined ? ts.createSourceFile(filename, text, languageVersion, /*version:*/ "0") : undefined;
        }


        getDefaultLib() {
            var target = this.application.settings.compilerOptions.target;
            return target == ts.ScriptTarget.ES6 ? 'lib.es6.d.ts' : 'lib.d.ts';
        }


        getDefaultLibFilename() {
            var lib = this.getDefaultLib();
            var path = ts.getDirectoryPath(ts.normalizePath(td.tsPath));
            return Path.join(path, 'bin', lib);
        }


        getCurrentDirectory() {
            return this.currentDirectory || (this.currentDirectory = ts.sys.getCurrentDirectory());
        }


        useCaseSensitiveFileNames() {
            return ts.sys.useCaseSensitiveFileNames;
        }


        getCanonicalFileName(fileName:string):string {
            return ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
        }


        getNewLine() {
            return ts.sys.newLine;
        }


        writeFile(fileName:string, data:string, writeByteOrderMark:boolean, onError?:(message: string) => void) {
        }
    }
}
