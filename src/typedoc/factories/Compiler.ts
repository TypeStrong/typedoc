module TypeDoc.Factories
{
    export interface IScriptSnapshot
    {
        getText(start:number, end:number):string;
        getLineNumber(position:number):number;
    }


    /**
     *
     */
    export class Compiler extends TypeScript.BatchCompiler
    {
        idMap:{[id:number]:Models.DeclarationReflection} = {};

        private snapshots:{[fileName:string]:IScriptSnapshot} = {};



        /**
         * Create a new compiler instance.
         */
        constructor(settings:TypeScript.CompilationSettings) {
            super(TypeScript.IO);
            this.compilationSettings = TypeScript.ImmutableCompilationSettings.fromCompilationSettings(settings);
        }


        public run():TypeScript.Document[] {
            var start = new Date().getTime();

            TypeScript.CompilerDiagnostics.diagnosticWriter = { Alert: (s: string) => { this.ioHost.printLine(s); } };

            if (this.compilationSettings.createFileLog()) {
                this.logger = new TypeScript.FileLogger(this.ioHost);
            } else if (this.compilationSettings.gatherDiagnostics()) {
                this.logger = new TypeScript.DiagnosticsLogger(this.ioHost);
            } else {
                this.logger = new TypeScript.NullLogger();
            }

            // Resolve the compilation environemnt
            this.resolve();

            var documents = this.compile();

            if (this.compilationSettings.createFileLog()) {
                this.logger.log("Compilation settings:");
                this.logger.log(" propagateEnumConstants " + this.compilationSettings.propagateEnumConstants());
                this.logger.log(" removeComments " + this.compilationSettings.removeComments());
                this.logger.log(" watch " + this.compilationSettings.watch());
                this.logger.log(" noResolve " + this.compilationSettings.noResolve());
                this.logger.log(" noImplicitAny " + this.compilationSettings.noImplicitAny());
                this.logger.log(" nolib " + this.compilationSettings.noLib());
                this.logger.log(" target " + this.compilationSettings.codeGenTarget());
                this.logger.log(" module " + this.compilationSettings.moduleGenTarget());
                this.logger.log(" out " + this.compilationSettings.outFileOption());
                this.logger.log(" outDir " + this.compilationSettings.outDirOption());
                this.logger.log(" sourcemap " + this.compilationSettings.mapSourceFiles());
                this.logger.log(" mapRoot " + this.compilationSettings.mapRoot());
                this.logger.log(" sourceroot " + this.compilationSettings.sourceRoot());
                this.logger.log(" declaration " + this.compilationSettings.generateDeclarationFiles());
                this.logger.log(" useCaseSensitiveFileResolution " + this.compilationSettings.useCaseSensitiveFileResolution());
                this.logger.log(" diagnostics " + this.compilationSettings.gatherDiagnostics());
                this.logger.log(" codepage " + this.compilationSettings.codepage());

                this.logger.log("");

                this.logger.log("Input files:");
                this.inputFiles.forEach((file) => {
                    this.logger.log(" " + file);
                });

                this.logger.log("");

                this.logger.log("Resolved Files:");
                this.resolvedFiles.forEach((file) => {
                    file.importedFiles.forEach((file) => {
                        this.logger.log(" " + file);
                    });
                    file.referencedFiles.forEach((file) => {
                        this.logger.log(" " + file);
                    });
                });
            }

            if (this.compilationSettings.gatherDiagnostics()) {
                this.logger.log("");
                this.logger.log("File resolution time:                     " + TypeScript.fileResolutionTime);
                this.logger.log("           file read:                     " + TypeScript.fileResolutionIOTime);
                this.logger.log("        scan imports:                     " + TypeScript.fileResolutionScanImportsTime);
                this.logger.log("       import search:                     " + TypeScript.fileResolutionImportFileSearchTime);
                this.logger.log("        get lib.d.ts:                     " + TypeScript.fileResolutionGetDefaultLibraryTime);

                this.logger.log("SyntaxTree parse time:                    " + TypeScript.syntaxTreeParseTime);
                this.logger.log("Syntax Diagnostics time:                  " + TypeScript.syntaxDiagnosticsTime);
                this.logger.log("AST translation time:                     " + TypeScript.astTranslationTime);
                this.logger.log("");
                this.logger.log("Type check time:                          " + TypeScript.typeCheckTime);
                this.logger.log("");
                this.logger.log("Emit time:                                " + TypeScript.emitTime);
                this.logger.log("Declaration emit time:                    " + TypeScript.declarationEmitTime);

                this.logger.log("Total number of symbols created:          " + TypeScript.pullSymbolID);
                this.logger.log("Specialized types created:                " + TypeScript.nSpecializationsCreated);
                this.logger.log("Specialized signatures created:           " + TypeScript.nSpecializedSignaturesCreated);

                this.logger.log("  IsExternallyVisibleTime:                " + TypeScript.declarationEmitIsExternallyVisibleTime);
                this.logger.log("  TypeSignatureTime:                      " + TypeScript.declarationEmitTypeSignatureTime);
                this.logger.log("  GetBoundDeclTypeTime:                   " + TypeScript.declarationEmitGetBoundDeclTypeTime);
                this.logger.log("  IsOverloadedCallSignatureTime:          " + TypeScript.declarationEmitIsOverloadedCallSignatureTime);
                this.logger.log("  FunctionDeclarationGetSymbolTime:       " + TypeScript.declarationEmitFunctionDeclarationGetSymbolTime);
                this.logger.log("  GetBaseTypeTime:                        " + TypeScript.declarationEmitGetBaseTypeTime);
                this.logger.log("  GetAccessorFunctionTime:                " + TypeScript.declarationEmitGetAccessorFunctionTime);
                this.logger.log("  GetTypeParameterSymbolTime:             " + TypeScript.declarationEmitGetTypeParameterSymbolTime);
                this.logger.log("  GetImportDeclarationSymbolTime:         " + TypeScript.declarationEmitGetImportDeclarationSymbolTime);

                this.logger.log("Emit write file time:                     " + TypeScript.emitWriteFileTime);

                this.logger.log("Compiler resolve path time:               " + TypeScript.compilerResolvePathTime);
                this.logger.log("Compiler directory name time:             " + TypeScript.compilerDirectoryNameTime);
                this.logger.log("Compiler directory exists time:           " + TypeScript.compilerDirectoryExistsTime);
                this.logger.log("Compiler file exists time:                " + TypeScript.compilerFileExistsTime);

                this.logger.log("IO host resolve path time:                " + TypeScript.ioHostResolvePathTime);
                this.logger.log("IO host directory name time:              " + TypeScript.ioHostDirectoryNameTime);
                this.logger.log("IO host create directory structure time:  " + TypeScript.ioHostCreateDirectoryStructureTime);
                this.logger.log("IO host write file time:                  " + TypeScript.ioHostWriteFileTime);

                this.logger.log("Node make directory time:                 " + TypeScript.nodeMakeDirectoryTime);
                this.logger.log("Node writeFileSync time:                  " + TypeScript.nodeWriteFileSyncTime);
                this.logger.log("Node createBuffer time:                   " + TypeScript.nodeCreateBufferTime);
            }

            return documents;
        }


        public compile():TypeScript.Document[] {
            var compiler = new TypeScript.TypeScriptCompiler(this.logger, this.compilationSettings);

            this.resolvedFiles.forEach(resolvedFile => {
                var sourceFile = this.getSourceFile(resolvedFile.path);
                compiler.addFile(resolvedFile.path, sourceFile.scriptSnapshot, sourceFile.byteOrderMark, /*version:*/ 0, /*isOpen:*/ false, resolvedFile.referencedFiles);
            });

            for (var it = compiler.compile((path: string) => this.resolvePath(path)); it.moveNext();) {
                var result = it.current();
                result.diagnostics.forEach(d => this.addDiagnostic(d));
            }

            var documents:TypeScript.Document[] = [];
            compiler.fileNames().forEach((fileName) => {
                documents.push(compiler.getDocument(fileName));
            });

            return documents;
        }


        /**
         * Return the snapshot of the given filename.
         *
         * @param fileName  The filename of the snapshot.
         */
        getSnapshot(fileName:string):IScriptSnapshot {
            if (!this.snapshots[fileName]) {
                var snapshot:TypeScript.IScriptSnapshot;
                var lineMap:TypeScript.LineMap;

                this.snapshots[fileName] = {
                    getText: (start:number, end:number):string => {
                        if (!snapshot) snapshot = this.getScriptSnapshot(fileName);
                        return snapshot.getText(start, end);
                    },
                    getLineNumber: (position:number):number => {
                        if (!snapshot) snapshot = this.getScriptSnapshot(fileName);
                        if (!lineMap) lineMap = TypeScript.LineMap1.fromScriptSnapshot(snapshot);
                        return lineMap.getLineNumberFromPosition(position);
                    }
                }
            }

            return this.snapshots[fileName];
        }


        getDefaultLibraryFilePath():string {
            return this.resolvePath(TypeScript.IOUtils.combine(typeScriptPath, "lib.d.ts"));
        }
    }
}