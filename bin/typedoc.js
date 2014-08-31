/// <reference path="lib/tsd.d.ts" />

var Handlebars = require('handlebars');
var Marked = require('marked');
var HighlightJS = require('highlight.js');
var Minimatch = require('minimatch');
var Util = require('util');
var VM = require('vm');
var Path = require('path');
var FS = require('fs-extra');
var ShellJS = require('shelljs');

var typeScriptPath = Path.dirname(require.resolve('typescript'));
if (!FS.existsSync(Path.resolve(typeScriptPath, 'typescript.js'))) {
    process.stderr.write('Could not find ´typescript.js´. Please install typescript, e.g. \'npm install typescript\'.\n');
    process.exit();
}

eval(FS.readFileSync(Path.resolve(typeScriptPath, 'typescript.js'), 'utf-8'));
//
// Copyright (c) Microsoft Corporation.  All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
var TypeScript;
(function (TypeScript) {
    var SourceFile = (function () {
        function SourceFile(scriptSnapshot, byteOrderMark) {
            this.scriptSnapshot = scriptSnapshot;
            this.byteOrderMark = byteOrderMark;
        }
        return SourceFile;
    })();
    TypeScript.SourceFile = SourceFile;

    var DiagnosticsLogger = (function () {
        function DiagnosticsLogger(ioHost) {
            this.ioHost = ioHost;
        }
        DiagnosticsLogger.prototype.information = function () {
            return false;
        };
        DiagnosticsLogger.prototype.debug = function () {
            return false;
        };
        DiagnosticsLogger.prototype.warning = function () {
            return false;
        };
        DiagnosticsLogger.prototype.error = function () {
            return false;
        };
        DiagnosticsLogger.prototype.fatal = function () {
            return false;
        };
        DiagnosticsLogger.prototype.log = function (s) {
            this.ioHost.stdout.WriteLine(s);
        };
        return DiagnosticsLogger;
    })();
    TypeScript.DiagnosticsLogger = DiagnosticsLogger;

    var FileLogger = (function () {
        function FileLogger(ioHost) {
            this.ioHost = ioHost;
            var file = "tsc." + Date.now() + ".log";

            this.fileName = this.ioHost.resolvePath(file);
        }
        FileLogger.prototype.information = function () {
            return false;
        };
        FileLogger.prototype.debug = function () {
            return false;
        };
        FileLogger.prototype.warning = function () {
            return false;
        };
        FileLogger.prototype.error = function () {
            return false;
        };
        FileLogger.prototype.fatal = function () {
            return false;
        };
        FileLogger.prototype.log = function (s) {
            this.ioHost.appendFile(this.fileName, s + '\r\n');
        };
        return FileLogger;
    })();
    TypeScript.FileLogger = FileLogger;

    var BatchCompiler = (function () {
        function BatchCompiler(ioHost) {
            this.ioHost = ioHost;
            this.compilerVersion = "1.0.1.0";
            this.inputFiles = [];
            this.resolvedFiles = [];
            this.fileNameToSourceFile = new TypeScript.StringHashTable();
            this.hasErrors = false;
            this.logger = null;
            this.fileExistsCache = TypeScript.createIntrinsicsObject();
            // For performance reasons we cache the results of resolvePath.  This avoids costly lookup
            // on the disk once we've already resolved a path once.
            this.resolvePathCache = TypeScript.createIntrinsicsObject();
        }
        // Begin batch compilation
        BatchCompiler.prototype.batchCompile = function () {
            var _this = this;
            var start = new Date().getTime();

            TypeScript.CompilerDiagnostics.diagnosticWriter = { Alert: function (s) {
                    _this.ioHost.printLine(s);
                } };

            // Parse command line options
            if (this.parseOptions()) {
                if (this.compilationSettings.createFileLog()) {
                    this.logger = new FileLogger(this.ioHost);
                } else if (this.compilationSettings.gatherDiagnostics()) {
                    this.logger = new DiagnosticsLogger(this.ioHost);
                } else {
                    this.logger = new TypeScript.NullLogger();
                }

                if (this.compilationSettings.watch()) {
                    // Watch will cause the program to stick around as long as the files exist
                    this.watchFiles();
                    return;
                }

                // Resolve the compilation environemnt
                this.resolve();

                this.compile();

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
                    this.inputFiles.forEach(function (file) {
                        _this.logger.log(" " + file);
                    });

                    this.logger.log("");

                    this.logger.log("Resolved Files:");
                    this.resolvedFiles.forEach(function (file) {
                        file.importedFiles.forEach(function (file) {
                            _this.logger.log(" " + file);
                        });
                        file.referencedFiles.forEach(function (file) {
                            _this.logger.log(" " + file);
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
            }

            // Exit with the appropriate error code
            this.ioHost.quit(this.hasErrors ? 1 : 0);
        };

        BatchCompiler.prototype.resolve = function () {
            var _this = this;
            // Resolve file dependencies, if requested
            var includeDefaultLibrary = !this.compilationSettings.noLib();
            var resolvedFiles = [];

            var start = new Date().getTime();

            if (!this.compilationSettings.noResolve()) {
                // Resolve references
                var resolutionResults = TypeScript.ReferenceResolver.resolve(this.inputFiles, this, this.compilationSettings.useCaseSensitiveFileResolution());
                resolvedFiles = resolutionResults.resolvedFiles;

                // Only include the library if useDefaultLib is set to true and did not see any 'no-default-lib' comments
                includeDefaultLibrary = !this.compilationSettings.noLib() && !resolutionResults.seenNoDefaultLibTag;

                // Populate any diagnostic messages generated during resolution
                resolutionResults.diagnostics.forEach(function (d) {
                    return _this.addDiagnostic(d);
                });
            } else {
                for (var i = 0, n = this.inputFiles.length; i < n; i++) {
                    var inputFile = this.inputFiles[i];
                    var referencedFiles = [];
                    var importedFiles = [];

                    // If declaration files are going to be emitted, preprocess the file contents and add in referenced files as well
                    if (this.compilationSettings.generateDeclarationFiles()) {
                        var references = TypeScript.getReferencedFiles(inputFile, this.getScriptSnapshot(inputFile));
                        for (var j = 0; j < references.length; j++) {
                            referencedFiles.push(references[j].path);
                        }

                        inputFile = this.resolvePath(inputFile);
                    }

                    resolvedFiles.push({
                        path: inputFile,
                        referencedFiles: referencedFiles,
                        importedFiles: importedFiles
                    });
                }
            }

            var defaultLibStart = new Date().getTime();
            if (includeDefaultLibrary) {
                var libraryResolvedFile = {
                    path: this.getDefaultLibraryFilePath(),
                    referencedFiles: [],
                    importedFiles: []
                };

                // Prepend the library to the resolved list
                resolvedFiles = [libraryResolvedFile].concat(resolvedFiles);
            }
            TypeScript.fileResolutionGetDefaultLibraryTime += new Date().getTime() - defaultLibStart;

            this.resolvedFiles = resolvedFiles;

            TypeScript.fileResolutionTime = new Date().getTime() - start;
        };

        // Returns true if compilation failed from some reason.
        BatchCompiler.prototype.compile = function () {
            var _this = this;
            var compiler = new TypeScript.TypeScriptCompiler(this.logger, this.compilationSettings);

            this.resolvedFiles.forEach(function (resolvedFile) {
                var sourceFile = _this.getSourceFile(resolvedFile.path);
                compiler.addFile(resolvedFile.path, sourceFile.scriptSnapshot, sourceFile.byteOrderMark, /*version:*/ 0, false, resolvedFile.referencedFiles);
            });

            for (var it = compiler.compile(function (path) {
                return _this.resolvePath(path);
            }); it.moveNext();) {
                var result = it.current();

                result.diagnostics.forEach(function (d) {
                    return _this.addDiagnostic(d);
                });
                if (!this.tryWriteOutputFiles(result.outputFiles)) {
                    return;
                }
            }
        };

        // Parse command line options
        BatchCompiler.prototype.parseOptions = function () {
            var _this = this;
            var opts = new TypeScript.OptionsParser(this.ioHost, this.compilerVersion);

            var mutableSettings = new TypeScript.CompilationSettings();
            opts.option('out', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Concatenate_and_emit_output_to_single_file,
                    args: null
                },
                type: TypeScript.DiagnosticCode.file2,
                set: function (str) {
                    mutableSettings.outFileOption = str;
                }
            });

            opts.option('outDir', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Redirect_output_structure_to_the_directory,
                    args: null
                },
                type: TypeScript.DiagnosticCode.DIRECTORY,
                set: function (str) {
                    mutableSettings.outDirOption = str;
                }
            });

            opts.flag('sourcemap', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Generates_corresponding_0_file,
                    args: ['.map']
                },
                set: function () {
                    mutableSettings.mapSourceFiles = true;
                }
            });

            opts.option('mapRoot', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Specifies_the_location_where_debugger_should_locate_map_files_instead_of_generated_locations,
                    args: null
                },
                type: TypeScript.DiagnosticCode.LOCATION,
                set: function (str) {
                    mutableSettings.mapRoot = str;
                }
            });

            opts.option('sourceRoot', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Specifies_the_location_where_debugger_should_locate_TypeScript_files_instead_of_source_locations,
                    args: null
                },
                type: TypeScript.DiagnosticCode.LOCATION,
                set: function (str) {
                    mutableSettings.sourceRoot = str;
                }
            });

            opts.flag('declaration', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Generates_corresponding_0_file,
                    args: ['.d.ts']
                },
                set: function () {
                    mutableSettings.generateDeclarationFiles = true;
                }
            }, 'd');

            if (this.ioHost.watchFile) {
                opts.flag('watch', {
                    usage: {
                        locCode: TypeScript.DiagnosticCode.Watch_input_files,
                        args: null
                    },
                    set: function () {
                        mutableSettings.watch = true;
                    }
                }, 'w');
            }

            opts.flag('propagateEnumConstants', {
                experimental: true,
                set: function () {
                    mutableSettings.propagateEnumConstants = true;
                }
            });

            opts.flag('removeComments', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Do_not_emit_comments_to_output,
                    args: null
                },
                set: function () {
                    mutableSettings.removeComments = true;
                }
            });

            opts.flag('noResolve', {
                experimental: true,
                usage: {
                    locCode: TypeScript.DiagnosticCode.Skip_resolution_and_preprocessing,
                    args: null
                },
                set: function () {
                    mutableSettings.noResolve = true;
                }
            });

            opts.flag('noLib', {
                experimental: true,
                set: function () {
                    mutableSettings.noLib = true;
                }
            });

            opts.flag('diagnostics', {
                experimental: true,
                set: function () {
                    mutableSettings.gatherDiagnostics = true;
                }
            });

            opts.flag('logFile', {
                experimental: true,
                set: function () {
                    mutableSettings.createFileLog = true;
                }
            });

            opts.option('target', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Specify_ECMAScript_target_version_0_default_or_1,
                    args: ['ES3', 'ES5']
                },
                type: TypeScript.DiagnosticCode.VERSION,
                set: function (type) {
                    type = type.toLowerCase();

                    if (type === 'es3') {
                        mutableSettings.codeGenTarget = 0 /* EcmaScript3 */;
                    } else if (type === 'es5') {
                        mutableSettings.codeGenTarget = 1 /* EcmaScript5 */;
                    } else {
                        _this.addDiagnostic(new TypeScript.Diagnostic(null, null, 0, 0, TypeScript.DiagnosticCode.ECMAScript_target_version_0_not_supported_Specify_a_valid_target_version_1_default_or_2, [type, "ES3", "ES5"]));
                    }
                }
            }, 't');

            opts.option('module', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Specify_module_code_generation_0_or_1,
                    args: ['commonjs', 'amd']
                },
                type: TypeScript.DiagnosticCode.KIND,
                set: function (type) {
                    type = type.toLowerCase();

                    if (type === 'commonjs') {
                        mutableSettings.moduleGenTarget = 1 /* Synchronous */;
                    } else if (type === 'amd') {
                        mutableSettings.moduleGenTarget = 2 /* Asynchronous */;
                    } else {
                        _this.addDiagnostic(new TypeScript.Diagnostic(null, null, 0, 0, TypeScript.DiagnosticCode.Module_code_generation_0_not_supported, [type]));
                    }
                }
            }, 'm');

            var needsHelp = false;
            opts.flag('help', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Print_this_message,
                    args: null
                },
                set: function () {
                    needsHelp = true;
                }
            }, 'h');

            opts.flag('useCaseSensitiveFileResolution', {
                experimental: true,
                set: function () {
                    mutableSettings.useCaseSensitiveFileResolution = true;
                }
            });
            var shouldPrintVersionOnly = false;
            opts.flag('version', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Print_the_compiler_s_version_0,
                    args: [this.compilerVersion]
                },
                set: function () {
                    shouldPrintVersionOnly = true;
                }
            }, 'v');

            var locale = null;
            opts.option('locale', {
                experimental: true,
                usage: {
                    locCode: TypeScript.DiagnosticCode.Specify_locale_for_errors_and_messages_For_example_0_or_1,
                    args: ['en', 'ja-jp']
                },
                type: TypeScript.DiagnosticCode.STRING,
                set: function (value) {
                    locale = value;
                }
            });

            opts.flag('noImplicitAny', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Warn_on_expressions_and_declarations_with_an_implied_any_type,
                    args: null
                },
                set: function () {
                    mutableSettings.noImplicitAny = true;
                }
            });

            if (TypeScript.Environment.supportsCodePage()) {
                opts.option('codepage', {
                    usage: {
                        locCode: TypeScript.DiagnosticCode.Specify_the_codepage_to_use_when_opening_source_files,
                        args: null
                    },
                    type: TypeScript.DiagnosticCode.NUMBER,
                    set: function (arg) {
                        mutableSettings.codepage = parseInt(arg, 10);
                    }
                });
            }

            opts.parse(this.ioHost.arguments);

            this.compilationSettings = TypeScript.ImmutableCompilationSettings.fromCompilationSettings(mutableSettings);

            if (locale) {
                if (!this.setLocale(locale)) {
                    return false;
                }
            }

            this.inputFiles.push.apply(this.inputFiles, opts.unnamed);

            if (shouldPrintVersionOnly) {
                opts.printVersion();
                return false;
            } else if (this.inputFiles.length === 0 || needsHelp) {
                opts.printUsage();
                return false;
            }

            return !this.hasErrors;
        };

        BatchCompiler.prototype.setLocale = function (locale) {
            var matchResult = /^([a-z]+)([_\-]([a-z]+))?$/.exec(locale.toLowerCase());
            if (!matchResult) {
                this.addDiagnostic(new TypeScript.Diagnostic(null, null, 0, 0, TypeScript.DiagnosticCode.Locale_must_be_of_the_form_language_or_language_territory_For_example_0_or_1, ['en', 'ja-jp']));
                return false;
            }

            var language = matchResult[1];
            var territory = matchResult[3];

            // First try the entire locale, then fall back to just language if that's all we have.
            if (!this.setLanguageAndTerritory(language, territory) && !this.setLanguageAndTerritory(language, null)) {
                this.addDiagnostic(new TypeScript.Diagnostic(null, null, 0, 0, TypeScript.DiagnosticCode.Unsupported_locale_0, [locale]));
                return false;
            }

            return true;
        };

        BatchCompiler.prototype.setLanguageAndTerritory = function (language, territory) {
            var compilerFilePath = this.ioHost.getExecutingFilePath();
            var containingDirectoryPath = this.ioHost.dirName(compilerFilePath);

            var filePath = TypeScript.IOUtils.combine(containingDirectoryPath, language);
            if (territory) {
                filePath = filePath + "-" + territory;
            }

            filePath = this.resolvePath(TypeScript.IOUtils.combine(filePath, "diagnosticMessages.generated.json"));

            if (!this.fileExists(filePath)) {
                return false;
            }

            var fileContents = this.ioHost.readFile(filePath, this.compilationSettings.codepage());
            TypeScript.LocalizedDiagnosticMessages = JSON.parse(fileContents.contents);
            return true;
        };

        // Handle -watch switch
        BatchCompiler.prototype.watchFiles = function () {
            var _this = this;
            if (!this.ioHost.watchFile) {
                this.addDiagnostic(new TypeScript.Diagnostic(null, null, 0, 0, TypeScript.DiagnosticCode.Current_host_does_not_support_0_option, ['-w[atch]']));
                return;
            }

            var lastResolvedFileSet = [];
            var watchers = {};
            var firstTime = true;

            var addWatcher = function (fileName) {
                if (!watchers[fileName]) {
                    var watcher = _this.ioHost.watchFile(fileName, onWatchedFileChange);
                    watchers[fileName] = watcher;
                } else {
                    TypeScript.CompilerDiagnostics.debugPrint("Cannot watch file, it is already watched.");
                }
            };

            var removeWatcher = function (fileName) {
                if (watchers[fileName]) {
                    watchers[fileName].close();
                    delete watchers[fileName];
                } else {
                    TypeScript.CompilerDiagnostics.debugPrint("Cannot stop watching file, it is not being watched.");
                }
            };

            var onWatchedFileChange = function () {
                // Clean errors for previous compilation
                _this.hasErrors = false;

                // Clear out any source file data we've cached.
                _this.fileNameToSourceFile = new TypeScript.StringHashTable();

                // Resolve file dependencies, if requested
                _this.resolve();

                // Check if any new files were added to the environment as a result of the file change
                var oldFiles = lastResolvedFileSet;
                var newFiles = _this.resolvedFiles.map(function (resolvedFile) {
                    return resolvedFile.path;
                }).sort();

                var i = 0, j = 0;
                while (i < oldFiles.length && j < newFiles.length) {
                    var compareResult = oldFiles[i].localeCompare(newFiles[j]);
                    if (compareResult === 0) {
                        // No change here
                        i++;
                        j++;
                    } else if (compareResult < 0) {
                        // Entry in old list does not exist in the new one, it was removed
                        removeWatcher(oldFiles[i]);
                        i++;
                    } else {
                        // Entry in new list does exist in the new one, it was added
                        addWatcher(newFiles[j]);
                        j++;
                    }
                }

                for (var k = i; k < oldFiles.length; k++) {
                    removeWatcher(oldFiles[k]);
                }

                for (k = j; k < newFiles.length; k++) {
                    addWatcher(newFiles[k]);
                }

                // Update the state
                lastResolvedFileSet = newFiles;

                // Print header
                if (!firstTime) {
                    var fileNames = "";
                    for (var k = 0; k < lastResolvedFileSet.length; k++) {
                        fileNames += TypeScript.Environment.newLine + "    " + lastResolvedFileSet[k];
                    }
                    _this.ioHost.printLine(TypeScript.getLocalizedText(TypeScript.DiagnosticCode.NL_Recompiling_0, [fileNames]));
                } else {
                    firstTime = false;
                }

                // Trigger a new compilation
                _this.compile();
            };

            // Switch to using stdout for all error messages
            this.ioHost.stderr = this.ioHost.stdout;

            onWatchedFileChange();
        };

        BatchCompiler.prototype.getSourceFile = function (fileName) {
            var sourceFile = this.fileNameToSourceFile.lookup(fileName);
            if (!sourceFile) {
                // Attempt to read the file
                var fileInformation;

                try  {
                    fileInformation = this.ioHost.readFile(fileName, this.compilationSettings.codepage());
                } catch (e) {
                    this.addDiagnostic(new TypeScript.Diagnostic(null, null, 0, 0, TypeScript.DiagnosticCode.Cannot_read_file_0_1, [fileName, e.message]));
                    fileInformation = new TypeScript.FileInformation("", 0 /* None */);
                }

                var snapshot = TypeScript.ScriptSnapshot.fromString(fileInformation.contents);
                var sourceFile = new SourceFile(snapshot, fileInformation.byteOrderMark);
                this.fileNameToSourceFile.add(fileName, sourceFile);
            }

            return sourceFile;
        };

        BatchCompiler.prototype.getDefaultLibraryFilePath = function () {
            var compilerFilePath = this.ioHost.getExecutingFilePath();
            var containingDirectoryPath = this.ioHost.dirName(compilerFilePath);
            var libraryFilePath = this.resolvePath(TypeScript.IOUtils.combine(containingDirectoryPath, "lib.d.ts"));

            return libraryFilePath;
        };

        /// IReferenceResolverHost methods
        BatchCompiler.prototype.getScriptSnapshot = function (fileName) {
            return this.getSourceFile(fileName).scriptSnapshot;
        };

        BatchCompiler.prototype.resolveRelativePath = function (path, directory) {
            var start = new Date().getTime();

            var unQuotedPath = TypeScript.stripStartAndEndQuotes(path);
            var normalizedPath;

            if (TypeScript.isRooted(unQuotedPath) || !directory) {
                normalizedPath = unQuotedPath;
            } else {
                normalizedPath = TypeScript.IOUtils.combine(directory, unQuotedPath);
            }

            // get the absolute path
            normalizedPath = this.resolvePath(normalizedPath);

            // Switch to forward slashes
            normalizedPath = TypeScript.switchToForwardSlashes(normalizedPath);

            return normalizedPath;
        };

        BatchCompiler.prototype.fileExists = function (path) {
            var exists = this.fileExistsCache[path];
            if (exists === undefined) {
                var start = new Date().getTime();
                exists = this.ioHost.fileExists(path);
                this.fileExistsCache[path] = exists;
                TypeScript.compilerFileExistsTime += new Date().getTime() - start;
            }

            return exists;
        };

        BatchCompiler.prototype.getParentDirectory = function (path) {
            var start = new Date().getTime();
            var result = this.ioHost.dirName(path);
            TypeScript.compilerDirectoryNameTime += new Date().getTime() - start;

            return result;
        };

        BatchCompiler.prototype.addDiagnostic = function (diagnostic) {
            var _this = this;
            var diagnosticInfo = diagnostic.info();
            if (diagnosticInfo.category === 1 /* Error */) {
                this.hasErrors = true;
            }

            this.ioHost.stderr.Write(TypeScript.TypeScriptCompiler.getFullDiagnosticText(diagnostic, function (path) {
                return _this.resolvePath(path);
            }));
        };

        BatchCompiler.prototype.tryWriteOutputFiles = function (outputFiles) {
            for (var i = 0, n = outputFiles.length; i < n; i++) {
                var outputFile = outputFiles[i];

                try  {
                    this.writeFile(outputFile.name, outputFile.text, outputFile.writeByteOrderMark);
                } catch (e) {
                    this.addDiagnostic(new TypeScript.Diagnostic(outputFile.name, null, 0, 0, TypeScript.DiagnosticCode.Emit_Error_0, [e.message]));
                    return false;
                }
            }

            return true;
        };

        BatchCompiler.prototype.writeFile = function (fileName, contents, writeByteOrderMark) {
            var start = new Date().getTime();
            TypeScript.IOUtils.writeFileAndFolderStructure(this.ioHost, fileName, contents, writeByteOrderMark);
            TypeScript.emitWriteFileTime += new Date().getTime() - start;
        };

        BatchCompiler.prototype.directoryExists = function (path) {
            var start = new Date().getTime();
            var result = this.ioHost.directoryExists(path);
            TypeScript.compilerDirectoryExistsTime += new Date().getTime() - start;
            return result;
        };

        BatchCompiler.prototype.resolvePath = function (path) {
            var cachedValue = this.resolvePathCache[path];
            if (!cachedValue) {
                var start = new Date().getTime();
                cachedValue = this.ioHost.resolvePath(path);
                this.resolvePathCache[path] = cachedValue;
                TypeScript.compilerResolvePathTime += new Date().getTime() - start;
            }

            return cachedValue;
        };
        return BatchCompiler;
    })();
    TypeScript.BatchCompiler = BatchCompiler;
})(TypeScript || (TypeScript = {}));
var TypeDoc;
(function (TypeDoc) {
    /**
    * Base class of all events.
    *
    * Events are emitted by [[EventDispatcher]] and are passed to all
    * handlers registered for the associated event name.
    */
    var Event = (function () {
        function Event() {
        }
        /**
        * Stop the propagation of this event. Remaining event handlers will not be executed.
        */
        Event.prototype.stopPropagation = function () {
            this.isPropagationStopped = true;
        };

        /**
        * Prevent the default action associated with this event from being executed.
        */
        Event.prototype.preventDefault = function () {
            this.isDefaultPrevented = true;
        };
        return Event;
    })();
    TypeDoc.Event = Event;

    /**
    * Base class of all objects dispatching events.
    *
    * Events are dispatched by calling [[EventDispatcher.dispatch]]. Events must have a name and
    * they can carry additional arguments that are passed to all handlers. The first argument can
    * be an instance of [[Event]] providing additional functionality.
    */
    var EventDispatcher = (function () {
        function EventDispatcher() {
        }
        /**
        * Dispatch an event with the given event name.
        *
        * @param event  The name of the event to dispatch.
        * @param args   Additional arguments to pass to the handlers.
        */
        EventDispatcher.prototype.dispatch = function (event) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            if (!this.listeners)
                return;
            if (!this.listeners[event])
                return;

            var obj;
            if (args.length > 0 && args[0] instanceof Event) {
                obj = args[0];
                obj.isDefaultPrevented = false;
                obj.isPropagationStopped = false;
            }

            var listeners = this.listeners[event];
            for (var i = 0, c = listeners.length; i < c; i++) {
                var listener = listeners[i];
                listener.handler.apply(listener.scope, args);

                if (obj && obj.isPropagationStopped)
                    break;
            }
        };

        /**
        * Register an event handler for the given event name.
        *
        * @param event     The name of the event the handler should be registered to.
        * @param handler   The callback that should be invoked.
        * @param scope     The scope the callback should be executed in.
        * @param priority  A numeric value describing the priority of the handler. Handlers
        *                  with higher priority will be executed earlier.
        */
        EventDispatcher.prototype.on = function (event, handler, scope, priority) {
            if (typeof scope === "undefined") { scope = null; }
            if (typeof priority === "undefined") { priority = 0; }
            if (!this.listeners)
                this.listeners = {};
            if (!this.listeners[event])
                this.listeners[event] = [];

            var listeners = this.listeners[event];
            listeners.push({
                handler: handler,
                scope: scope,
                priority: priority
            });

            listeners.sort(function (a, b) {
                return b.priority - a.priority;
            });
        };

        /**
        * Remove an event handler.
        *
        * @param event    The name of the event whose handlers should be removed.
        * @param handler  The callback that should be removed.
        * @param scope    The scope of the callback that should be removed.
        */
        EventDispatcher.prototype.off = function (event, handler, scope) {
            var _this = this;
            if (typeof event === "undefined") { event = null; }
            if (typeof handler === "undefined") { handler = null; }
            if (typeof scope === "undefined") { scope = null; }
            if (!this.listeners) {
                return;
            }

            if (!event && !handler && !scope) {
                this.listeners = null;
            } else {
                var offEvent = function (event) {
                    if (!_this.listeners[event])
                        return;
                    var listeners = _this.listeners[event];
                    var index = 0, count = listeners.length;
                    while (index < count) {
                        var listener = listeners[index];
                        if ((handler && listener.handler != handler) || (scope && listener.scope != scope)) {
                            index += 1;
                        } else {
                            listeners.splice(index, 1);
                            count -= 1;
                        }
                    }

                    if (listeners.length == 0) {
                        delete _this.listeners[event];
                    }
                };

                if (!event) {
                    for (event in this.listeners) {
                        if (!this.listeners.hasOwnProperty(event))
                            continue;
                        offEvent(event);
                    }
                } else {
                    offEvent(event);
                }
            }
        };
        return EventDispatcher;
    })();
    TypeDoc.EventDispatcher = EventDispatcher;
})(TypeDoc || (TypeDoc = {}));
/// <reference path="../typescript/tsc.ts" />
/// <reference path="EventDispatcher.ts" />
/**
* The TypeDoc main module and namespace.
*
* The [[Application]] class holds the core logic of the cli application. All code related
* to resolving reflections is stored in [[TypeDoc.Factories]], the actual data models can be found
* in [[TypeDoc.Models]] and the final rendering is defined in [[TypeDoc.Output]].
*/
var TypeDoc;
(function (TypeDoc) {
    /**
    * List of known log levels. Used to specify the urgency of a log message.
    *
    * @see [[Application.log]]
    */
    (function (LogLevel) {
        LogLevel[LogLevel["Verbose"] = 0] = "Verbose";
        LogLevel[LogLevel["Info"] = 1] = "Info";
        LogLevel[LogLevel["Warn"] = 2] = "Warn";
        LogLevel[LogLevel["Error"] = 3] = "Error";
    })(TypeDoc.LogLevel || (TypeDoc.LogLevel = {}));
    var LogLevel = TypeDoc.LogLevel;

    

    /**
    * The default TypeDoc main application class.
    *
    * This class holds the two main components of TypeDoc, the [[Dispatcher]] and
    * the [[Renderer]]. When running TypeDoc, first the [[Dispatcher]] is invoked which
    * generates a [[ProjectReflection]] from the passed in source files. The
    * [[ProjectReflection]] is a hierarchical model representation of the TypeScript
    * project. Afterwards the model is passed to the [[Renderer]] which uses an instance
    * of [[BaseTheme]] to generate the final documentation.
    *
    * Both the [[Dispatcher]] and the [[Renderer]] are subclasses of the [[EventDispatcher]]
    * and emit a series of events while processing the project. Subscribe to these Events
    * to control the application flow or alter the output.
    */
    var Application = (function () {
        /**
        * Create a new Application instance.
        *
        * @param settings  The settings used by the dispatcher and the renderer.
        */
        function Application(settings) {
            if (typeof settings === "undefined") { settings = new TypeDoc.Settings(); }
            /**
            * Has an error been raised through the log method?
            */
            this.hasErrors = false;
            this.settings = settings;
            this.dispatcher = new TypeDoc.Factories.Dispatcher(this);
            this.renderer = new TypeDoc.Output.Renderer(this);
        }
        /**
        * Run TypeDoc from the command line.
        */
        Application.prototype.runFromCommandline = function () {
            if (this.settings.readFromCommandline(this)) {
                this.log(Util.format('Using TypeScript %s from %s', this.getTypeScriptVersion(), typeScriptPath), 0 /* Verbose */);

                this.settings.expandInputFiles();
                this.generate(this.settings.inputFiles, this.settings.outputDirectory);

                if (!this.hasErrors) {
                    this.log(Util.format('Documentation generated at %s', this.settings.outputDirectory));
                }
            }
        };

        /**
        * Print a log message.
        *
        * @param message  The message itself.
        * @param level    The urgency of the log message.
        */
        Application.prototype.log = function (message, level) {
            if (typeof level === "undefined") { level = 1 /* Info */; }
            if (level == 3 /* Error */) {
                this.hasErrors = true;
            }

            if (level != 0 /* Verbose */ || this.settings.verbose) {
                console.log(message);
            }
        };

        /**
        * Run the documentation generator for the given set of files.
        *
        * @param inputFiles  A list of source files whose documentation should be generated.
        * @param outputDirectory  The path of the directory the documentation should be written to.
        */
        Application.prototype.generate = function (inputFiles, outputDirectory) {
            var project = this.dispatcher.createProject(inputFiles);
            this.renderer.render(project, outputDirectory);
        };

        /**
        * Return the version number of the loaded TypeScript compiler.
        *
        * @returns The version number of the loaded TypeScript package.
        */
        Application.prototype.getTypeScriptVersion = function () {
            var json = JSON.parse(FS.readFileSync(Path.join(typeScriptPath, '..', 'package.json'), 'utf8'));
            return json.version;
        };
        Application.VERSION = '0.1.1';
        return Application;
    })();
    TypeDoc.Application = Application;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    /**
    * Alias to TypeScript.LanguageVersion
    *
    * @resolve
    */
    TypeDoc.CodeGenTarget = TypeScript.LanguageVersion;

    /**
    * Alias to TypeScript.ModuleGenTarget
    *
    * @resolve
    */
    TypeDoc.ModuleGenTarget = TypeScript.ModuleGenTarget;

    /**
    * Holds all settings used by TypeDoc.
    */
    var Settings = (function () {
        /**
        * Create a new Settings instance.
        */
        function Settings() {
            /**
            * The path of the theme that should be used.
            */
            this.theme = 'default';
            /**
            * Should declaration files be documented?
            */
            this.includeDeclarations = false;
            /**
            * Should externally resolved TypeScript files be ignored?
            */
            this.excludeExternals = false;
            /**
            * Optional site name for Google Analytics. Defaults to `auto`.
            */
            this.googleAnalyticsSite = 'auto';
            /**
            * Does the user want to display the help message?
            */
            this.needsHelp = false;
            /**
            * Does the user want to know the version number?
            */
            this.shouldPrintVersionOnly = false;
            /**
            * Should we hide the TypeDoc link at the end of the page?
            */
            this.hideGenerator = false;
            /**
            * Should verbose messages be printed?
            */
            this.verbose = false;
            this.compiler = new TypeScript.CompilationSettings();
        }
        /**
        * Read the settings from command line arguments.
        */
        Settings.prototype.readFromCommandline = function (application) {
            var opts = this.createOptionsParser();

            try  {
                opts.parse(TypeScript.IO.arguments);
            } catch (e) {
                application.log(e.message, 3 /* Error */);
                return false;
            }

            this.inputFiles = opts.unnamed;

            if (this.shouldPrintVersionOnly) {
                opts.printVersion();
                return false;
            } else if (this.inputFiles.length === 0 || this.needsHelp) {
                opts.printUsage();
                return false;
            }

            return true;
        };

        /**
        * Expand the list of input files.
        *
        * Searches for directories in the input files list and replaces them with a
        * listing of all TypeScript files within them. One may use the ```--excludePattern``` option
        * to filter out files with a pattern.
        */
        Settings.prototype.expandInputFiles = function () {
            var exclude, files = [];
            if (this.excludePattern) {
                exclude = new Minimatch.Minimatch(this.excludePattern);
            }

            function add(dirname) {
                FS.readdirSync(dirname).forEach(function (file) {
                    var realpath = Path.join(dirname, file);
                    if (FS.statSync(realpath).isDirectory()) {
                        add(realpath);
                    } else if (/\.ts$/.test(realpath)) {
                        if (exclude && exclude.match(realpath.replace(/\\/g, '/'))) {
                            return;
                        }

                        files.push(realpath);
                    }
                });
            }

            this.inputFiles.forEach(function (file) {
                file = Path.resolve(file);
                if (FS.statSync(file).isDirectory()) {
                    add(file);
                } else {
                    files.push(file);
                }
            });

            this.inputFiles = files;
        };

        /**
        * Create and initialize an instance of OptionsParser to read command line arguments.
        *
        * This function partially contains the options found in [[TypeScript.BatchCompiler.parseOptions]].
        * When updating the TypeScript compiler, new options should be copied over here.
        *
        * @returns An initialized OptionsParser instance.
        */
        Settings.prototype.createOptionsParser = function () {
            var _this = this;
            var opts = new TypeScript.OptionsParser(TypeScript.IO, TypeDoc.Application.VERSION);

            opts.option('out', {
                usage: {
                    locCode: 'Specifies the location the documentation should be written to.',
                    args: null
                },
                type: TypeScript.DiagnosticCode.DIRECTORY,
                set: function (str) {
                    _this.outputDirectory = Path.resolve(str);
                }
            });

            opts.option('theme', {
                usage: {
                    locCode: 'Specify the path to the theme that should be used.',
                    args: null
                },
                set: function (str) {
                    _this.theme = str;
                }
            });

            opts.option('exclude', {
                usage: {
                    locCode: 'Define a pattern for excluded files when specifying paths.',
                    args: null
                },
                set: function (str) {
                    _this.excludePattern = str;
                }
            });

            opts.flag('includeDeclarations', {
                usage: {
                    locCode: 'Turn on parsing of .d.ts declaration files.',
                    args: null
                },
                set: function () {
                    _this.includeDeclarations = true;
                }
            });

            opts.option('externalPattern', {
                usage: {
                    locCode: 'Define a pattern for files that should be considered being external.',
                    args: null
                },
                set: function (str) {
                    _this.externalPattern = str;
                }
            });

            opts.option('readme', {
                usage: {
                    locCode: 'Path to the readme file that should be displayed on the index page. Pass `none` ' + 'to disable the index page and start the documentation on the globals page.',
                    args: null
                },
                set: function (str) {
                    if (str.toLowerCase() == 'none') {
                        _this.readme = 'none';
                    } else {
                        _this.readme = str;
                    }
                }
            });

            opts.flag('excludeExternals', {
                usage: {
                    locCode: 'Prevent externally resolved TypeScript files from being documented.',
                    args: null
                },
                set: function () {
                    _this.excludeExternals = true;
                }
            });

            opts.option('name', {
                usage: {
                    locCode: 'Set the name of the project that will be used in the header of the template.',
                    args: null
                },
                set: function (str) {
                    _this.name = str;
                }
            });

            opts.option('gaID', {
                usage: {
                    locCode: 'Set the Google Analytics tracking ID and activate tracking code.',
                    args: null
                },
                set: function (str) {
                    _this.googleAnalyticsID = str;
                }
            });

            opts.option('gaSite', {
                usage: {
                    locCode: 'Set the site name for Google Analytics. Defaults to `auto`.',
                    args: null
                },
                set: function (str) {
                    _this.googleAnalyticsSite = str;
                }
            });

            opts.flag('hideGenerator', {
                usage: {
                    locCode: 'Do not print the TypeDoc link at the end of the page.',
                    args: null
                },
                set: function (str) {
                    _this.hideGenerator = true;
                }
            });

            opts.flag('verbose', {
                usage: {
                    locCode: 'Print more information while TypeDoc is running.',
                    args: null
                },
                set: function (str) {
                    _this.verbose = true;
                }
            });

            // Copied from TypeScript
            opts.option('mapRoot', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Specifies_the_location_where_debugger_should_locate_map_files_instead_of_generated_locations,
                    args: null
                },
                type: TypeScript.DiagnosticCode.LOCATION,
                set: function (str) {
                    _this.compiler.mapRoot = str;
                }
            });

            opts.flag('propagateEnumConstants', {
                experimental: true,
                set: function () {
                    _this.compiler.propagateEnumConstants = true;
                }
            });

            opts.flag('noResolve', {
                experimental: true,
                usage: {
                    locCode: TypeScript.DiagnosticCode.Skip_resolution_and_preprocessing,
                    args: null
                },
                set: function () {
                    _this.compiler.noResolve = true;
                }
            });

            opts.flag('noLib', {
                experimental: true,
                set: function () {
                    _this.compiler.noLib = true;
                }
            });

            opts.flag('diagnostics', {
                experimental: true,
                set: function () {
                    _this.compiler.gatherDiagnostics = true;
                }
            });

            opts.flag('logFile', {
                experimental: true,
                set: function () {
                    _this.compiler.createFileLog = true;
                }
            });

            opts.option('target', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Specify_ECMAScript_target_version_0_default_or_1,
                    args: ['ES3', 'ES5']
                },
                type: TypeScript.DiagnosticCode.VERSION,
                set: function (type) {
                    type = type.toLowerCase();

                    if (type === 'es3') {
                        _this.compiler.codeGenTarget = 0 /* EcmaScript3 */;
                    } else if (type === 'es5') {
                        _this.compiler.codeGenTarget = 1 /* EcmaScript5 */;
                    } else {
                        throw new Error(TypeScript.DiagnosticCode.ECMAScript_target_version_0_not_supported_Specify_a_valid_target_version_1_default_or_2);
                    }
                }
            }, 't');

            opts.option('module', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Specify_module_code_generation_0_or_1,
                    args: ['commonjs', 'amd']
                },
                type: TypeScript.DiagnosticCode.KIND,
                set: function (type) {
                    type = type.toLowerCase();

                    if (type === 'commonjs') {
                        _this.compiler.moduleGenTarget = 1 /* Synchronous */;
                    } else if (type === 'amd') {
                        _this.compiler.moduleGenTarget = 2 /* Asynchronous */;
                    } else {
                        throw new Error(TypeScript.DiagnosticCode.Module_code_generation_0_not_supported);
                    }
                }
            }, 'm');

            opts.flag('help', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Print_this_message,
                    args: null
                },
                set: function () {
                    _this.needsHelp = true;
                }
            }, 'h');

            opts.flag('useCaseSensitiveFileResolution', {
                experimental: true,
                set: function () {
                    _this.compiler.useCaseSensitiveFileResolution = true;
                }
            });

            opts.flag('version', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Print_the_compiler_s_version_0,
                    args: [TypeDoc.Application.VERSION]
                },
                set: function () {
                    _this.shouldPrintVersionOnly = true;
                }
            }, 'v');

            opts.flag('noImplicitAny', {
                usage: {
                    locCode: TypeScript.DiagnosticCode.Warn_on_expressions_and_declarations_with_an_implied_any_type,
                    args: null
                },
                set: function () {
                    _this.compiler.noImplicitAny = true;
                }
            });

            if (TypeScript.Environment.supportsCodePage()) {
                opts.option('codepage', {
                    usage: {
                        locCode: TypeScript.DiagnosticCode.Specify_the_codepage_to_use_when_opening_source_files,
                        args: null
                    },
                    type: TypeScript.DiagnosticCode.NUMBER,
                    set: function (arg) {
                        _this.compiler.codepage = parseInt(arg, 10);
                    }
                });
            }

            return opts;
        };
        return Settings;
    })();
    TypeDoc.Settings = Settings;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * Base class of all handlers.
        */
        var BaseHandler = (function () {
            /**
            * Create a new BaseHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function BaseHandler(dispatcher) {
                this.dispatcher = dispatcher;
            }
            return BaseHandler;
        })();
        Factories.BaseHandler = BaseHandler;
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * Helper class that determines the common base path of a set of files.
        *
        * In the first step all files must be passed to [[add]]. Afterwards [[trim]]
        * can be used to retrieve the shortest path relative to the determined base path.
        */
        var BasePath = (function () {
            function BasePath() {
                /**
                * List of known base paths.
                */
                this.basePaths = [];
            }
            /**
            * Add the given file path to this set of base paths.
            *
            * @param fileName  The absolute filename that should be added to the base path.
            */
            BasePath.prototype.add = function (fileName) {
                var fileDir = Path.dirname(BasePath.normalize(fileName));
                var filePath = fileDir.split('/');

                basePaths:
                for (var n = 0, c = this.basePaths.length; n < c; n++) {
                    var basePath = this.basePaths[n].split('/');
                    var mMax = Math.min(basePath.length, filePath.length);
                    for (var m = 0; m < mMax; m++) {
                        if (basePath[m] == filePath[m]) {
                            continue;
                        }

                        if (m < 1) {
                            continue basePaths;
                        } else {
                            // Partial match, trim the known base path
                            m += 1;
                            if (m < basePath.length) {
                                this.basePaths[n] = basePath.slice(0, m).join('/');
                            }
                            return;
                        }
                    }

                    // Complete match, nothing to do
                    return;
                }

                // Unknown base path, add it
                this.basePaths.push(fileDir);
            };

            /**
            * Trim the given filename by the determined base paths.
            *
            * @param fileName  The absolute filename that should be trimmed.
            * @returns The trimmed version of the filename.
            */
            BasePath.prototype.trim = function (fileName) {
                fileName = BasePath.normalize(fileName);
                for (var n = 0, c = this.basePaths.length; n < c; n++) {
                    var basePath = this.basePaths[n];
                    if (fileName.substr(0, basePath.length) == basePath) {
                        return fileName.substr(basePath.length + 1);
                    }
                }

                return fileName;
            };

            /**
            * Reset this instance, ignore all paths already passed to [[add]].
            */
            BasePath.prototype.reset = function () {
                this.basePaths = [];
            };

            /**
            * Normalize the given path.
            *
            * @param path  The path that should be normalized.
            * @returns Normalized version of the given path.
            */
            BasePath.normalize = function (path) {
                // Ensure forward slashes
                path = path.replace(/\\/g, '/');

                // Remove all surrounding quotes
                path = path.replace(/^["']+|["']+$/g, '');

                // Make Windows drive letters lower case
                return path.replace(/^([^\:]+)\:\//, function (m, m1) {
                    return m1.toUpperCase() + ':/';
                });
            };
            return BasePath;
        })();
        Factories.BasePath = BasePath;
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        *
        */
        var Compiler = (function (_super) {
            __extends(Compiler, _super);
            /**
            * Create a new compiler instance.
            */
            function Compiler(settings, inputFiles) {
                _super.call(this, TypeScript.IO);
                this.idMap = {};
                this.snapshots = {};
                this.inputFiles = inputFiles;
                this.compilationSettings = TypeScript.ImmutableCompilationSettings.fromCompilationSettings(settings);
            }
            Compiler.prototype.run = function () {
                var _this = this;
                var start = new Date().getTime();

                TypeScript.CompilerDiagnostics.diagnosticWriter = { Alert: function (s) {
                        _this.ioHost.printLine(s);
                    } };

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
                    this.inputFiles.forEach(function (file) {
                        _this.logger.log(" " + file);
                    });

                    this.logger.log("");

                    this.logger.log("Resolved Files:");
                    this.resolvedFiles.forEach(function (file) {
                        file.importedFiles.forEach(function (file) {
                            _this.logger.log(" " + file);
                        });
                        file.referencedFiles.forEach(function (file) {
                            _this.logger.log(" " + file);
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
            };

            Compiler.prototype.compile = function () {
                var _this = this;
                var compiler = new TypeScript.TypeScriptCompiler(this.logger, this.compilationSettings);

                this.resolvedFiles.forEach(function (resolvedFile) {
                    var sourceFile = _this.getSourceFile(resolvedFile.path);
                    compiler.addFile(resolvedFile.path, sourceFile.scriptSnapshot, sourceFile.byteOrderMark, /*version:*/ 0, false, resolvedFile.referencedFiles);
                });

                for (var it = compiler.compile(function (path) {
                    return _this.resolvePath(path);
                }); it.moveNext();) {
                    var result = it.current();
                    result.diagnostics.forEach(function (d) {
                        return _this.addDiagnostic(d);
                    });
                }

                var documents = [];
                compiler.fileNames().forEach(function (fileName) {
                    documents.push(compiler.getDocument(fileName));
                });

                return documents;
            };

            /**
            * Return the snapshot of the given filename.
            *
            * @param fileName  The filename of the snapshot.
            */
            Compiler.prototype.getSnapshot = function (fileName) {
                var _this = this;
                if (!this.snapshots[fileName]) {
                    var snapshot;
                    var lineMap;

                    this.snapshots[fileName] = {
                        getText: function (start, end) {
                            if (!snapshot)
                                snapshot = _this.getScriptSnapshot(fileName);
                            return snapshot.getText(start, end);
                        },
                        getLineNumber: function (position) {
                            if (!snapshot)
                                snapshot = _this.getScriptSnapshot(fileName);
                            if (!lineMap)
                                lineMap = TypeScript.LineMap1.fromScriptSnapshot(snapshot);
                            return lineMap.getLineNumberFromPosition(position);
                        }
                    };
                }

                return this.snapshots[fileName];
            };

            Compiler.prototype.getDefaultLibraryFilePath = function () {
                return this.resolvePath(TypeScript.IOUtils.combine(typeScriptPath, "lib.d.ts"));
            };
            return Compiler;
        })(TypeScript.BatchCompiler);
        Factories.Compiler = Compiler;
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    /**
    * Holds all logic used to analyze the output of the TypeScript compiler and generate reflections.
    *
    * The [[Dispatcher]] class is the central controller within this namespace. When invoked it fires a
    * series of [[DispatcherEvent]] events consumed by [[BaseHandler]] instances.
    */
    (function (Factories) {
        /**
        * The dispatcher receives documents from the compiler and emits
        * events for all discovered declarations.
        *
        * [[BaseHandler]] instances are the actual workhorses behind the dispatcher. They listen
        * to the events emitted by the dispatcher and populate the generated [[BaseReflection]]
        * instances. Each event contains a [[BaseState]] instance describing the current state the
        * dispatcher is in. Handlers can alter the state or stop it from being further processed.
        *
        * For each document (a single *.ts file) the dispatcher will generate the following event flow.
        * Declarations are processed according to their hierarchy.
        *
        *  * [[Dispatcher.EVENT_BEGIN]]<br>
        *    Triggered when the dispatcher starts processing a project. The listener receives
        *    an instance of [[DispatcherEvent]]. By calling [[DispatcherEvent.preventDefault]] the
        *    project file will not be processed.
        *
        *  * [[Dispatcher.EVENT_BEGIN_DOCUMENT]]<br>
        *    Triggered when the dispatcher starts processing a TypeScript document. The listener receives
        *    an instance of [[DocumentState]]. By calling [[DocumentState.preventDefault]] the entire
        *    TypeScript file will be ignored.
        *
        *    * [[Dispatcher.EVENT_BEGIN_DECLARATION]]<br>
        *      Triggered when the dispatcher starts processing a declaration. The listener receives
        *      an instance of [[DeclarationState]]. The [[DeclarationState.reflection]] property of
        *      the state is undefined at this moment. By calling [[DeclarationState.preventDefault]]
        *      the declaration will be skipped.
        *
        *      * [[Dispatcher.EVENT_CREATE_REFLECTION]]<br>
        *        Triggered when the dispatcher creates a new reflection instance. The listener receives
        *        an instance of [[DeclarationState]]. The [[DeclarationState.reflection]] property of
        *        the state contains a newly created [[DeclarationReflection]] instance.
        *
        *      * [[Dispatcher.EVENT_MERGE_REFLECTION]]<br>
        *        Triggered when the dispatcher merges an existing reflection with a new declaration.
        *        The listener receives an instance of [[DeclarationState]]. The
        *        [[DeclarationState.reflection]] property of the state contains the persistent
        *        [[DeclarationReflection]] instance.
        *
        *    * [[Dispatcher.EVENT_DECLARATION]]<br>
        *      Triggered when the dispatcher processes a declaration. The listener receives an instance
        *      of [[DeclarationState]].
        *
        *    * [[Dispatcher.EVENT_END_DECLARATION]]<br>
        *      Triggered when the dispatcher has finished processing a declaration. The listener receives
        *      an instance of [[DeclarationState]].
        *
        *  * [[Dispatcher.EVENT_END_DOCUMENT]]<br>
        *    Triggered when the dispatcher has finished processing a TypeScript document. The listener
        *    receives an instance of [[DocumentState]].
        *
        *
        *  After the dispatcher has processed all documents, it will enter the resolving phase and
        *  trigger the following event flow.
        *
        *  * [[Dispatcher.EVENT_BEGIN_RESOLVE]]<br>
        *    Triggered when the dispatcher enters the resolving phase. The listener receives an instance
        *    of [[DispatcherEvent]].
        *
        *    * [[Dispatcher.EVENT_RESOLVE]]<br>
        *      Triggered when the dispatcher resolves a reflection. The listener receives an instance
        *      of [[ReflectionEvent]].
        *
        *  * [[Dispatcher.EVENT_END_RESOLVE]]<br>
        *    Triggered when the dispatcher leaves the resolving phase. The listener receives an instance
        *    of [[DispatcherEvent]].
        */
        var Dispatcher = (function (_super) {
            __extends(Dispatcher, _super);
            /**
            * Create a new Dispatcher instance.
            *
            * @param application  The application this dispatcher is attached to.
            */
            function Dispatcher(application) {
                var _this = this;
                _super.call(this);
                this.application = application;

                this.handlers = [];
                Dispatcher.HANDLERS.forEach(function (factory) {
                    _this.handlers.push(new factory(_this));
                });
            }
            /**
            * Compile the given list of source files and generate a reflection for them.
            *
            * @param inputFiles  A list of source files.
            * @returns The generated root reflection.
            */
            Dispatcher.prototype.createProject = function (inputFiles) {
                var settings = this.application.settings.compiler;
                var compiler = new Factories.Compiler(settings, inputFiles);
                var project = new TypeDoc.Models.ProjectReflection(this.application.settings.name);
                var event = new Factories.DispatcherEvent(this, compiler, project);

                this.compile(event);
                this.resolve(event);

                return project;
            };

            /**
            * Run the compiler.
            *
            * @param event  The event containing the project and compiler.
            */
            Dispatcher.prototype.compile = function (event) {
                var _this = this;
                this.application.log('Running TypeScript compiler', 0 /* Verbose */);

                this.dispatch(Dispatcher.EVENT_BEGIN, event);
                if (event.isDefaultPrevented) {
                    return;
                }

                event.compiler.run().forEach(function (document) {
                    _this.application.log(Util.format('Processing %s', document.fileName), 0 /* Verbose */);

                    var state = event.createDocumentState(document);
                    _this.dispatch(Dispatcher.EVENT_BEGIN_DOCUMENT, state);
                    if (state.isDefaultPrevented) {
                        return;
                    }

                    var children = Factories.ReflectionHandler.sortDeclarations(state.declaration.getChildDecls());
                    children.forEach(function (declaration) {
                        _this.processState(state.createChildState(declaration));
                    });

                    _this.dispatch(Dispatcher.EVENT_END_DOCUMENT, state);
                });
            };

            /**
            * Resolve all created reflections.
            *
            * @param event  The event containing the project and compiler.
            */
            Dispatcher.prototype.resolve = function (event) {
                var _this = this;
                this.application.log('Resolving project', 0 /* Verbose */);

                this.dispatch(Dispatcher.EVENT_BEGIN_RESOLVE, event);

                event.project.reflections.forEach(function (reflection) {
                    _this.dispatch(Dispatcher.EVENT_RESOLVE, event.createReflectionEvent(reflection));
                });

                this.dispatch(Dispatcher.EVENT_END_RESOLVE, event);
            };

            /**
            * Process the given state.
            *
            * @param state  The state that should be processed.
            */
            Dispatcher.prototype.processState = function (state) {
                var _this = this;
                this.dispatch(Dispatcher.EVENT_BEGIN_DECLARATION, state);
                if (state.isDefaultPrevented)
                    return;

                this.ensureReflection(state);
                this.dispatch(Dispatcher.EVENT_DECLARATION, state);
                if (state.isDefaultPrevented)
                    return;

                var children = Factories.ReflectionHandler.sortDeclarations(state.declaration.getChildDecls());
                children.forEach(function (declaration) {
                    _this.processState(state.createChildState(declaration));
                });

                this.dispatch(Dispatcher.EVENT_END_DECLARATION, state);
            };

            /**
            * Ensure that the given state holds a reflection.
            *
            * Reflections should always be created through this function as the dispatcher
            * will hold an array of created reflections for the final resolving phase.
            *
            * @param state  The state the reflection should be created for.
            * @return       TRUE if a new reflection has been created, FALSE if the
            *               state already holds a reflection.
            */
            Dispatcher.prototype.ensureReflection = function (state) {
                if (state.reflection) {
                    this.dispatch(Dispatcher.EVENT_MERGE_REFLECTION, state);
                    return false;
                }

                var parent = state.parentState.reflection;
                var reflection = new TypeDoc.Models.DeclarationReflection();
                reflection.name = (state.flattenedName ? state.flattenedName + '.' : '') + state.getName();
                reflection.originalName = state.declaration.name;
                reflection.parent = parent;

                state.reflection = reflection;
                if (state.isSignature) {
                    if (!parent.signatures)
                        parent.signatures = [];
                    parent.signatures.push(reflection);
                } else {
                    parent.children.push(reflection);
                }

                state.project.reflections.push(reflection);

                if (!state.isInherited) {
                    var declID = state.declaration.declID;
                    state.compiler.idMap[declID] = reflection;
                }

                this.dispatch(Dispatcher.EVENT_CREATE_REFLECTION, state);
                return true;
            };

            /**
            * Print debug information of the given declaration to the console.
            *
            * @param declaration  The declaration that should be printed.
            * @param indent  Used internally to indent child declarations.
            */
            Dispatcher.explainDeclaration = function (declaration, indent) {
                if (typeof indent === "undefined") { indent = ''; }
                var str = indent + declaration.name + (declaration.name == '' ? '' : ' ');
                str += TypeScript.PullElementKind[declaration.kind];
                str += ' (' + Dispatcher.flagsToString(declaration.flags) + ')';
                str += declaration.getSymbol() ? ' [' + declaration.getSymbol().pullSymbolID + ']' : '';
                console.log(str);

                indent += '  ';
                declaration.getChildDecls().forEach(function (decl) {
                    Dispatcher.explainDeclaration(decl, indent);
                });
            };

            /**
            * Return a string that explains the given flag bit mask.
            *
            * @param flags  A bit mask containing TypeScript.PullElementFlags bits.
            * @returns A string describing the given bit mask.
            */
            Dispatcher.flagsToString = function (flags) {
                var items = [];
                for (var flag in TypeScript.PullElementFlags) {
                    if (!TypeScript.PullElementFlags.hasOwnProperty(flag))
                        continue;
                    if (flag != +flag)
                        continue;
                    if (flags & flag)
                        items.push(TypeScript.PullElementFlags[flag]);
                }

                return items.join(', ');
            };
            Dispatcher.EVENT_BEGIN = 'begin';

            Dispatcher.EVENT_BEGIN_DOCUMENT = 'beginDocument';

            Dispatcher.EVENT_END_DOCUMENT = 'endDocument';

            Dispatcher.EVENT_CREATE_REFLECTION = 'createReflection';

            Dispatcher.EVENT_MERGE_REFLECTION = Dispatcher.EVENT_MERGE_REFLECTION;

            Dispatcher.EVENT_BEGIN_DECLARATION = 'beginDeclaration';

            Dispatcher.EVENT_DECLARATION = 'declaration';

            Dispatcher.EVENT_END_DECLARATION = 'endDeclaration';

            Dispatcher.EVENT_BEGIN_RESOLVE = 'beginResolve';

            Dispatcher.EVENT_RESOLVE = 'resolve';

            Dispatcher.EVENT_END_RESOLVE = 'endResolve';

            Dispatcher.HANDLERS = [];
            return Dispatcher;
        })(TypeDoc.EventDispatcher);
        Factories.Dispatcher = Dispatcher;
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * Event object dispatched by [[Dispatcher]].
        *
        * This event is used when the dispatcher is not processing a specific declaration but
        * when a certain state is reached.
        *
        * @see [[Dispatcher.EVENT_BEGIN]]
        * @see [[Dispatcher.EVENT_BEGIN_RESOLVE]]
        * @see [[Dispatcher.EVENT_END_RESOLVE]]
        */
        var DispatcherEvent = (function (_super) {
            __extends(DispatcherEvent, _super);
            /**
            * Create a new DispatcherEvent instance.
            *
            * @param dispatcher  The dispatcher that has created this event.
            * @param compiler    The current compiler used by the dispatcher.
            * @param project     The project the reflections are written to.
            */
            function DispatcherEvent(dispatcher, compiler, project) {
                _super.call(this);
                this.dispatcher = dispatcher;
                this.compiler = compiler;
                this.project = project;
            }
            /**
            * Create a [[ReflectionEvent]] based on this event and the given reflection.
            *
            * @param reflection  The reflection the returned event should represent.
            * @returns           A newly created instance of [[ReflectionEvent]].
            */
            DispatcherEvent.prototype.createReflectionEvent = function (reflection) {
                return new Factories.ReflectionEvent(this, reflection);
            };

            /**
            * Create a [[DocumentState]] based on this event and the given document.
            *
            * @param document  The document the returned state should represent.
            * @returns         A newly created instance of [[DocumentState]].
            */
            DispatcherEvent.prototype.createDocumentState = function (document) {
                return new Factories.DocumentState(this, document);
            };
            return DispatcherEvent;
        })(TypeDoc.Event);
        Factories.DispatcherEvent = DispatcherEvent;
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * Base class of all state events.
        *
        * States store the current declaration and its matching reflection while
        * being processed by the [[Dispatcher]]. [[BaseHandler]] instances can alter the state and
        * stop it from being further processed.
        *
        * For each child declaration the dispatcher will create a child [[DeclarationState]]
        * state. The root state is always an instance of [[DocumentState]].
        */
        var BaseState = (function (_super) {
            __extends(BaseState, _super);
            /**
            * Create a new BaseState instance.
            */
            function BaseState(parent, declaration, reflection) {
                _super.call(this, parent.dispatcher, parent.compiler, parent.project);

                if (parent instanceof BaseState) {
                    this.parentState = parent;
                    this.isExternal = this.parentState.isExternal;
                }

                this.reflection = reflection;
                this.declaration = declaration;
                this.originalDeclaration = declaration;
            }
            /**
            * Check whether the given flag is set on the declaration of this state.
            *
            * @param flag   The flag that should be looked for.
            */
            BaseState.prototype.hasFlag = function (flag) {
                return (this.declaration.flags & flag) !== 0;
            };

            /**
            * Test whether the declaration of this state is of the given kind.
            */
            BaseState.prototype.kindOf = function (kind, useOriginalDeclaration) {
                var test = useOriginalDeclaration ? this.originalDeclaration.kind : this.declaration.kind;
                if (Array.isArray(kind)) {
                    for (var i = 0, c = kind.length; i < c; i++) {
                        if ((test & kind[i]) !== 0) {
                            return true;
                        }
                    }
                    return false;
                } else {
                    return (test & kind) !== 0;
                }
            };

            BaseState.prototype.getName = function () {
                return BaseState.getName(this.declaration);
            };

            /**
            * Return the root state of this state.
            *
            * The root state is always an instance of {DocumentState}.
            */
            BaseState.prototype.getDocumentState = function () {
                var state = this;
                while (state) {
                    if (state instanceof Factories.DocumentState)
                        return state;
                    state = state.parentState;
                }
                return null;
            };

            /**
            * Return the snapshot of the given filename.
            *
            * @param fileName  The filename of the snapshot.
            */
            BaseState.prototype.getSnapshot = function (fileName) {
                return this.getDocumentState().compiler.getSnapshot(fileName);
            };

            /**
            * Create a child state of this state with the given declaration.
            *
            * This state must hold an reflection when creating a child state, an error will
            * be thrown otherwise. If the reflection of this state contains a child with
            * the name of the given declaration, the reflection of the child state will be
            * populated with it.
            *
            * @param declaration  The declaration that is encapsulated by the child state.
            */
            BaseState.prototype.createChildState = function (declaration) {
                if (!this.reflection) {
                    throw new Error('Cannot create a child state of state without a reflection.');
                }

                var reflection = null;
                var name = BaseState.getName(declaration);
                this.reflection.children.some(function (child) {
                    if (child.name != name)
                        return false;
                    if ((child.flags & TypeScript.PullElementFlags.Static) != (declaration.flags & TypeScript.PullElementFlags.Static))
                        return false;

                    reflection = child;
                    return true;
                });

                return new Factories.DeclarationState(this, declaration, reflection);
            };

            BaseState.getName = function (declaration) {
                if (declaration.kind == TypeDoc.Models.Kind.ConstructorMethod || declaration.kind == TypeDoc.Models.Kind.ConstructSignature) {
                    return 'constructor';
                } else {
                    return declaration.name;
                }
            };
            return BaseState;
        })(Factories.DispatcherEvent);
        Factories.BaseState = BaseState;
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        */
        var DeclarationState = (function (_super) {
            __extends(DeclarationState, _super);
            function DeclarationState() {
                _super.apply(this, arguments);
                this.flattenedName = '';
                this.isSignature = false;
                this.isInherited = false;
                this.isFlattened = false;
            }
            /**
            * @inherit
            */
            DeclarationState.prototype.createChildState = function (declaration) {
                var state = _super.prototype.createChildState.call(this, declaration);
                state.isInherited = this.isInherited;
                state.isFlattened = this.isFlattened;

                if (state.isInherited) {
                    state.reflection = this.reflection.getChildByName(Factories.BaseState.getName(declaration));
                }

                if (state.isFlattened) {
                    // state.parentState   = this.parentState;
                    state.flattenedName = this.flattenedName + '.' + declaration.name;
                }

                return state;
            };

            /**
            * Create a child state of this state with the given declaration.
            */
            DeclarationState.prototype.createSignatureState = function () {
                if (!this.reflection) {
                    throw new Error('Cannot create a signature state of state without a reflection.');
                }

                var state = new DeclarationState(this, this.declaration);
                state.isSignature = true;
                state.isInherited = this.isInherited;
                state.isFlattened = this.isFlattened;
                return state;
            };

            DeclarationState.prototype.createInheritanceState = function (declaration) {
                if (!this.reflection) {
                    throw new Error('Cannot create a signature state of state without a reflection.');
                }

                var state = new DeclarationState(this, declaration);
                state.reflection = this.reflection;
                state.isInherited = true;
                return state;
            };
            return DeclarationState;
        })(Factories.BaseState);
        Factories.DeclarationState = DeclarationState;
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * Root state containing the TypeScript document that is processed.
        */
        var DocumentState = (function (_super) {
            __extends(DocumentState, _super);
            /**
            * Create a new DocumentState instance.
            *
            * @param parent    The parent dispatcher event.
            * @param document  The TypeScript document that is being processed.
            */
            function DocumentState(parent, document) {
                _super.call(this, parent, document.topLevelDecl(), parent.project);
                this.document = document;
            }
            return DocumentState;
        })(Factories.BaseState);
        Factories.DocumentState = DocumentState;
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * Event object dispatched by [[Dispatcher]] during the resolving phase.
        *
        * @see [[Dispatcher.EVENT_RESOLVE]]
        */
        var ReflectionEvent = (function (_super) {
            __extends(ReflectionEvent, _super);
            /**
            * Create a new ReflectionEvent instance.
            *
            * @param parent    The parent dispatcher event.
            * @param reflection  The final reflection that should be resolved.
            */
            function ReflectionEvent(parent, reflection) {
                _super.call(this, parent.dispatcher, parent.compiler, parent.project);
                this.reflection = reflection;
            }
            return ReflectionEvent;
        })(Factories.DispatcherEvent);
        Factories.ReflectionEvent = ReflectionEvent;
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A handler that parses javadoc comments and attaches [[Models.Comment]] instances to
        * the generated reflections.
        */
        var CommentHandler = (function (_super) {
            __extends(CommentHandler, _super);
            /**
            * Create a new CommentHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function CommentHandler(dispatcher) {
                _super.call(this, dispatcher);

                dispatcher.on(Factories.Dispatcher.EVENT_DECLARATION, this.onDeclaration, this);
                dispatcher.on(Factories.Dispatcher.EVENT_RESOLVE, this.onResolve, this);
            }
            /**
            * Triggered when the dispatcher processes a declaration.
            *
            * Invokes the comment parser.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            CommentHandler.prototype.onDeclaration = function (state) {
                var isInherit = false;
                if (state.isInherited) {
                    isInherit = state.reflection.comment && state.reflection.comment.hasTag('inherit');
                }

                if (!state.reflection.comment || isInherit) {
                    CommentHandler.findComments(state).forEach(function (comment) {
                        state.reflection.comment = CommentHandler.parseDocComment(comment);
                    });
                }
            };

            /**
            * Triggered when the dispatcher resolves a reflection.
            *
            * Cleans up comment tags related to signatures like @param or @return
            * and moves their data to the corresponding parameter reflections.
            *
            * This hook also copies over the comment of function implementations to their
            * signatures.
            *
            * @param event  The event containing the reflection to resolve.
            */
            CommentHandler.prototype.onResolve = function (event) {
                var reflection = event.reflection;
                if (reflection.signatures) {
                    var comment = reflection.comment;
                    if (comment && comment.hasTag('returns')) {
                        comment.returns = comment.getTag('returns').text;
                        CommentHandler.removeTags(comment, 'returns');
                    }

                    reflection.signatures.forEach(function (signature) {
                        var childComment = signature.comment;
                        if (childComment && childComment.hasTag('returns')) {
                            childComment.returns = childComment.getTag('returns').text;
                            CommentHandler.removeTags(childComment, 'returns');
                        }

                        if (comment) {
                            if (!childComment) {
                                childComment = signature.comment = new TypeDoc.Models.Comment();
                            }

                            childComment.shortText = childComment.shortText || comment.shortText;
                            childComment.text = childComment.text || comment.text;
                            childComment.returns = childComment.returns || comment.returns;
                        }

                        signature.children.forEach(function (parameter) {
                            var tag;
                            if (childComment)
                                tag = childComment.getTag('param', parameter.name);
                            if (comment && !tag)
                                tag = comment.getTag('param', parameter.name);
                            if (tag) {
                                parameter.comment = new TypeDoc.Models.Comment(tag.text);
                            }
                        });

                        CommentHandler.removeTags(childComment, 'param');
                    });

                    CommentHandler.removeTags(comment, 'param');
                }
            };

            /**
            * Test whether the given TypeScript comment instance is a doc comment.
            *
            * @param comment  The TypeScript comment that should be tested.
            * @returns        True when the comment is a doc comment, otherwise false.
            */
            CommentHandler.isDocComment = function (comment) {
                if (comment.kind() === 6 /* MultiLineCommentTrivia */) {
                    var fullText = comment.fullText();
                    return fullText.charAt(2) === "*" && fullText.charAt(3) !== "/";
                }

                return false;
            };

            /**
            * Remove all tags with the given name from the given comment instance.
            *
            * @param comment  The comment that should be modified.
            * @param tagName  The name of the that that should be removed.
            */
            CommentHandler.removeTags = function (comment, tagName) {
                if (!comment || !comment.tags)
                    return;

                var i = 0, c = comment.tags.length;
                while (i < c) {
                    if (comment.tags[i].tagName == tagName) {
                        comment.tags.splice(i, 1);
                        c--;
                    } else {
                        i++;
                    }
                }
            };

            /**
            * Find all doc comments associated with the declaration of the given state
            * and return their plain text.
            *
            * Variable declarations need a special treatment, their comments are stored with the
            * surrounding VariableStatement ast element. Their ast hierarchy looks like this:
            * > VariableStatement &#8594; VariableDeclaration &#8594; SeparatedList &#8594; VariableDeclarator
            *
            * This reflect the possibility of JavaScript to define multiple variables with a single ```var```
            * statement. We therefore have to check whether the VariableStatement contains only one variable
            * and then can assign the comment of the VariableStatement to the VariableDeclarator declaration.
            *
            * @param state  The state containing the declaration whose comments should be extracted.
            * @returns A list of all doc comments associated with the state.
            */
            CommentHandler.findComments = function (state) {
                var decl = state.declaration;
                var ast = decl.ast();

                if (ast.kind() == 225 /* VariableDeclarator */) {
                    var list = ast.parent;
                    if (list.kind() != 2 /* SeparatedList */) {
                        return [];
                    }

                    var snapshot = state.getSnapshot(ast.fileName());
                    var astSource = snapshot.getText(ast.start(), ast.end());
                    var listSource = snapshot.getText(list.start(), list.end());
                    if (astSource != listSource) {
                        return [];
                    }

                    ast = list.parent.parent;
                }

                var comments = ast.preComments();
                if (!comments || comments.length == 0) {
                    return [];
                }

                var result = [];
                comments.forEach(function (comment) {
                    if (!CommentHandler.isDocComment(comment))
                        return;
                    result.push(comment.fullText());
                });

                return result;
            };

            /**
            * Parse the given doc comment string.
            *
            * @param text     The doc comment string that should be parsed.
            * @param comment  The [[Models.Comment]] instance the parsed results should be stored into.
            * @returns        A populated [[Models.Comment]] instance.
            */
            CommentHandler.parseDocComment = function (text, comment) {
                if (typeof comment === "undefined") { comment = new TypeDoc.Models.Comment(); }
                function consumeTypeData(line) {
                    line = line.replace(/^\{[^\}]*\}/, '');
                    line = line.replace(/^\[[^\]]*\]/, '');
                    return line.trim();
                }

                text = text.replace(/^\s*\/\*+/, '');
                text = text.replace(/\*+\/\s*$/, '');

                var currentTag;
                var shortText = 0;
                var lines = text.split(/\r\n?|\n/);
                lines.forEach(function (line) {
                    line = line.replace(/^\s*\*? ?/, '');
                    line = line.replace(/\s*$/, '');

                    var tag = /^@(\w+)/.exec(line);
                    if (tag) {
                        var tagName = tag[1].toLowerCase();
                        line = line.substr(tagName.length + 1).trim();

                        if (tagName == 'return')
                            tagName = 'returns';
                        if (tagName == 'param') {
                            line = consumeTypeData(line);
                            var param = /[^\s]+/.exec(line);
                            if (param) {
                                var paramName = param[0];
                                line = line.substr(paramName.length + 1).trim();
                            }
                            line = consumeTypeData(line);
                        } else if (tagName == 'returns') {
                            line = consumeTypeData(line);
                        }

                        currentTag = new TypeDoc.Models.CommentTag(tagName, paramName, line);
                        if (!comment.tags)
                            comment.tags = [];
                        comment.tags.push(currentTag);
                    } else {
                        if (currentTag) {
                            currentTag.text += '\n' + line;
                        } else if (line == '' && shortText == 0) {
                            // Ignore
                        } else if (line == '' && shortText == 1) {
                            shortText = 2;
                        } else {
                            if (shortText == 2) {
                                comment.text += (comment.text == '' ? '' : '\n') + line;
                            } else {
                                comment.shortText += (comment.shortText == '' ? '' : '\n') + line;
                                shortText = 1;
                            }
                        }
                    }
                });

                return comment;
            };
            return CommentHandler;
        })(Factories.BaseHandler);
        Factories.CommentHandler = CommentHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(CommentHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A handler that moves comments with dot syntax to their target.
        */
        var DeepCommentHandler = (function (_super) {
            __extends(DeepCommentHandler, _super);
            /**
            * Create a new CommentHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function DeepCommentHandler(dispatcher) {
                _super.call(this, dispatcher);

                dispatcher.on(Factories.Dispatcher.EVENT_DECLARATION, this.onDeclaration, this, -512);
            }
            /**
            * Triggered when the dispatcher starts processing a declaration.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            DeepCommentHandler.prototype.onDeclaration = function (state) {
                var reflection = state.reflection;
                if (reflection.comment) {
                    return;
                }

                function push(reflection) {
                    var part = reflection.originalName;
                    if (reflection.isSignature) {
                        part = '';
                    }

                    if (part && part != '') {
                        name = (name == '' ? part : part + '.' + name);
                    }
                }

                var name = '';
                var target = reflection.parent;
                push(reflection);

                while (target instanceof TypeDoc.Models.DeclarationReflection) {
                    if (target.comment) {
                        var tag = target.comment.getTag('param', name);
                        if (tag) {
                            target.comment.tags.splice(target.comment.tags.indexOf(tag), 1);
                            reflection.comment = new TypeDoc.Models.Comment('', tag.text);
                            break;
                        }
                    }

                    target = target.parent;
                }
            };
            return DeepCommentHandler;
        })(Factories.BaseHandler);
        Factories.DeepCommentHandler = DeepCommentHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(DeepCommentHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A handler that truncates the names of dynamic modules to not include the
        * project's base path.
        */
        var DynamicModuleHandler = (function (_super) {
            __extends(DynamicModuleHandler, _super);
            /**
            * Create a new DynamicModuleHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function DynamicModuleHandler(dispatcher) {
                _super.call(this, dispatcher);
                /**
                * Helper class for determining the base path.
                */
                this.basePath = new Factories.BasePath();
                /**
                * The declaration kinds affected by this handler.
                */
                this.affectedKinds = [
                    TypeScript.PullElementKind.DynamicModule,
                    TypeScript.PullElementKind.Script
                ];

                this.factory = TypeScript.getAstWalkerFactory();

                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN, this.onBegin, this);
                dispatcher.on(Factories.Dispatcher.EVENT_DECLARATION, this.onDeclaration, this);
                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN_RESOLVE, this.onBeginResolve, this);
            }
            /**
            * Triggered once per project before the dispatcher invokes the compiler.
            *
            * @param event  An event object containing the related project and compiler instance.
            */
            DynamicModuleHandler.prototype.onBegin = function (event) {
                this.basePath.reset();
                this.reflections = [];
            };

            /**
            * Triggered when the dispatcher processes a declaration.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            DynamicModuleHandler.prototype.onDeclaration = function (state) {
                if (state.kindOf(this.affectedKinds, true) && this.reflections.indexOf(state.reflection) == -1) {
                    var name = state.originalDeclaration.name;
                    if (name.indexOf('/') == -1) {
                        return;
                    }

                    name = name.replace(/"/g, '');
                    this.reflections.push(state.reflection);
                    this.basePath.add(name);

                    var ast = state.declaration.ast();
                    if (ast instanceof TypeScript.SourceUnit) {
                        var resolved = false;
                        this.factory.simpleWalk(ast, function (ast, astState) {
                            if (resolved || ast.kind() == 120 /* SourceUnit */ || ast.kind() == 1 /* List */) {
                                return;
                            }

                            var comments = ast.preComments();
                            if (comments && comments.length > 1 && Factories.CommentHandler.isDocComment(comments[0])) {
                                state.reflection.comment = Factories.CommentHandler.parseDocComment(comments[0].fullText());
                            }

                            resolved = true;
                        });
                    }
                }
            };

            /**
            * Triggered when the dispatcher enters the resolving phase.
            *
            * @param event  The event containing the reflection to resolve.
            */
            DynamicModuleHandler.prototype.onBeginResolve = function (event) {
                var _this = this;
                this.reflections.forEach(function (reflection) {
                    var name = reflection.name.replace(/"/g, '');
                    name = name.substr(0, name.length - Path.extname(name).length);
                    reflection.name = '"' + _this.basePath.trim(name) + '"';
                });
            };
            return DynamicModuleHandler;
        })(Factories.BaseHandler);
        Factories.DynamicModuleHandler = DynamicModuleHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(DynamicModuleHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        

        /**
        * A handler that analyzes and resolves export statements of dynamic modules.
        */
        var ExportHandler = (function (_super) {
            __extends(ExportHandler, _super);
            /**
            * Create a new AstHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function ExportHandler(dispatcher) {
                _super.call(this, dispatcher);
                /**
                * Collected ambient module export data.
                */
                this.exports = [];

                this.factory = TypeScript.getAstWalkerFactory();

                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN, this.onBegin, this);
                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN_DECLARATION, this.onBeginDeclaration, this, 1024);
            }
            /**
            * Triggered once per project before the dispatcher invokes the compiler.
            *
            * @param event  An event object containing the related project and compiler instance.
            */
            ExportHandler.prototype.onBegin = function (event) {
                this.exports = [];
            };

            /**
            * Triggered when the dispatcher starts processing a declaration.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            ExportHandler.prototype.onBeginDeclaration = function (state) {
                var _this = this;
                if (!(state.declaration.kind & TypeScript.PullElementKind.DynamicModule)) {
                    return;
                }

                var symbol = this.getExportedSymbol(state.declaration);
                if (symbol) {
                    var declarations = [];
                    symbol.getDeclarations().forEach(function (declaration) {
                        declaration.getParentDecl().getChildDecls().forEach(function (child) {
                            if (child.name == declaration.name && declarations.indexOf(child) == -1) {
                                declarations.push(child);
                            }
                        });
                    });

                    var isPureInternal = true;
                    declarations.forEach(function (declaration) {
                        var isInternal = false;
                        while (declaration) {
                            if (declaration == state.declaration)
                                isInternal = true;
                            declaration = declaration.getParentDecl();
                        }
                        isPureInternal = isPureInternal && isInternal;
                    });

                    if (isPureInternal) {
                        this.dispatcher.ensureReflection(state);
                        state.reflection.name = state.declaration.name;
                        state.reflection.isExported = true;

                        Factories.ReflectionHandler.sortDeclarations(declarations);
                        declarations.forEach(function (declaration) {
                            var childState = state.createChildState(declaration);
                            childState.originalDeclaration = state.declaration;
                            childState.parentState = state.parentState;
                            childState.reflection = state.reflection;

                            _this.dispatcher.processState(childState);
                            state.reflection = childState.reflection;
                        });

                        state.reflection.kind = state.declaration.kind;
                        ExportHandler.markAsExported(state.reflection);

                        this.exports.push({
                            name: state.declaration.name,
                            type: new TypeDoc.Models.ReflectionType(state.reflection, false)
                        });
                    } else {
                        this.exports.push({
                            name: state.declaration.name,
                            symbol: symbol
                        });
                    }

                    state.stopPropagation();
                    state.preventDefault();
                }
            };

            /**
            * Try to find the identifier of the export assignment within the given declaration.
            *
            * @param declaration  The declaration whose export assignment should be resolved.
            * @returns            The found identifier or NULL.
            */
            ExportHandler.prototype.getExportedIdentifier = function (declaration) {
                var identifier = null;

                var ast = declaration.ast();
                if (ast.parent && (ast.parent.kind() & 130 /* ModuleDeclaration */)) {
                    ast = ast.parent;
                }

                this.factory.simpleWalk(ast, function (ast, astState) {
                    if (ast.kind() == 134 /* ExportAssignment */) {
                        var assignment = ast;
                        identifier = assignment.identifier;
                    }
                });

                return identifier;
            };

            /**
            * Try to find the compiler symbol exported by the given declaration.
            *
            * @param declaration  The declaration whose export assignment should be resolved.
            * @returns            The found compiler symbol or NULL.
            */
            ExportHandler.prototype.getExportedSymbol = function (declaration) {
                var identifier = this.getExportedIdentifier(declaration);
                if (identifier) {
                    var resolver = declaration.semanticInfoChain.getResolver();
                    var context = new TypeScript.PullTypeResolutionContext(resolver);

                    return resolver.resolveAST(identifier, false, context);
                } else {
                    return null;
                }
            };

            /**
            * Mark the given reflection and all of its children as being exported.
            *
            * @param reflection  The reflection that should be marked as being exported.
            */
            ExportHandler.markAsExported = function (reflection) {
                reflection.flags = reflection.flags | 1 /* Exported */;
                reflection.children.forEach(function (child) {
                    return ExportHandler.markAsExported(child);
                });
            };
            return ExportHandler;
        })(Factories.BaseHandler);
        Factories.ExportHandler = ExportHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(ExportHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A handler that marks files not passed as source files as being external.
        */
        var ExternalHandler = (function (_super) {
            __extends(ExternalHandler, _super);
            /**
            * Create a new ExternalHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function ExternalHandler(dispatcher) {
                _super.call(this, dispatcher);

                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN, this.onBegin, this);
                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN_DOCUMENT, this.onBeginDocument, this);
            }
            /**
            * Triggered once per project before the dispatcher invokes the compiler.
            *
            * @param event  An event object containing the related project and compiler instance.
            */
            ExternalHandler.prototype.onBegin = function (event) {
                var _this = this;
                var settings = this.dispatcher.application.settings;
                this.exclude = settings.excludeExternals;

                this.inputFiles = [];
                event.compiler.inputFiles.forEach(function (fileName) {
                    fileName = Path.resolve(fileName);
                    _this.inputFiles.push(fileName.replace(/\\/g, '/'));
                });

                if (settings.externalPattern) {
                    this.pattern = new Minimatch.Minimatch(settings.externalPattern);
                } else {
                    this.pattern = null;
                }
            };

            /**
            * Triggered when the dispatcher starts processing a TypeScript document.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            ExternalHandler.prototype.onBeginDocument = function (state) {
                var fileName = state.document.fileName.replace(/\\/g, '/');
                var isExternal = this.inputFiles.indexOf(fileName) == -1;

                if (this.pattern) {
                    isExternal = isExternal || this.pattern.match(fileName);
                }

                if (this.exclude && isExternal) {
                    state.stopPropagation();
                    state.preventDefault();
                }

                state.isExternal = isExternal;
            };
            return ExternalHandler;
        })(Factories.BaseHandler);
        Factories.ExternalHandler = ExternalHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(ExternalHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A handler that reflections for function types.
        */
        var FunctionTypeHandler = (function (_super) {
            __extends(FunctionTypeHandler, _super);
            /**
            * Create a new FunctionTypeHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function FunctionTypeHandler(dispatcher) {
                _super.call(this, dispatcher);

                dispatcher.on(Factories.Dispatcher.EVENT_END_DECLARATION, this.onEndDeclaration, this);
            }
            /**
            * Triggered when the dispatcher has finished processing a declaration.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            FunctionTypeHandler.prototype.onEndDeclaration = function (state) {
                if (state.isSignature) {
                    return;
                }

                var symbol = state.declaration.getSymbol();
                if (!symbol || !symbol.type) {
                    return;
                }

                if (!(symbol.kind & TypeScript.PullElementKind.SomeFunction) && symbol.type.kind == TypeScript.PullElementKind.FunctionType) {
                    var declaration = symbol.type.getDeclarations()[0];
                    var childState = state.createChildState(declaration);
                    this.dispatcher.ensureReflection(childState);
                    this.dispatcher.processState(childState.createSignatureState());

                    state.reflection.type = Factories.TypeHandler.createNamedType('Function');
                    childState.reflection.name = state.reflection.name + ' function signature';
                }
            };
            return FunctionTypeHandler;
        })(Factories.BaseHandler);
        Factories.FunctionTypeHandler = FunctionTypeHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(FunctionTypeHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * Stores data of a repository.
        */
        var Repository = (function () {
            /**
            * Create a new Repository instance.
            *
            * @param path  The root path of the repository.
            */
            function Repository(path) {
                var _this = this;
                /**
                * The name of the branch this repository is on right now.
                */
                this.branch = 'master';
                /**
                * A list of all files tracked by the repository.
                */
                this.files = [];
                this.path = path;
                ShellJS.pushd(path);

                var out = ShellJS.exec('git ls-remote --get-url', { silent: true });
                if (out.code == 0) {
                    var url, remotes = out.output.split('\n');
                    for (var i = 0, c = remotes.length; i < c; i++) {
                        url = /git@github\.com:([^\/]+)\/(.*?)\.git/.exec(remotes[i]);
                        if (url) {
                            this.gitHubUser = url[1];
                            this.gitHubProject = url[2];
                            break;
                        }
                    }
                }

                out = ShellJS.exec('git ls-files', { silent: true });
                if (out.code == 0) {
                    out.output.split('\n').forEach(function (file) {
                        if (file != '') {
                            _this.files.push(Factories.BasePath.normalize(path + '/' + file));
                        }
                    });
                }

                out = ShellJS.exec('git rev-parse --abbrev-ref HEAD', { silent: true });
                if (out.code == 0) {
                    this.branch = out.output.replace('\n', '');
                }

                ShellJS.popd();
            }
            /**
            * Check whether the given file is tracked by this repository.
            *
            * @param fileName  The name of the file to test for.
            * @returns TRUE when the file is part of the repository, otherwise FALSE.
            */
            Repository.prototype.contains = function (fileName) {
                return this.files.indexOf(fileName) != -1;
            };

            /**
            * Get the URL of the given file on GitHub.
            *
            * @param fileName  The file whose GitHub URL should be determined.
            * @returns An url pointing to the web preview of the given file or NULL.
            */
            Repository.prototype.getGitHubURL = function (fileName) {
                if (!this.gitHubUser || !this.gitHubProject || !this.contains(fileName)) {
                    return null;
                }

                return [
                    'https://github.com',
                    this.gitHubUser,
                    this.gitHubProject,
                    'blob',
                    this.branch,
                    fileName.substr(this.path.length + 1)
                ].join('/');
            };

            /**
            * Try to create a new repository instance.
            *
            * Checks whether the given path is the root of a valid repository and if so
            * creates a new instance of [[Repository]].
            *
            * @param path  The potential repository root.
            * @returns A new instance of [[Repository]] or NULL.
            */
            Repository.tryCreateRepository = function (path) {
                var out, repository = null;

                ShellJS.pushd(path);
                out = ShellJS.exec('git rev-parse --show-toplevel', { silent: true });
                ShellJS.popd();

                if (out.code != 0)
                    return null;
                return new Repository(Factories.BasePath.normalize(out.output.replace("\n", '')));
            };
            return Repository;
        })();

        /**
        * A handler that watches for repositories with GitHub origin and links
        * their source files to the related GitHub pages.
        */
        var GitHubHandler = (function (_super) {
            __extends(GitHubHandler, _super);
            /**
            * Create a new GitHubHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function GitHubHandler(dispatcher) {
                _super.call(this, dispatcher);
                /**
                * List of known repositories.
                */
                this.repositories = {};
                /**
                * List of paths known to be not under git control.
                */
                this.ignoredPaths = [];

                ShellJS.config.silent = true;
                if (ShellJS.which('git')) {
                    dispatcher.on(Factories.Dispatcher.EVENT_END_RESOLVE, this.onEndResolve, this);
                }
            }
            /**
            * Check whether the given file is placed inside a repository.
            *
            * @param fileName  The name of the file a repository should be looked for.
            * @returns The found repository info or NULL.
            */
            GitHubHandler.prototype.getRepository = function (fileName) {
                // Check for known non-repositories
                var dirName = Path.dirname(fileName);
                for (var i = 0, c = this.ignoredPaths.length; i < c; i++) {
                    if (this.ignoredPaths[i] == dirName) {
                        return null;
                    }
                }

                for (var path in this.repositories) {
                    if (!this.repositories.hasOwnProperty(path))
                        continue;
                    if (fileName.substr(0, path.length) == path) {
                        return this.repositories[path];
                    }
                }

                // Try to create a new repository
                var repository = Repository.tryCreateRepository(dirName);
                if (repository) {
                    this.repositories[repository.path] = repository;
                    return repository;
                }

                // No repository found, add path to ignored paths
                var segments = dirName.split('/');
                for (var i = segments.length; i > 0; i--) {
                    this.ignoredPaths.push(segments.slice(0, i).join('/'));
                }

                return null;
            };

            /**
            * Triggered when the dispatcher leaves the resolving phase.
            *
            * @param event  An event object containing the related project and compiler instance.
            */
            GitHubHandler.prototype.onEndResolve = function (event) {
                var _this = this;
                event.project.files.forEach(function (sourceFile) {
                    var repository = _this.getRepository(sourceFile.fullFileName);
                    if (repository) {
                        sourceFile.url = repository.getGitHubURL(sourceFile.fullFileName);
                    }
                });

                event.project.reflections.forEach(function (reflection) {
                    reflection.sources.forEach(function (source) {
                        if (source.file && source.file.url) {
                            source.url = source.file.url + '#L' + source.line;
                        }
                    });
                });
            };
            return GitHubHandler;
        })(Factories.BaseHandler);
        Factories.GitHubHandler = GitHubHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(GitHubHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A handler that sorts and groups the found reflections in the resolving phase.
        *
        * The handler sets the ´groups´ property of all reflections.
        */
        var GroupHandler = (function (_super) {
            __extends(GroupHandler, _super);
            /**
            * Create a new GroupHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function GroupHandler(dispatcher) {
                _super.call(this, dispatcher);

                dispatcher.on(Factories.Dispatcher.EVENT_END_RESOLVE, this.onEndResolve, this);
            }
            /**
            * Triggered once after all documents have been read and the dispatcher
            * leaves the resolving phase.
            */
            GroupHandler.prototype.onEndResolve = function (event) {
                function walkDirectory(directory) {
                    directory.groups = GroupHandler.getReflectionGroups(directory.getAllReflections());

                    for (var key in directory.directories) {
                        if (!directory.directories.hasOwnProperty(key))
                            continue;
                        walkDirectory(directory.directories[key]);
                    }
                }

                var project = event.project;
                if (project.children && project.children.length > 0) {
                    project.children.sort(GroupHandler.sortCallback);
                    project.groups = GroupHandler.getReflectionGroups(project.children);
                }

                project.reflections.forEach(function (reflection) {
                    reflection.kindString = GroupHandler.getKindSingular(reflection.kind);
                    if (!reflection.isSignature && reflection.children && reflection.children.length > 0) {
                        reflection.children.sort(GroupHandler.sortCallback);
                        reflection.groups = GroupHandler.getReflectionGroups(reflection.children);
                    }
                });

                walkDirectory(project.directory);
                project.files.forEach(function (file) {
                    file.groups = GroupHandler.getReflectionGroups(file.reflections);
                });
            };

            /**
            * Create a grouped representation of the given list of reflections.
            *
            * Reflections are grouped by kind and sorted by weight and name.
            *
            * @param reflections  The reflections that should be grouped.
            * @returns An array containing all children of the given reflection grouped by their kind.
            */
            GroupHandler.getReflectionGroups = function (reflections) {
                var groups = [];
                reflections.forEach(function (child) {
                    for (var i = 0; i < groups.length; i++) {
                        var group = groups[i];
                        if (group.kind != child.kind) {
                            continue;
                        }

                        group.children.push(child);
                        return;
                    }

                    var group = new TypeDoc.Models.ReflectionGroup(GroupHandler.getKindPlural(child.kind), child.kind);
                    group.children.push(child);
                    groups.push(group);
                });

                groups.forEach(function (group) {
                    var someExported = false, allInherited = true, allPrivate = true, allExternal = true;
                    group.children.forEach(function (child) {
                        someExported = child.isExported || someExported;
                        allInherited = child.inheritedFrom && allInherited;
                        allPrivate = child.isPrivate && allPrivate;
                        allExternal = child.isExternal && allExternal;
                    });

                    group.someChildrenAreExported = someExported;
                    group.allChildrenAreInherited = allInherited;
                    group.allChildrenArePrivate = allPrivate;
                    group.allChildrenAreExternal = allExternal;
                });

                return groups;
            };

            /**
            * Transform the internal typescript kind identifier into a human readable version.
            *
            * @param kind  The original typescript kind identifier.
            * @returns A human readable version of the given typescript kind identifier.
            */
            GroupHandler.getKindString = function (kind) {
                var str = TypeScript.PullElementKind[kind];
                str = str.replace(/(.)([A-Z])/g, function (m, a, b) {
                    return a + ' ' + b.toLowerCase();
                });
                return str;
            };

            /**
            * Return the singular name of a internal typescript kind identifier.
            *
            * @param kind The original internal typescript kind identifier.
            * @returns The singular name of the given internal typescript kind identifier
            */
            GroupHandler.getKindSingular = function (kind) {
                if (GroupHandler.SINGULARS[kind]) {
                    return GroupHandler.SINGULARS[kind];
                } else {
                    return GroupHandler.getKindString(kind);
                }
            };

            /**
            * Return the plural name of a internal typescript kind identifier.
            *
            * @param kind The original internal typescript kind identifier.
            * @returns The plural name of the given internal typescript kind identifier
            */
            GroupHandler.getKindPlural = function (kind) {
                if (GroupHandler.PLURALS[kind]) {
                    return GroupHandler.PLURALS[kind];
                } else {
                    return this.getKindString(kind) + 's';
                }
            };

            /**
            * Callback used to sort reflections by weight defined by ´GroupHandler.WEIGHTS´ and name.
            *
            * @param a The left reflection to sort.
            * @param b The right reflection to sort.
            * @returns The sorting weight.
            */
            GroupHandler.sortCallback = function (a, b) {
                var aWeight = GroupHandler.WEIGHTS.indexOf(a.kind);
                var bWeight = GroupHandler.WEIGHTS.indexOf(b.kind);
                if (aWeight == bWeight) {
                    if (a.name == b.name)
                        return 0;
                    return a.name > b.name ? 1 : -1;
                } else
                    return aWeight - bWeight;
            };
            GroupHandler.WEIGHTS = [
                TypeScript.PullElementKind.DynamicModule,
                TypeScript.PullElementKind.Container,
                TypeScript.PullElementKind.Enum,
                TypeScript.PullElementKind.Interface,
                TypeScript.PullElementKind.Class,
                TypeScript.PullElementKind.ObjectLiteral,
                TypeScript.PullElementKind.EnumMember,
                TypeScript.PullElementKind.ConstructorMethod,
                TypeScript.PullElementKind.Property,
                TypeScript.PullElementKind.GetAccessor,
                TypeScript.PullElementKind.SetAccessor,
                TypeScript.PullElementKind.Method,
                TypeScript.PullElementKind.Function,
                TypeScript.PullElementKind.Variable
            ];

            GroupHandler.SINGULARS = (function () {
                var singulars = {};
                singulars[TypeScript.PullElementKind.Container] = 'Module';
                singulars[TypeScript.PullElementKind.Enum] = 'Enumeration';
                singulars[TypeScript.PullElementKind.EnumMember] = 'Enumeration member';
                return singulars;
            })();

            GroupHandler.PLURALS = (function () {
                var plurals = {};
                plurals[TypeScript.PullElementKind.Container] = 'Modules';
                plurals[TypeScript.PullElementKind.Class] = 'Classes';
                plurals[TypeScript.PullElementKind.Property] = 'Properties';
                plurals[TypeScript.PullElementKind.Enum] = 'Enumerations';
                plurals[TypeScript.PullElementKind.EnumMember] = 'Enumeration members';
                return plurals;
            })();
            return GroupHandler;
        })(Factories.BaseHandler);
        Factories.GroupHandler = GroupHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(GroupHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        var InheritanceHandler = (function (_super) {
            __extends(InheritanceHandler, _super);
            /**
            * Create a new InheritanceHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function InheritanceHandler(dispatcher) {
                _super.call(this, dispatcher);

                dispatcher.on(Factories.Dispatcher.EVENT_CREATE_REFLECTION, this.onCreateReflection, this);
                dispatcher.on(Factories.Dispatcher.EVENT_MERGE_REFLECTION, this.onMergeReflection, this);
                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN_DECLARATION, this.onBeginDeclaration, this, 1024);
                dispatcher.on(Factories.Dispatcher.EVENT_END_DECLARATION, this.onEndDeclaration, this);
            }
            /**
            * Triggered when the dispatcher creates a new reflection instance.
            *
            * Sets [[DeclarationReflection.inheritedFrom]] on inherited members.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            InheritanceHandler.prototype.onCreateReflection = function (state) {
                if (state.isInherited) {
                    state.reflection.inheritedFrom = new TypeDoc.Models.LateResolvingType(state.declaration);
                }
            };

            /**
            * Triggered when the dispatcher merges an existing reflection with a new declaration.
            *
            * Sets [[DeclarationReflection.overwrites]] on overwritten members.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            InheritanceHandler.prototype.onMergeReflection = function (state) {
                if (state.isInherited) {
                    var isOverwrite = !state.reflection.inheritedFrom && !state.kindOf([TypeDoc.Models.Kind.Class, TypeDoc.Models.Kind.Interface]);

                    if (isOverwrite) {
                        state.reflection.overwrites = new TypeDoc.Models.LateResolvingType(state.declaration);
                        state.preventDefault();
                    }
                }
            };

            /**
            * Triggered when the dispatcher starts processing a declaration.
            *
            * Prevents private and static members from being inherited.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            InheritanceHandler.prototype.onBeginDeclaration = function (state) {
                if (state.isInherited) {
                    var preventInheritance = state.hasFlag(TypeScript.PullElementFlags.Private) || state.hasFlag(TypeScript.PullElementFlags.Static);

                    if (preventInheritance) {
                        state.preventDefault();
                        state.stopPropagation();
                    }
                }
            };

            /**
            * Triggered when the dispatcher has finished processing a declaration.
            *
            * Emits an additional [[DeclarationState]] for each extended type on the current
            * reflection.
            *
            * Sets [[DeclarationReflection.extendedBy]] and [[DeclarationReflection.extendedTypes]].
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            InheritanceHandler.prototype.onEndDeclaration = function (state) {
                var _this = this;
                if (state.isInherited) {
                    return;
                }

                var symbol = state.declaration.getSymbol();
                if (!(symbol instanceof TypeScript.PullTypeSymbol)) {
                    return;
                }

                InheritanceHandler.collectExtendedTypes(symbol).forEach(function (declaration) {
                    _this.dispatcher.processState(state.createInheritanceState(declaration));
                });

                var extendedBy = symbol.getTypesThatExtendThisType();
                if (extendedBy.length > 0) {
                    if (!state.reflection.extendedBy)
                        state.reflection.extendedBy = [];
                    extendedBy.forEach(function (symbol) {
                        state.reflection.extendedBy.push(new TypeDoc.Models.LateResolvingType(symbol));
                    });
                }

                var extendedTypes = symbol.getExtendedTypes();
                if (extendedTypes.length > 0) {
                    if (!state.reflection.extendedTypes)
                        state.reflection.extendedTypes = [];
                    extendedTypes.forEach(function (symbol) {
                        state.reflection.extendedTypes.push(new TypeDoc.Models.LateResolvingType(symbol));
                    });
                }
            };

            /**
            * Create a list of all declarations that are super declarations the given symbol.
            *
            * @param symbol  The symbol whose parent declarations should be found.
            * @returns       A list of declarations that serve as parent declarations for the given symbol.
            */
            InheritanceHandler.collectExtendedTypes = function (symbol) {
                var result = [];
                var symbols = [symbol];

                function process(symbol) {
                    symbol.getExtendedTypes().forEach(function (extended) {
                        extended.getDeclarations().forEach(function (declaration) {
                            if (result.indexOf(declaration) != -1) {
                                return;
                            }

                            result.push(declaration);

                            var symbol = declaration.getSymbol();
                            if (symbol instanceof TypeScript.PullTypeSymbol) {
                                symbols.push(symbol);
                            }
                        });
                    });
                }

                while (symbols.length > 0) {
                    var processing = symbols.splice(0);
                    symbols.length = 0;
                    processing.forEach(process);
                }

                return result;
            };
            return InheritanceHandler;
        })(Factories.BaseHandler);
        Factories.InheritanceHandler = InheritanceHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(InheritanceHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        

        /**
        * A handler that extracts comments of containers like modules.
        *
        * The [[CommentHandler]] only extracts comments directly attached to the current
        * declaration, while this handler looks up the comments of the parent ast of the given
        * declaration if it is some container. As modules might be defined multiple times,
        * this handler stores the found comments and applies them in the resolving phase.
        *
        * If multiple comments for the same module are found, the longest comment will be preferred.
        * One may explicitly set the preferred module comment by appending the tag `@preferred`.
        */
        var ModuleCommentHandler = (function (_super) {
            __extends(ModuleCommentHandler, _super);
            /**
            * Create a new ModuleCommentHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function ModuleCommentHandler(dispatcher) {
                _super.call(this, dispatcher);

                this.factory = TypeScript.getAstWalkerFactory();

                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN, this.onBegin, this);
                dispatcher.on(Factories.Dispatcher.EVENT_DECLARATION, this.onDeclaration, this);
                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN_RESOLVE, this.onBeginResolve, this);
            }
            /**
            * Triggered once per project before the dispatcher invokes the compiler.
            *
            * @param event  An event object containing the related project and compiler instance.
            */
            ModuleCommentHandler.prototype.onBegin = function (event) {
                this.comments = {};
            };

            /**
            * Triggered when the dispatcher processes a declaration.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            ModuleCommentHandler.prototype.onDeclaration = function (state) {
                if (!state.kindOf(TypeScript.PullElementKind.Container)) {
                    return;
                }

                var ast = state.declaration.ast();
                ast = ast.parent;
                if (ast && ast.kind() == 121 /* QualifiedName */) {
                    var identifiers = [];
                    this.factory.simpleWalk(ast, function (ast, astState) {
                        if (ast.kind() == 11 /* IdentifierName */) {
                            identifiers.push(ast);
                        }
                    });

                    if (identifiers.indexOf(state.declaration.ast()) < identifiers.length - 1) {
                        return;
                    }

                    while (ast && ast.kind() == 121 /* QualifiedName */) {
                        ast = ast.parent;
                    }
                }

                if (!ast || ast.kind() != 130 /* ModuleDeclaration */) {
                    return;
                }

                var comments = ast.preComments();
                if (!comments || comments.length == 0) {
                    return;
                }

                var comment = comments[comments.length - 1];
                if (!Factories.CommentHandler.isDocComment(comment)) {
                    return;
                }

                var fullText = comment.fullText();
                var isPreferred = (fullText.toLowerCase().indexOf('@preferred') != -1);

                if (this.comments[state.reflection.id]) {
                    var info = this.comments[state.reflection.id];
                    if (!isPreferred && (info.isPreferred || info.fullText.length > fullText.length)) {
                        return;
                    }

                    info.fullText = fullText;
                    info.isPreferred = isPreferred;
                } else {
                    this.comments[state.reflection.id] = {
                        reflection: state.reflection,
                        fullText: fullText,
                        isPreferred: isPreferred
                    };
                }
            };

            /**
            * Triggered when the dispatcher enters the resolving phase.
            *
            * @param event  An event object containing the related project and compiler instance.
            */
            ModuleCommentHandler.prototype.onBeginResolve = function (event) {
                for (var id in this.comments) {
                    if (!this.comments.hasOwnProperty(id)) {
                        continue;
                    }

                    var info = this.comments[id];
                    var comment = Factories.CommentHandler.parseDocComment(info.fullText);
                    Factories.CommentHandler.removeTags(comment, 'preferred');

                    info.reflection.comment = comment;
                }
            };
            return ModuleCommentHandler;
        })(Factories.BaseHandler);
        Factories.ModuleCommentHandler = ModuleCommentHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(ModuleCommentHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A handler that filters declarations that should be ignored and prevents
        * the creation of reflections for them.
        *
        * TypeDoc currently ignores all type aliases, object literals, object types and
        * implicit variables. Furthermore declaration files are ignored.
        */
        var NullHandler = (function (_super) {
            __extends(NullHandler, _super);
            /**
            * Create a new NullHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function NullHandler(dispatcher) {
                _super.call(this, dispatcher);
                /**
                * Should declaration files be documented?
                */
                this.includeDeclarations = false;
                /**
                * An array of all declaration kinds that should be ignored.
                */
                this.ignoredKinds = [
                    TypeScript.PullElementKind.ObjectLiteral,
                    TypeScript.PullElementKind.ObjectType,
                    TypeScript.PullElementKind.TypeAlias,
                    TypeScript.PullElementKind.FunctionType,
                    TypeScript.PullElementKind.FunctionExpression
                ];

                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN, this.onBegin, this, 1024);
                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN_DOCUMENT, this.onBeginDocument, this, 1024);
                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN_DECLARATION, this.onBeginDeclaration, this, 1024);
            }
            /**
            * Triggered once per project before the dispatcher invokes the compiler.
            *
            * @param event  An event object containing the related project and compiler instance.
            */
            NullHandler.prototype.onBegin = function (event) {
                this.includeDeclarations = this.dispatcher.application.settings.includeDeclarations;
            };

            /**
            * Triggered when the dispatcher starts processing a TypeScript document.
            *
            * Prevents `lib.d.ts` from being processed.
            * Prevents declaration files from being processed depending on [[Settings.excludeDeclarations]].
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            NullHandler.prototype.onBeginDocument = function (state) {
                if (state.document.isDeclareFile()) {
                    if (!this.includeDeclarations || state.document.fileName.substr(-8) == 'lib.d.ts') {
                        this.dispatcher.application.log(Util.format('Skipping declaration file %s', state.document.fileName), 0 /* Verbose */);

                        state.stopPropagation();
                        state.preventDefault();
                    }
                }
            };

            /**
            * Triggered when the dispatcher starts processing a declaration.
            *
            * Ignores all type aliases, object literals and types.
            * Ignores all implicit variables.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            NullHandler.prototype.onBeginDeclaration = function (state) {
                if (state.isSignature) {
                    return;
                }

                if (state.kindOf(this.ignoredKinds)) {
                    state.stopPropagation();
                    state.preventDefault();
                }

                if (state.kindOf(TypeDoc.Models.Kind.Variable) && state.hasFlag(TypeDoc.Models.Flags.ImplicitVariable)) {
                    state.stopPropagation();
                    state.preventDefault();
                }
            };
            return NullHandler;
        })(Factories.BaseHandler);
        Factories.NullHandler = NullHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(NullHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A handler that reflects object literals defined as variables.
        */
        var ObjectLiteralHandler = (function (_super) {
            __extends(ObjectLiteralHandler, _super);
            /**
            * Create a new ObjectLiteralHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function ObjectLiteralHandler(dispatcher) {
                _super.call(this, dispatcher);

                dispatcher.on(Factories.Dispatcher.EVENT_END_DECLARATION, this.onEndDeclaration, this);
            }
            /**
            * Triggered when the dispatcher has finished processing a declaration.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            ObjectLiteralHandler.prototype.onEndDeclaration = function (state) {
                var _this = this;
                var literal = ObjectLiteralHandler.getLiteralDeclaration(state.declaration);
                if (literal && literal.getChildDecls().length > 0) {
                    if (state.kindOf(TypeScript.PullElementKind.Variable)) {
                        state.reflection.kind = Factories.ReflectionHandler.mergeKinds(state.reflection.kind, TypeScript.PullElementKind.ObjectLiteral);
                        literal.getChildDecls().forEach(function (declaration) {
                            var childState = state.createChildState(declaration);

                            _this.dispatcher.processState(childState);
                            if (childState.kindOf(TypeScript.PullElementKind.IndexSignature)) {
                                childState.reflection.name = state.reflection.name + ' index signature';
                            }
                        });
                    } else {
                        literal.getChildDecls().forEach(function (declaration) {
                            var childState = state.createChildState(declaration);
                            childState.isFlattened = true;
                            childState.flattenedName = state.flattenedName ? state.flattenedName + '.' + state.declaration.name : state.getName();

                            _this.dispatcher.processState(childState);
                            if (childState.kindOf(TypeScript.PullElementKind.IndexSignature)) {
                                childState.reflection.name = state.reflection.name + ' index signature';
                            }
                        });
                    }

                    state.reflection.type = Factories.TypeHandler.createNamedType('Object');
                }
            };

            ObjectLiteralHandler.getLiteralDeclaration = function (declaration) {
                var symbol = declaration.getSymbol();
                if (!symbol) {
                    return null;
                }

                if (symbol.type && (symbol.type.kind & TypeScript.PullElementKind.ObjectLiteral || symbol.type.kind & TypeScript.PullElementKind.ObjectType)) {
                    return symbol.type.getDeclarations()[0];
                } else {
                    return null;
                }
            };
            return ObjectLiteralHandler;
        })(Factories.BaseHandler);
        Factories.ObjectLiteralHandler = ObjectLiteralHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(ObjectLiteralHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A handler that tries to find the package.json and readme.md files of the
        * current project.
        *
        * The handler traverses the file tree upwards for each file processed by the processor
        * and records the nearest package info files it can find. Within the resolve files, the
        * contents of the found files will be read and appended to the ProjectReflection.
        */
        var PackageHandler = (function (_super) {
            __extends(PackageHandler, _super);
            /**
            * Create a new PackageHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function PackageHandler(dispatcher) {
                _super.call(this, dispatcher);

                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN, this.onBegin, this);
                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN_DOCUMENT, this.onBeginDocument, this);
                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN_RESOLVE, this.onBeginResolve, this);
            }
            /**
            * Triggered once per project before the dispatcher invokes the compiler.
            *
            * @param event  An event object containing the related project and compiler instance.
            */
            PackageHandler.prototype.onBegin = function (event) {
                this.readmeFile = null;
                this.packageFile = null;
                this.visited = [];

                var readme = event.dispatcher.application.settings.readme;
                this.noReadmeFile = (readme == 'none');
                if (!this.noReadmeFile && readme) {
                    readme = Path.resolve(readme);
                    if (FS.existsSync(readme)) {
                        this.readmeFile = readme;
                    }
                }
            };

            /**
            * Triggered when the dispatcher begins processing a typescript document.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            PackageHandler.prototype.onBeginDocument = function (state) {
                var _this = this;
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

                    FS.readdirSync(dirName).forEach(function (file) {
                        var lfile = file.toLowerCase();
                        if (!_this.noReadmeFile && !_this.readmeFile && lfile == 'readme.md') {
                            _this.readmeFile = Path.join(dirName, file);
                        }

                        if (!_this.packageFile && lfile == 'package.json') {
                            _this.packageFile = Path.join(dirName, file);
                        }
                    });

                    this.visited.push(dirName);
                    parentDir = Path.resolve(Path.join(dirName, '..'));
                } while(dirName != parentDir);
            };

            /**
            * Triggered when the dispatcher enters the resolving phase.
            *
            * @param event  The event containing the project and compiler.
            */
            PackageHandler.prototype.onBeginResolve = function (event) {
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
            };
            return PackageHandler;
        })(Factories.BaseHandler);
        Factories.PackageHandler = PackageHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(PackageHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A handler that sets the most basic reflection properties.
        */
        var ReflectionHandler = (function (_super) {
            __extends(ReflectionHandler, _super);
            /**
            * Create a new ReflectionHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function ReflectionHandler(dispatcher) {
                _super.call(this, dispatcher);

                dispatcher.on(Factories.Dispatcher.EVENT_CREATE_REFLECTION, this.onCreateReflection, this);
                dispatcher.on(Factories.Dispatcher.EVENT_MERGE_REFLECTION, this.onMergeReflection, this);
                dispatcher.on(Factories.Dispatcher.EVENT_RESOLVE, this.onResolve, this);
            }
            /**
            * Triggered when the dispatcher creates a new reflection instance.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            ReflectionHandler.prototype.onCreateReflection = function (state) {
                state.reflection.flags = state.declaration.flags;
                state.reflection.kind = state.declaration.kind;
                state.reflection.isExternal = state.isExternal;

                var symbol = state.declaration.getSymbol();
                if (symbol) {
                    state.reflection.type = Factories.TypeHandler.createType(symbol.type);
                    state.reflection.definition = symbol.toString();
                    state.reflection.isOptional = symbol.isOptional;

                    if (state.declaration.kind == TypeDoc.Models.Kind.Parameter) {
                        var ast = state.declaration.ast().equalsValueClause;
                        if (ast) {
                            var snapshot = state.getSnapshot(ast.fileName());
                            var source = snapshot.getText(ast.start(), ast.end());
                            source = source.replace(/^[\s=]+|\s+$/g, '');
                            state.reflection.defaultValue = source;
                        }
                    }
                } else {
                    state.reflection.definition = state.reflection.name;
                }
            };

            /**
            * Triggered when the dispatcher merges an existing reflection with a new declaration.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            ReflectionHandler.prototype.onMergeReflection = function (state) {
                ReflectionHandler.MERGE_STRATEGY.forEach(function (strategy) {
                    if (strategy.reflection && !state.reflection.kindOf(strategy.reflection))
                        return;
                    if (strategy.declaration && !state.kindOf(strategy.declaration))
                        return;
                    strategy.actions.forEach(function (action) {
                        return action(state);
                    });
                });

                state.reflection.isExternal = state.isExternal && state.reflection.isExternal;
                state.reflection.kind = ReflectionHandler.mergeKinds(state.reflection.kind, state.declaration.kind);
            };

            /**
            * Triggered by the dispatcher for each reflection in the resolving phase.
            *
            * @param event  The event containing the reflection to resolve.
            */
            ReflectionHandler.prototype.onResolve = function (event) {
                var reflection = event.reflection;
                var flagsArray = [];
                var flags = reflection.kindOf(TypeDoc.Models.Kind.Parameter) ? ReflectionHandler.RELEVANT_PARAMETER_FLAGS : ReflectionHandler.RELEVANT_FLAGS;
                flags.forEach(function (key) {
                    if ((reflection.flags & key) == key) {
                        flagsArray.push(TypeScript.PullElementFlags[key].toLowerCase());
                    }
                });

                var isExported = false, target = reflection;
                if (target.kindOf(TypeDoc.Models.Kind.SomeContainer)) {
                    isExported = true;
                }

                while (!isExported && target && target instanceof TypeDoc.Models.DeclarationReflection) {
                    if (target.kindOf(TypeDoc.Models.Kind.SomeContainer))
                        break;
                    isExported = ((target.flags & 1 /* Exported */) == 1 /* Exported */);
                    target = target.parent;
                }

                reflection.flagsArray = flagsArray;
                reflection.isExported = isExported;
                reflection.isStatic = ((reflection.flags & TypeDoc.Models.Flags.Static) == TypeDoc.Models.Flags.Static);
                reflection.isPrivate = ((reflection.flags & TypeDoc.Models.Flags.Private) == TypeDoc.Models.Flags.Private);
            };

            /**
            * Convert the reflection of the given state to a call signature.
            *
            * Applied when a function is merged with a container.
            *
            * @param state  The state whose reflection should be converted to a call signature.
            */
            ReflectionHandler.convertFunctionToCallSignature = function (state) {
                var reflection = state.reflection;
                var name = reflection.name;
                reflection.kind = TypeScript.PullElementKind.CallSignature;
                reflection.name = '';
                reflection.signatures.forEach(function (signature) {
                    signature.name = '';
                });

                var index = reflection.parent.children.indexOf(reflection);
                reflection.parent.children.splice(index, 1);

                state.reflection = null;
                state.dispatcher.ensureReflection(state);

                reflection.parent = state.reflection;
                state.reflection.children.push(reflection);
                state.reflection.name = name;
            };

            /**
            * Applied when a container is merged with a variable.
            *
            * @param state
            */
            ReflectionHandler.implementVariableType = function (state) {
                state.reflection.kind = TypeScript.PullElementKind.ObjectLiteral;

                var symbol = state.declaration.getSymbol();
                if (symbol && symbol.type) {
                    var declaration = symbol.type.getDeclarations();
                    symbol.type.getDeclarations().forEach(function (declaration) {
                        ReflectionHandler.sortDeclarations(declaration.getChildDecls()).forEach(function (declaration) {
                            state.dispatcher.processState(state.createChildState(declaration));
                        });
                    });
                }
            };

            /**
            * Sort the given list of declarations for being correctly processed.
            *
            * @param declarations  The list of declarations that should be processed.
            * @returns             The sorted list.
            */
            ReflectionHandler.sortDeclarations = function (declarations) {
                return declarations.sort(function (left, right) {
                    if (left.kind == right.kind)
                        return 0;

                    var leftWeight = ReflectionHandler.KIND_PROCESS_ORDER.indexOf(left.kind);
                    var rightWeight = ReflectionHandler.KIND_PROCESS_ORDER.indexOf(right.kind);
                    if (leftWeight == rightWeight) {
                        return 0;
                    } else {
                        return leftWeight > rightWeight ? -1 : 1;
                    }
                });
            };

            /**
            * Merge two kind definitions.
            *
            * @param left   The left kind to merge.
            * @param right  The right kind to merge.
            */
            ReflectionHandler.mergeKinds = function (left, right) {
                if (left == right) {
                    return left;
                }

                var leftWeight = ReflectionHandler.KIND_WEIGHTS.indexOf(left);
                var rightWeight = ReflectionHandler.KIND_WEIGHTS.indexOf(right);
                if (leftWeight < rightWeight) {
                    return right;
                } else {
                    return left;
                }
            };
            ReflectionHandler.RELEVANT_FLAGS = [
                TypeScript.PullElementFlags.Optional,
                TypeScript.PullElementFlags.Private,
                TypeScript.PullElementFlags.Static
            ];

            ReflectionHandler.RELEVANT_PARAMETER_FLAGS = [
                TypeScript.PullElementFlags.Optional
            ];

            ReflectionHandler.KIND_WEIGHTS = [
                TypeScript.PullElementKind.AcceptableAlias,
                TypeScript.PullElementKind.CallSignature,
                TypeScript.PullElementKind.CatchBlock,
                TypeScript.PullElementKind.CatchVariable,
                TypeScript.PullElementKind.ConstructSignature,
                TypeScript.PullElementKind.ConstructorMethod,
                TypeScript.PullElementKind.ConstructorType,
                TypeScript.PullElementKind.EnumMember,
                TypeScript.PullElementKind.Function,
                TypeScript.PullElementKind.FunctionExpression,
                TypeScript.PullElementKind.FunctionType,
                TypeScript.PullElementKind.GetAccessor,
                0 /* Global */,
                TypeScript.PullElementKind.IndexSignature,
                TypeScript.PullElementKind.Method,
                0 /* None */,
                TypeScript.PullElementKind.ObjectType,
                TypeScript.PullElementKind.Parameter,
                TypeScript.PullElementKind.Primitive,
                TypeScript.PullElementKind.Script,
                TypeScript.PullElementKind.SetAccessor,
                TypeScript.PullElementKind.TypeAlias,
                TypeScript.PullElementKind.TypeParameter,
                TypeScript.PullElementKind.WithBlock,
                TypeScript.PullElementKind.Variable,
                TypeScript.PullElementKind.Property,
                TypeScript.PullElementKind.Enum,
                TypeScript.PullElementKind.ObjectLiteral,
                TypeScript.PullElementKind.Container,
                TypeScript.PullElementKind.Interface,
                TypeScript.PullElementKind.Class,
                TypeScript.PullElementKind.DynamicModule
            ];

            ReflectionHandler.KIND_PROCESS_ORDER = [
                TypeScript.PullElementKind.Variable,
                TypeScript.PullElementKind.AcceptableAlias,
                TypeScript.PullElementKind.CallSignature,
                TypeScript.PullElementKind.CatchBlock,
                TypeScript.PullElementKind.CatchVariable,
                TypeScript.PullElementKind.ConstructSignature,
                TypeScript.PullElementKind.ConstructorMethod,
                TypeScript.PullElementKind.ConstructorType,
                TypeScript.PullElementKind.EnumMember,
                TypeScript.PullElementKind.FunctionExpression,
                TypeScript.PullElementKind.FunctionType,
                TypeScript.PullElementKind.GetAccessor,
                0 /* Global */,
                TypeScript.PullElementKind.IndexSignature,
                TypeScript.PullElementKind.Method,
                0 /* None */,
                TypeScript.PullElementKind.ObjectType,
                TypeScript.PullElementKind.Parameter,
                TypeScript.PullElementKind.Primitive,
                TypeScript.PullElementKind.Script,
                TypeScript.PullElementKind.SetAccessor,
                TypeScript.PullElementKind.TypeAlias,
                TypeScript.PullElementKind.TypeParameter,
                TypeScript.PullElementKind.WithBlock,
                TypeScript.PullElementKind.Property,
                TypeScript.PullElementKind.Enum,
                TypeScript.PullElementKind.ObjectLiteral,
                TypeScript.PullElementKind.Interface,
                TypeScript.PullElementKind.Class,
                TypeScript.PullElementKind.DynamicModule,
                TypeScript.PullElementKind.Container,
                TypeScript.PullElementKind.Function
            ];

            ReflectionHandler.MERGE_STRATEGY = [
                {
                    reflection: [TypeScript.PullElementKind.Function],
                    declaration: [TypeScript.PullElementKind.Container],
                    actions: [ReflectionHandler.convertFunctionToCallSignature]
                }, {
                    reflection: [TypeScript.PullElementKind.Container],
                    declaration: [TypeScript.PullElementKind.Variable],
                    actions: [ReflectionHandler.implementVariableType]
                }];
            return ReflectionHandler;
        })(Factories.BaseHandler);
        Factories.ReflectionHandler = ReflectionHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(ReflectionHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A handler that allows a variable to be documented as being the type it is set to.
        *
        * Use the ``@resolve``  javadoc comment to trigger this handler. You can see an example
        * of this handler within the TypeDoc documentation. If you take a look at the [[Models.Kind]]
        * enumeration, it is documented as being a real enumeration, within the source code it is actually
        * just a reference to [[TypeScript.PullElementKind]].
        *
        * ```typescript
        * /**
        *  * @resolve
        *  * /
        * export var Kind = TypeScript.PullElementKind;
        * ```
        */
        var ResolveHandler = (function (_super) {
            __extends(ResolveHandler, _super);
            /**
            * Create a new ResolveHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function ResolveHandler(dispatcher) {
                _super.call(this, dispatcher);

                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN_DECLARATION, this.onBeginDeclaration, this, 1024);
            }
            /**
            * Triggered when the dispatcher starts processing a declaration.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            ResolveHandler.prototype.onBeginDeclaration = function (state) {
                var isResolve = false;
                Factories.CommentHandler.findComments(state).forEach(function (comment) {
                    isResolve = isResolve || /\@resolve/.test(comment);
                });

                if (isResolve) {
                    var symbol = state.declaration.getSymbol();
                    if (!symbol)
                        return;

                    var declarations = symbol.type.getDeclarations();
                    if (!declarations || declarations.length == 0)
                        return;

                    var declaration = state.declaration;
                    state.declaration = declarations[0];

                    this.dispatcher.ensureReflection(state);
                    state.reflection.name = declaration.name;
                }
            };
            return ResolveHandler;
        })(Factories.BaseHandler);
        Factories.ResolveHandler = ResolveHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(ResolveHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A handler that creates signature reflections.
        */
        var SignatureHandler = (function (_super) {
            __extends(SignatureHandler, _super);
            /**
            * Create a new SignatureHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function SignatureHandler(dispatcher) {
                _super.call(this, dispatcher);
                /**
                * The declaration kinds affected by this handler.
                */
                this.affectedKinds = [
                    TypeScript.PullElementKind.SomeFunction,
                    TypeScript.PullElementKind.SomeSignature,
                    TypeScript.PullElementKind.FunctionType
                ];

                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN_DECLARATION, this.onBeginDeclaration, this, 512);
                dispatcher.on(Factories.Dispatcher.EVENT_DECLARATION, this.onDeclaration, this);
            }
            /**
            * Triggered when the dispatcher starts processing a declaration.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            SignatureHandler.prototype.onBeginDeclaration = function (state) {
                // Ignore everything except parameters in functions
                if (state.parentState.isSignature && !state.kindOf(TypeDoc.Models.Kind.Parameter)) {
                    state.preventDefault();
                    return;
                }

                if (state.kindOf(this.affectedKinds) && !(state.isSignature)) {
                    // Ignore inherited overwritten methods
                    if (SignatureHandler.isMethodOverwrite(state)) {
                        var type = new TypeDoc.Models.LateResolvingType(state.declaration);
                        state.reflection.overwrites = type;
                        if (state.reflection.signatures) {
                            state.reflection.signatures.forEach(function (signature) {
                                signature.overwrites = type;
                            });
                        }
                        state.preventDefault();
                    } else {
                        this.dispatcher.ensureReflection(state);
                        state.reflection.kind = state.declaration.kind;
                        state.flattenedName = null;
                        state.isFlattened = false;

                        var hasSignatures = (state.reflection.signatures && state.reflection.signatures.length > 0);
                        var isAccessor = state.kindOf([TypeDoc.Models.Kind.GetAccessor, TypeDoc.Models.Kind.SetAccessor]);
                        if (state.hasFlag(TypeDoc.Models.Flags.Signature) || !hasSignatures || isAccessor) {
                            var signature = state.createSignatureState();
                            this.dispatcher.ensureReflection(signature);

                            signature.reflection.inheritedFrom = state.reflection.inheritedFrom;
                            signature.reflection.overwrites = state.reflection.overwrites;
                            signature.reflection.isSignature = true;

                            this.dispatcher.processState(signature);
                        }

                        // Move to signature
                        if (state.hasFlag(TypeDoc.Models.Flags.Signature)) {
                            state.preventDefault();
                        }
                    }
                }
            };

            /**
            * Triggered when the dispatcher processes a declaration.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            SignatureHandler.prototype.onDeclaration = function (state) {
                if (!state.kindOf(this.affectedKinds)) {
                    return;
                }

                if (state.isSignature) {
                    var symbol = state.declaration.getSignatureSymbol();
                    if (symbol.returnType && symbol.returnType.name != 'void') {
                        state.reflection.type = Factories.TypeHandler.createType(symbol.returnType);
                    } else {
                        state.reflection.type = null;
                    }

                    if (state.kindOf([TypeDoc.Models.Kind.ConstructorMethod, TypeDoc.Models.Kind.ConstructSignature])) {
                        state.reflection.kind = TypeDoc.Models.Kind.ConstructSignature;
                    } else if (state.kindOf([TypeDoc.Models.Kind.GetAccessor, TypeDoc.Models.Kind.SetAccessor])) {
                        state.reflection.kind = state.declaration.kind;
                    } else {
                        state.reflection.kind = TypeDoc.Models.Kind.CallSignature;
                    }
                } else {
                    // Move to siganture
                    state.preventDefault();
                }
            };

            /**
            * Tests whether the given state describes a method overwrite.
            *
            * @param state  The state that should be tested.
            * @returns      TRUE when the state is a method overwrite, otherwise FALSE.
            */
            SignatureHandler.isMethodOverwrite = function (state) {
                if (!state.reflection || !state.isInherited)
                    return false;
                if (!(state.reflection.inheritedFrom instanceof TypeDoc.Models.LateResolvingType))
                    return true;

                var type = state.reflection.inheritedFrom;
                return type.declaration.getParentDecl() != state.declaration.getParentDecl();
            };
            return SignatureHandler;
        })(Factories.BaseHandler);
        Factories.SignatureHandler = SignatureHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(SignatureHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A handler that attaches source file information to reflections.
        */
        var SourceHandler = (function (_super) {
            __extends(SourceHandler, _super);
            /**
            * Create a new SourceHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function SourceHandler(dispatcher) {
                _super.call(this, dispatcher);
                /**
                * Helper for resolving the base path of all source files.
                */
                this.basePath = new Factories.BasePath();
                /**
                * A map of all generated [[SourceFile]] instances.
                */
                this.fileMappings = {};

                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN, this.onBegin, this);
                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN_DOCUMENT, this.onBeginDocument, this);
                dispatcher.on(Factories.Dispatcher.EVENT_DECLARATION, this.onDeclaration, this);
                dispatcher.on(Factories.Dispatcher.EVENT_BEGIN_RESOLVE, this.onBeginResolve, this);
                dispatcher.on(Factories.Dispatcher.EVENT_RESOLVE, this.onResolve, this);
                dispatcher.on(Factories.Dispatcher.EVENT_END_RESOLVE, this.onEndResolve, this, 512);
            }
            /**
            * Triggered once per project before the dispatcher invokes the compiler.
            *
            * @param event  An event object containing the related project and compiler instance.
            */
            SourceHandler.prototype.onBegin = function (event) {
                this.basePath.reset();
                this.fileMappings = {};
            };

            /**
            * Triggered when the dispatcher starts processing a TypeScript document.
            *
            * Create a new [[SourceFile]] instance for all TypeScript files.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            SourceHandler.prototype.onBeginDocument = function (state) {
                var fileName = state.document.fileName;
                this.basePath.add(fileName);

                if (!this.fileMappings[fileName]) {
                    var file = new TypeDoc.Models.SourceFile(fileName);
                    this.fileMappings[fileName] = file;
                    state.project.files.push(file);
                }
            };

            /**
            * Triggered when the dispatcher processes a declaration.
            *
            * Attach the current source file to the [[DeclarationReflection.sources]] array.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            SourceHandler.prototype.onDeclaration = function (state) {
                if (state.isInherited) {
                    if (state.kindOf([TypeDoc.Models.Kind.Class, TypeDoc.Models.Kind.Interface]))
                        return;
                    if (state.reflection.overwrites)
                        return;
                } else if (!state.isSignature && !state.kindOf(TypeDoc.Models.Kind.Parameter)) {
                    var fileName = state.originalDeclaration.ast().fileName();
                    if (this.fileMappings[fileName]) {
                        this.fileMappings[fileName].reflections.push(state.reflection);
                    }
                }

                var ast = state.declaration.ast();
                var fileName = state.declaration.ast().fileName();
                var snapshot = state.getSnapshot(fileName);

                this.basePath.add(fileName);
                state.reflection.sources.push({
                    file: this.fileMappings[fileName],
                    fileName: fileName,
                    line: snapshot.getLineNumber(ast.start()) + 1
                });
            };

            /**
            * Triggered when the dispatcher enters the resolving phase.
            *
            * @param event  An event object containing the related project and compiler instance.
            */
            SourceHandler.prototype.onBeginResolve = function (event) {
                var _this = this;
                event.project.files.forEach(function (file) {
                    var fileName = file.fileName = _this.basePath.trim(file.fileName);
                    _this.fileMappings[fileName] = file;
                });
            };

            /**
            * Triggered by the dispatcher for each reflection in the resolving phase.
            *
            * @param event  The event containing the reflection to resolve.
            */
            SourceHandler.prototype.onResolve = function (event) {
                var _this = this;
                event.reflection.sources.forEach(function (source) {
                    source.fileName = _this.basePath.trim(source.fileName);
                });
            };

            /**
            * Triggered when the dispatcher leaves the resolving phase.
            *
            * @param event  An event object containing the related project and compiler instance.
            */
            SourceHandler.prototype.onEndResolve = function (event) {
                var home = event.project.directory;
                event.project.files.forEach(function (file) {
                    var reflections = [];
                    file.reflections.forEach(function (reflection) {
                        if (reflection.sources.length > 1)
                            return;
                        var parent = reflection.parent;
                        while (!(parent instanceof TypeDoc.Models.ProjectReflection)) {
                            if (reflections.indexOf(parent) != -1)
                                return;
                            parent = parent.parent;
                        }

                        reflections.push(reflection);
                    });

                    var directory = home;
                    var path = Path.dirname(file.fileName);
                    if (path != '.') {
                        path.split('/').forEach(function (path) {
                            if (!directory.directories[path]) {
                                directory.directories[path] = new TypeDoc.Models.SourceDirectory(path, directory);
                            }
                            directory = directory.directories[path];
                        });
                    }

                    directory.files.push(file);
                    reflections.sort(Factories.GroupHandler.sortCallback);
                    file.parent = directory;
                    file.reflections = reflections;
                });
            };
            return SourceHandler;
        })(Factories.BaseHandler);
        Factories.SourceHandler = SourceHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(SourceHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A handler that converts all instances of [[LateResolvingType]] to their renderable equivalents.
        */
        var TypeHandler = (function (_super) {
            __extends(TypeHandler, _super);
            /**
            * Create a new TypeHandler instance.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function TypeHandler(dispatcher) {
                _super.call(this, dispatcher);

                dispatcher.on(Factories.Dispatcher.EVENT_RESOLVE, this.onResolve, this);
            }
            /**
            * Triggered by the dispatcher for each reflection in the resolving phase.
            *
            * @param event  The event containing the reflection to resolve.
            */
            TypeHandler.prototype.onResolve = function (event) {
                var reflection = event.reflection;
                var compiler = event.compiler;

                reflection.type = this.resolveType(reflection.type, compiler);
                reflection.inheritedFrom = this.resolveType(reflection.inheritedFrom, compiler);
                reflection.overwrites = this.resolveType(reflection.overwrites, compiler);
                reflection.extendedTypes = this.resolveTypes(reflection.extendedTypes, compiler);
                reflection.extendedBy = this.resolveTypes(reflection.extendedBy, compiler);
                reflection.typeHierarchy = TypeHandler.buildTypeHierarchy(reflection);
            };

            /**
            * Resolve the given array of types.
            *
            * This is a utility function which calls [[resolveType]] on all elements of the array.
            *
            * @param types     The array of types that should be resolved.
            * @param compiler  The compiler used by the dispatcher.
            * @returns         The given array with resolved types.
            */
            TypeHandler.prototype.resolveTypes = function (types, compiler) {
                if (!types)
                    return types;
                for (var i = 0, c = types.length; i < c; i++) {
                    types[i] = this.resolveType(types[i], compiler);
                }
                return types;
            };

            /**
            * Resolve the given type.
            *
            * Only instances of [[Models.LateResolvingType]] will be resolved. This function tries
            * to generate an instance of [[Models.ReflectionType]].
            *
            * @param type      The type that should be resolved.
            * @param compiler  The compiler used by the dispatcher.
            * @returns         The resolved type.
            */
            TypeHandler.prototype.resolveType = function (type, compiler) {
                if (!type)
                    return type;
                if (!(type instanceof TypeDoc.Models.LateResolvingType))
                    return type;

                var isArray = false;
                var symbol = type.symbol;
                if (!symbol)
                    return undefined;

                var declaration;
                if (symbol.isArrayNamedTypeReference()) {
                    declaration = symbol.getElementType().getDeclarations()[0];
                    isArray = true;
                } else {
                    declaration = type.declaration;
                }

                var declID = declaration.declID;
                var reflection = compiler.idMap[declID];
                if (reflection) {
                    if (reflection.kindOf(TypeDoc.Models.Kind.SomeSignature)) {
                        reflection = reflection.parent;
                    }
                    return new TypeDoc.Models.ReflectionType(reflection, isArray);
                } else {
                    if (symbol.fullName() == '') {
                        return TypeHandler.createNamedType(symbol.toString());
                    } else {
                        return TypeHandler.createNamedType(symbol.fullName());
                    }
                }
            };

            /**
            * Return the simplified type hierarchy for the given reflection.
            *
            * @TODO Type hierarchies for interfaces with multiple parent interfaces.
            *
            * @param reflection The reflection whose type hierarchy should be generated.
            * @returns The root of the generated type hierarchy.
            */
            TypeHandler.buildTypeHierarchy = function (reflection) {
                if (!reflection.extendedTypes && !reflection.extendedBy) {
                    return null;
                }

                var root;
                var hierarchy;
                function push(types) {
                    var level = { types: types };
                    if (hierarchy) {
                        hierarchy.next = level;
                        hierarchy = level;
                    } else {
                        root = hierarchy = level;
                    }
                }

                if (reflection.extendedTypes) {
                    push(reflection.extendedTypes);
                }

                push([new TypeDoc.Models.ReflectionType(reflection, false)]);
                hierarchy.isTarget = true;

                if (reflection.extendedBy) {
                    push(reflection.extendedBy);
                }

                return root;
            };

            /**
            * Create a type instance for the given symbol.
            *
            * The following native TypeScript types are not supported:
            *  * TypeScript.PullErrorTypeSymbol
            *  * TypeScript.PullTypeAliasSymbol
            *  * TypeScript.PullTypeParameterSymbol
            *  * TypeScript.PullTypeSymbol
            *
            * @param symbol  The TypeScript symbol the type should point to.
            */
            TypeHandler.createType = function (symbol) {
                if (symbol instanceof TypeScript.PullStringConstantTypeSymbol) {
                    return TypeHandler.createStringConstantType(symbol.name);
                } else if (symbol instanceof TypeScript.PullPrimitiveTypeSymbol) {
                    return TypeHandler.createNamedType(symbol.getDisplayName());
                } else {
                    return new TypeDoc.Models.LateResolvingType(symbol);
                }
            };

            /**
            * Create a string constant type. If the type has been created before, the existent type will be returned.
            *
            * @param name  The name of the type.
            * @returns     The type instance.
            */
            TypeHandler.createStringConstantType = function (name) {
                if (!TypeHandler.stringConstantTypes[name]) {
                    TypeHandler.stringConstantTypes[name] = new TypeDoc.Models.StringConstantType(name);
                }

                return TypeHandler.stringConstantTypes[name];
            };

            /**
            * Create a named type. If the type has been created before, the existent type will be returned.
            *
            * @param name  The name of the type.
            * @returns     The type instance.
            */
            TypeHandler.createNamedType = function (name) {
                if (!TypeHandler.namedTypes[name]) {
                    TypeHandler.namedTypes[name] = new TypeDoc.Models.NamedType(name);
                }

                return TypeHandler.namedTypes[name];
            };
            TypeHandler.stringConstantTypes = {};

            TypeHandler.namedTypes = {};
            return TypeHandler;
        })(Factories.BaseHandler);
        Factories.TypeHandler = TypeHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.HANDLERS.push(TypeHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Models) {
        /**
        * A model that represents a javadoc comment.
        *
        * Instances of this model are created by the [[CommentHandler]]. You can retrieve comments
        * through the [[BaseReflection.comment]] property.
        */
        var Comment = (function () {
            /**
            * Creates a new Comment instance.
            */
            function Comment(shortText, text) {
                this.shortText = shortText || '';
                this.text = text || '';
            }
            /**
            * Has this comment a visible component?
            *
            * @returns TRUE when this comment has a visible component.
            */
            Comment.prototype.hasVisibleComponent = function () {
                return (this.shortText || this.text || this.tags);
            };

            /**
            * Test whether this comment contains a tag with the given name.
            *
            * @param tagName  The name of the tag to look for.
            * @returns TRUE when this comment contains a tag with the given name, otherwise FALSE.
            */
            Comment.prototype.hasTag = function (tagName) {
                if (!this.tags)
                    return false;
                for (var i = 0, c = this.tags.length; i < c; i++) {
                    if (this.tags[i].tagName == tagName) {
                        return true;
                    }
                }
                return false;
            };

            /**
            * Return the first tag with the given name.
            *
            * You can optionally pass a parameter name that should be searched to.
            *
            * @param tagName  The name of the tag to look for.
            * @param paramName  An optional parameter name to look for.
            * @returns The found tag or NULL.
            */
            Comment.prototype.getTag = function (tagName, paramName) {
                if (!this.tags)
                    return null;
                for (var i = 0, c = this.tags.length; i < c; i++) {
                    var tag = this.tags[i];
                    if (tag.tagName == tagName && (!paramName || tag.paramName == paramName)) {
                        return this.tags[i];
                    }
                }
                return null;
            };
            return Comment;
        })();
        Models.Comment = Comment;
    })(TypeDoc.Models || (TypeDoc.Models = {}));
    var Models = TypeDoc.Models;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Models) {
        /**
        * A model that represents a single javadoc comment tag.
        *
        * Tags are stored in the [[Comment.tags]] property.
        */
        var CommentTag = (function () {
            /**
            * Create a new CommentTag instance.
            */
            function CommentTag(tagName, paramName, text) {
                this.tagName = tagName;
                this.paramName = paramName || '';
                this.text = text || '';
            }
            return CommentTag;
        })();
        Models.CommentTag = CommentTag;
    })(TypeDoc.Models || (TypeDoc.Models = {}));
    var Models = TypeDoc.Models;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    /**
    * Holds all data models used by TypeDoc.
    *
    * The [[BaseReflection]] is base class of all reflection models. The subclass [[ProjectReflection]]
    * serves as the root container for the current project while [[DeclarationReflection]] instances
    * form the structure of the project. Most of the other classes in this namespace are referenced by this
    * two base classes.
    *
    * The models [[NavigationItem]] and [[UrlMapping]] are special as they are only used by the [[Renderer]]
    * while creating the final output.
    */
    (function (Models) {
        /**
        * Current reflection id.
        */
        var REFLECTION_ID = 0;

        /**
        * Base class for all reflection classes.
        *
        * While generating a documentation, TypeDoc generates an instance of [[ProjectReflection]]
        * as the root for all reflections within the project. All other reflections are represented
        * by the [[DeclarationReflection]] class.
        *
        * This base class exposes the basic properties one may use to traverse the reflection tree.
        * You can use the [[children]] and [[parent]] properties to walk the tree. The [[groups]] property
        * contains a list of all children grouped and sorted for being rendered.
        */
        var BaseReflection = (function () {
            /**
            * Create a new BaseReflection instance.
            */
            function BaseReflection() {
                /**
                * The children of this reflection.
                */
                this.children = [];
                /**
                * The symbol name of this reflection.
                */
                this.name = '';
                /**
                * Is the url pointing to an individual document?
                *
                * When FALSE, the url points to an anchor tag on a page of a different reflection.
                */
                this.hasOwnDocument = false;
                this.id = REFLECTION_ID++;
            }
            /**
            * Return the full name of this reflection.
            *
            * The full name contains the name of this reflection and the names of all parent reflections.
            *
            * @param separator  Separator used to join the names of the reflections.
            * @returns The full name of this reflection.
            */
            BaseReflection.prototype.getFullName = function (separator) {
                if (typeof separator === "undefined") { separator = '.'; }
                if (this.parent && !(this.parent instanceof Models.ProjectReflection)) {
                    return this.parent.getFullName(separator) + (this.parent.signatures ? '' : separator + this.name);
                } else {
                    return this.name;
                }
            };

            /**
            * Return a child by its name.
            *
            * @returns The found child or NULL.
            */
            BaseReflection.prototype.getChildByName = function (arg) {
                var names = Array.isArray(arg) ? arg : arg.split('.');
                var name = names[0];

                for (var i = 0, c = this.children.length; i < c; i++) {
                    var child = this.children[i];
                    if (child.name == name) {
                        if (names.length <= 1) {
                            return child;
                        } else {
                            return child.getChildByName(names.slice(1));
                        }
                    }
                }

                return null;
            };

            /**
            * Return a list of all children of a certain kind.
            *
            * @param kind  The desired kind of children.
            * @returns     An array containing all children with the desired kind.
            */
            BaseReflection.prototype.getChildrenByKind = function (kind) {
                var values = [];
                this.children.forEach(function (child) {
                    if (child.kindOf(kind)) {
                        values.push(child);
                    }
                });
                return values;
            };

            /**
            * Return an url safe alias for this reflection.
            */
            BaseReflection.prototype.getAlias = function () {
                if (!this.alias) {
                    this.alias = this.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    if (this.alias == '') {
                        this.alias = 'symbol-' + this.id;
                    }
                }

                return this.alias;
            };

            /**
            * Try to find a reflection by its name.
            *
            * @return The found reflection or null.
            */
            BaseReflection.prototype.findReflectionByName = function (arg) {
                var names = Array.isArray(arg) ? arg : arg.split('.');

                var reflection = this.getChildByName(names);
                if (reflection) {
                    return reflection;
                } else {
                    return this.parent.findReflectionByName(names);
                }
            };

            /**
            * Has this reflection a visible comment?
            *
            * @returns TRUE when this reflection has a visible comment.
            */
            BaseReflection.prototype.hasComment = function () {
                return (this.comment && this.comment.hasVisibleComponent());
            };

            /**
            * Return a string representation of this reflection.
            */
            BaseReflection.prototype.toString = function () {
                return 'BaseReflection';
            };

            /**
            * Return a string representation of this reflection and all of its children.
            *
            * @param indent  Used internally to indent child reflections.
            */
            BaseReflection.prototype.toReflectionString = function (indent) {
                if (typeof indent === "undefined") { indent = ''; }
                var str = indent + this.toString();
                indent += '  ';
                for (var i = 0, c = this.children.length; i < c; i++) {
                    str += '\n' + this.children[i].toReflectionString(indent);
                }
                return str;
            };
            return BaseReflection;
        })();
        Models.BaseReflection = BaseReflection;
    })(TypeDoc.Models || (TypeDoc.Models = {}));
    var Models = TypeDoc.Models;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Models) {
        /**
        * Alias to TypeScript.PullElementKind
        *
        * @resolve
        */
        Models.Kind = TypeScript.PullElementKind;

        /**
        * Alias to TypeScript.PullElementFlags
        *
        * @resolve
        */
        Models.Flags = TypeScript.PullElementFlags;

        

        

        /**
        * A reflection that represents a single declaration emitted by the TypeScript compiler.
        *
        * All parts of a project are represented by DeclarationReflection instances. The actual
        * kind of a reflection is stored in its ´kind´ member.
        */
        var DeclarationReflection = (function (_super) {
            __extends(DeclarationReflection, _super);
            function DeclarationReflection() {
                _super.apply(this, arguments);
                /**
                * A bitmask containing the flags of this reflection as returned by the compiler.
                */
                this.flags = 0 /* None */;
                /**
                * The kind of this reflection as returned by the compiler.
                */
                this.kind = 0 /* None */;
                /**
                * A list of all source files that contributed to this reflection.
                */
                this.sources = [];
            }
            /**
            * Test whether this reflection is of the given kind.
            */
            DeclarationReflection.prototype.kindOf = function (kind) {
                if (Array.isArray(kind)) {
                    for (var i = 0, c = kind.length; i < c; i++) {
                        if ((this.kind & kind[i]) !== 0) {
                            return true;
                        }
                    }
                    return false;
                } else {
                    return (this.kind & kind) !== 0;
                }
            };

            /**
            * Is this reflection representing a container like a module or class?
            */
            DeclarationReflection.prototype.isContainer = function () {
                return this.kindOf(TypeScript.PullElementKind.SomeContainer);
            };

            /**
            * Return a string representation of this reflection.
            */
            DeclarationReflection.prototype.toString = function () {
                var str = TypeScript.PullElementKind[this.kind] + ': ' + this.name;
                if (this.flags)
                    str += ' [' + DeclarationReflection.flagsToString(this.flags, TypeScript.PullElementFlags) + ']';
                if (this.type)
                    str += ': ' + this.type.toString();
                return str;
            };

            /**
            * Return a string representation of this reflection and all of its children.
            *
            * @param indent  Used internally to indent child reflections.
            */
            DeclarationReflection.prototype.toReflectionString = function (indent) {
                if (typeof indent === "undefined") { indent = ''; }
                var str = indent + this.toString();
                indent += '  ';

                if (this.signatures) {
                    for (var i = 0, c = this.signatures.length; i < c; i++) {
                        str += '\n' + this.signatures[i].toReflectionString(indent);
                    }
                }

                for (var i = 0, c = this.children.length; i < c; i++) {
                    str += '\n' + this.children[i].toReflectionString(indent);
                }

                return str;
            };

            /**
            * Return a string representation of the given value based upon the given enumeration.
            *
            * @param value        The value that contains the bit mask that should be explained.
            * @param enumeration  The enumeration the bits in the value correspond to.
            * @param separator    A string used to concat the found flags.
            * @returns            A string representation of the given value.
            */
            DeclarationReflection.flagsToString = function (value, enumeration, separator) {
                if (typeof separator === "undefined") { separator = ', '; }
                var values = [];
                for (var key in enumeration) {
                    var num = +key;
                    if (num != key || num == 0 || !enumeration.hasOwnProperty(key))
                        continue;
                    if ((value & num) != num)
                        continue;
                    values.push(enumeration[+key]);
                }
                return values.join(separator);
            };
            return DeclarationReflection;
        })(Models.BaseReflection);
        Models.DeclarationReflection = DeclarationReflection;
    })(TypeDoc.Models || (TypeDoc.Models = {}));
    var Models = TypeDoc.Models;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Models) {
        /**
        * A reflection that represents the root of the project.
        *
        * The project reflection acts as a global index, one may receive all reflections
        * and source files of the processed project through this reflection.
        */
        var ProjectReflection = (function (_super) {
            __extends(ProjectReflection, _super);
            /**
            * Create a new ProjectReflection instance.
            *
            * @param name  The name of the project.
            */
            function ProjectReflection(name) {
                _super.call(this);
                /**
                * A list of all reflections within the project.
                */
                this.reflections = [];
                /**
                * The root directory of the project.
                */
                this.directory = new Models.SourceDirectory();
                /**
                * A list of all source files within the project.
                */
                this.files = [];
                this.name = name;
            }
            /**
            * Return a list of all reflections in this project of a certain kind.
            *
            * @param kind  The desired kind of reflection.
            * @returns     An array containing all reflections with the desired kind.
            */
            ProjectReflection.prototype.getReflectionsByKind = function (kind) {
                var values = [];
                this.reflections.forEach(function (reflection) {
                    if (reflection.kindOf(kind)) {
                        values.push(reflection);
                    }
                });
                return values;
            };

            /**
            * Try to find a reflection by its name.
            *
            * @return The found reflection or null.
            */
            ProjectReflection.prototype.findReflectionByName = function (arg) {
                var names = Array.isArray(arg) ? arg : arg.split('.');
                var name = names.pop();

                search:
                for (var index = 0, length = this.reflections.length; index < length; index++) {
                    var reflection = this.reflections[index];
                    if (reflection.name != name)
                        continue;

                    var depth = names.length - 1;
                    var target = reflection;
                    while (target && depth > 0) {
                        target = target.parent;
                        if (!(target instanceof Models.DeclarationReflection))
                            continue search;

                        if (target.signatures) {
                            target = target.parent;
                            if (!(target instanceof Models.DeclarationReflection))
                                continue search;
                        }

                        if (target.name != names[depth])
                            continue search;
                        depth -= 1;
                    }

                    return reflection;
                }

                return null;
            };
            return ProjectReflection;
        })(Models.BaseReflection);
        Models.ProjectReflection = ProjectReflection;
    })(TypeDoc.Models || (TypeDoc.Models = {}));
    var Models = TypeDoc.Models;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Models) {
        /**
        * A group of reflections. All reflections in a group are of the same kind.
        *
        * Reflection groups are created by the ´GroupHandler´ in the resolving phase
        * of the dispatcher. The main purpose of groups is to be able to more easily
        * render human readable children lists in templates.
        */
        var ReflectionGroup = (function () {
            /**
            * Create a new ReflectionGroup instance.
            *
            * @param title The title of this group.
            * @param kind  The original typescript kind of the children of this group.
            */
            function ReflectionGroup(title, kind) {
                var _this = this;
                /**
                * All reflections of this group.
                */
                this.children = [];
                this.title = title;
                this.kind = kind;

                this.allChildrenHaveOwnDocument = (function () {
                    return _this.getAllChildrenHaveOwnDocument();
                });
            }
            /**
            * Do all children of this group have a separate document?
            */
            ReflectionGroup.prototype.getAllChildrenHaveOwnDocument = function () {
                var onlyOwnDocuments = true;
                this.children.forEach(function (child) {
                    onlyOwnDocuments = onlyOwnDocuments && child.hasOwnDocument;
                });

                return onlyOwnDocuments;
            };
            return ReflectionGroup;
        })();
        Models.ReflectionGroup = ReflectionGroup;
    })(TypeDoc.Models || (TypeDoc.Models = {}));
    var Models = TypeDoc.Models;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Models) {
        /**
        * Exposes information about a directory containing source files.
        *
        * One my access the root directory of a project through the [[ProjectReflection.directory]]
        * property. Traverse through directories by utilizing the [[SourceDirectory.parent]] or
        * [[SourceDirectory.directories]] properties.
        */
        var SourceDirectory = (function () {
            /**
            * Create a new SourceDirectory instance.
            *
            * @param name  The new of directory.
            * @param parent  The parent directory instance.
            */
            function SourceDirectory(name, parent) {
                /**
                * The parent directory or NULL if this is a root directory.
                */
                this.parent = null;
                /**
                * A list of all subdirectories.
                */
                this.directories = {};
                /**
                * A list of all files in this directory.
                */
                this.files = [];
                /**
                * The name of this directory.
                */
                this.name = null;
                /**
                * The relative path from the root directory to this directory.
                */
                this.dirName = null;
                if (name && parent) {
                    this.name = name;
                    this.dirName = (parent.dirName ? parent.dirName + '/' : '') + name;
                    this.parent = parent;
                }
            }
            /**
            * Return a string describing this directory and its contents.
            *
            * @param indent  Used internally for indention.
            * @returns A string representing this directory and all of its children.
            */
            SourceDirectory.prototype.toString = function (indent) {
                if (typeof indent === "undefined") { indent = ''; }
                var res = indent + this.name;

                for (var key in this.directories) {
                    if (!this.directories.hasOwnProperty(key))
                        continue;
                    res += '\n' + this.directories[key].toString(indent + '  ');
                }

                this.files.forEach(function (file) {
                    res += '\n' + indent + '  ' + file.fileName;
                });

                return res;
            };

            /**
            * Return a list of all reflections exposed by the files within this directory.
            *
            * @returns An aggregated list of all [[DeclarationReflection]] defined in the
            * files of this directory.
            */
            SourceDirectory.prototype.getAllReflections = function () {
                var reflections = [];
                this.files.forEach(function (file) {
                    reflections.push.apply(reflections, file.reflections);
                });

                reflections.sort(TypeDoc.Factories.GroupHandler.sortCallback);
                return reflections;
            };
            return SourceDirectory;
        })();
        Models.SourceDirectory = SourceDirectory;
    })(TypeDoc.Models || (TypeDoc.Models = {}));
    var Models = TypeDoc.Models;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Models) {
        /**
        * Exposes information about a source file.
        *
        * One my access a list of all source files through the [[ProjectReflection.files]] property or as
        * a tree structure through the [[ProjectReflection.directory]] property.
        *
        * Furthermore each reflection carries references to the related SourceFile with their
        * [[DeclarationReflection.sources]] property. It is an array of of [[IDeclarationSource]] instances
        * containing the reference in their [[IDeclarationSource.file]] field.
        */
        var SourceFile = (function () {
            /**
            * Create a new SourceFile instance.
            *
            * @param fullFileName  The full file name.
            */
            function SourceFile(fullFileName) {
                /**
                * A list of all reflections that are declared in this file.
                */
                this.reflections = [];
                this.fileName = fullFileName;
                this.fullFileName = fullFileName;
                this.name = Path.basename(fullFileName);
            }
            return SourceFile;
        })();
        Models.SourceFile = SourceFile;
    })(TypeDoc.Models || (TypeDoc.Models = {}));
    var Models = TypeDoc.Models;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Models) {
        /**
        * A hierarchical model holding the data of single node within the navigation.
        *
        * This structure is used by the [[NavigationPlugin]] and [[TocPlugin]] to expose the current
        * navigation state to the template engine. Themes should generate the primary navigation structure
        * through the [[BaseTheme.getNavigation]] method.
        */
        var NavigationItem = (function () {
            /**
            * Create a new NavigationItem instance.
            *
            * @param title       The visible title of the navigation node.
            * @param url         The url this navigation node points to.
            * @param parent      The parent navigation node.
            * @param cssClasses  A string containing the css classes of this node.
            */
            function NavigationItem(title, url, parent, cssClasses) {
                this.title = title || '';
                this.url = url || '';
                this.parent = parent || null;
                this.cssClasses = cssClasses || '';

                if (!url) {
                    this.isLabel = true;
                }

                if (this.parent) {
                    if (!this.parent.children)
                        this.parent.children = [];
                    this.parent.children.push(this);
                }
            }
            /**
            * Create a navigation node for the given reflection.
            *
            * @param reflection     The reflection whose navigation node should be created.
            * @param parent         The parent navigation node.
            * @param useShortNames  Force this function to always use short names.
            */
            NavigationItem.create = function (reflection, parent, useShortNames) {
                var name;
                if (useShortNames || (parent && parent.parent)) {
                    name = reflection.name;
                } else {
                    name = reflection.getFullName();
                }

                name = name.trim();
                if (name == '') {
                    name = '<em>' + reflection.kindString + '</em>';
                }

                return new Models.NavigationItem(name, reflection.url, parent, reflection.cssClasses);
            };
            return NavigationItem;
        })();
        Models.NavigationItem = NavigationItem;
    })(TypeDoc.Models || (TypeDoc.Models = {}));
    var Models = TypeDoc.Models;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Models) {
        /**
        *
        */
        var UrlMapping = (function () {
            function UrlMapping(url, model, template) {
                this.url = url;
                this.model = model;
                this.template = template;
            }
            return UrlMapping;
        })();
        Models.UrlMapping = UrlMapping;
    })(TypeDoc.Models || (TypeDoc.Models = {}));
    var Models = TypeDoc.Models;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Models) {
        var BaseType = (function () {
            function BaseType() {
            }
            BaseType.prototype.toString = function () {
                return 'void';
            };
            return BaseType;
        })();
        Models.BaseType = BaseType;
    })(TypeDoc.Models || (TypeDoc.Models = {}));
    var Models = TypeDoc.Models;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Models) {
        var LateResolvingType = (function (_super) {
            __extends(LateResolvingType, _super);
            function LateResolvingType(target) {
                _super.call(this);

                if (target instanceof TypeScript.PullDecl) {
                    this.declaration = target;
                    this.symbol = this.declaration.getSymbol();
                } else if (target instanceof TypeScript.PullTypeSymbol) {
                    this.symbol = target;
                    this.declaration = this.symbol.getDeclarations()[0];
                }
            }
            return LateResolvingType;
        })(Models.BaseType);
        Models.LateResolvingType = LateResolvingType;
    })(TypeDoc.Models || (TypeDoc.Models = {}));
    var Models = TypeDoc.Models;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Models) {
        var NamedType = (function (_super) {
            __extends(NamedType, _super);
            function NamedType(name) {
                _super.call(this);
                this.name = name;
            }
            NamedType.prototype.toString = function () {
                return this.name;
            };
            return NamedType;
        })(Models.BaseType);
        Models.NamedType = NamedType;
    })(TypeDoc.Models || (TypeDoc.Models = {}));
    var Models = TypeDoc.Models;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Models) {
        var ReflectionType = (function (_super) {
            __extends(ReflectionType, _super);
            function ReflectionType(reflection, isArray) {
                _super.call(this);
                this.reflection = reflection;
                this.isArray = isArray;
            }
            ReflectionType.prototype.toString = function () {
                return this.reflection.name;
            };
            return ReflectionType;
        })(Models.BaseType);
        Models.ReflectionType = ReflectionType;
    })(TypeDoc.Models || (TypeDoc.Models = {}));
    var Models = TypeDoc.Models;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Models) {
        var StringConstantType = (function (_super) {
            __extends(StringConstantType, _super);
            function StringConstantType(value) {
                _super.call(this);
                this.value = value;
            }
            StringConstantType.prototype.toString = function () {
                return '"' + this.value + '"';
            };
            return StringConstantType;
        })(Models.BaseType);
        Models.StringConstantType = StringConstantType;
    })(TypeDoc.Models || (TypeDoc.Models = {}));
    var Models = TypeDoc.Models;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Output) {
        /**
        * Base class of all plugins that can be attached to the [[Renderer]].
        */
        var BasePlugin = (function () {
            /**
            * Create a new BasePlugin instance.
            *
            * @param renderer  The renderer this plugin should be attached to.
            */
            function BasePlugin(renderer) {
                this.renderer = renderer;
            }
            /**
            * Remove this plugin from the renderer.
            */
            BasePlugin.prototype.remove = function () {
                this.renderer.off(null, null, this);
            };
            return BasePlugin;
        })();
        Output.BasePlugin = BasePlugin;
    })(TypeDoc.Output || (TypeDoc.Output = {}));
    var Output = TypeDoc.Output;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Output) {
        /**
        * Base class of all themes.
        *
        * A theme defines the logical and graphical output of a documentation. Themes are
        * directories containing a ```theme.js``` file defining a [[BaseTheme]] subclass and a
        * series of subdirectories containing templates and assets. You can select a theme
        * through the ```--theme <path/to/theme>``` commandline argument.
        *
        * The theme class controls which files will be created through the [[BaseTheme.getUrls]]
        * function. It returns an array of [[UrlMapping]] instances defining the target files, models
        * and templates to use. Additionally themes can subscribe to the events emitted by
        * [[Renderer]] to control and manipulate the output process.
        *
        * The default file structure of a theme looks like this:
        *
        * - ```/assets/```<br>
        *   Contains static assets like stylesheets, images or javascript files used by the theme.
        *   The [[AssetsPlugin]] will deep copy this directory to the output directory.
        *
        * - ```/layouts/```<br>
        *   Contains layout templates that the [[LayoutPlugin]] wraps around the output of the
        *   page template. Currently only one ```default.hbs``` layout is supported. Layout templates
        *   receive the current [[OutputPageEvent]] instance as their handlebars context. Place the
        *   ```{{{contents}}}``` variable to render the actual body of the document within this template.
        *
        * - ```/partials/```<br>
        *   Contains partial templates that can be used by other templates using handlebars partial
        *   syntax ```{{> partial-name}}```. The [[PartialsPlugin]] loads all files in this directory
        *   and combines them with the partials of the default theme.
        *
        * - ```/templates/```<br>
        *   Contains the main templates of the theme. The theme maps models to these templates through
        *   the [[BaseTheme.getUrls]] function. If the [[Renderer.getTemplate]] function cannot find a
        *   given template within this directory, it will try to find it in the default theme
        *   ```/templates/``` directory. Templates receive the current [[OutputPageEvent]] instance as
        *   their handlebars context. You can access the target model through the ```{{model}}``` variable.
        *
        * - ```/theme.js```<br>
        *   A javascript file that returns the definition of a [[BaseTheme]] subclass. This file will
        *   be executed within the context of TypeDoc, one may directly access all classes and functions
        *   of TypeDoc. If this file is not present, an instance of [[DefaultTheme]] will be used to render
        *   this theme.
        */
        var BaseTheme = (function () {
            /**
            * Create a new BaseTheme instance.
            *
            * @param renderer  The renderer this theme is attached to.
            * @param basePath  The base path of this theme.
            */
            function BaseTheme(renderer, basePath) {
                this.renderer = renderer;
                this.basePath = basePath;
            }
            /**
            * Test whether the given path contains a documentation generated by this theme.
            *
            * TypeDoc empties the output directory before rendering a project. This function
            * is used to ensure that only previously generated documentations are deleted.
            * When this function returns FALSE, the documentation will not be created and an
            * error message will be displayed.
            *
            * Every theme must have an own implementation of this function, the default
            * implementation always returns FALSE.
            *
            * @param path  The path of the directory that should be tested.
            * @returns     TRUE if the given path seems to be a previous output directory,
            *              otherwise FALSE.
            *
            * @see [[Renderer.prepareOutputDirectory]]
            */
            BaseTheme.prototype.isOutputDirectory = function (path) {
                return false;
            };

            /**
            * Map the models of the given project to the desired output files.
            *
            * Every theme must have an own implementation of this function, the default
            * implementation always returns an empty array.
            *
            * @param project  The project whose urls should be generated.
            * @returns        A list of [[UrlMapping]] instances defining which models
            *                 should be rendered to which files.
            */
            BaseTheme.prototype.getUrls = function (project) {
                return [];
            };

            /**
            * Create a navigation structure for the given project.
            *
            * A navigation is a tree structure consisting of [[NavigationItem]] nodes. This
            * function should return the root node of the desired navigation tree.
            *
            * The [[NavigationPlugin]] will call this hook before a project will be rendered.
            * The plugin will update the state of the navigation tree and pass it to the
            * templates.
            *
            * @param project  The project whose navigation should be generated.
            * @returns        The root navigation item.
            */
            BaseTheme.prototype.getNavigation = function (project) {
                return null;
            };
            return BaseTheme;
        })();
        Output.BaseTheme = BaseTheme;
    })(TypeDoc.Output || (TypeDoc.Output = {}));
    var Output = TypeDoc.Output;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Output) {
        

        /**
        * Default theme implementation of TypeDoc. If a theme does not provide a custom
        * [[BaseTheme]] implementation, this theme class will be used.
        */
        var DefaultTheme = (function (_super) {
            __extends(DefaultTheme, _super);
            /**
            * Create a new DefaultTheme instance.
            *
            * @param renderer  The renderer this theme is attached to.
            * @param basePath  The base path of this theme.
            */
            function DefaultTheme(renderer, basePath) {
                _super.call(this, renderer, basePath);
                renderer.on(Output.Renderer.EVENT_BEGIN, this.onRendererBegin, this, 1024);
            }
            /**
            * Test whether the given path contains a documentation generated by this theme.
            *
            * @param path  The path of the directory that should be tested.
            * @returns     TRUE if the given path seems to be a previous output directory,
            *              otherwise FALSE.
            */
            DefaultTheme.prototype.isOutputDirectory = function (path) {
                if (!FS.existsSync(Path.join(path, 'index.html')))
                    return false;
                if (!FS.existsSync(Path.join(path, 'assets')))
                    return false;
                if (!FS.existsSync(Path.join(path, 'assets', 'js', 'main.js')))
                    return false;
                if (!FS.existsSync(Path.join(path, 'assets', 'images', 'icons.png')))
                    return false;

                return true;
            };

            /**
            * Map the models of the given project to the desired output files.
            *
            * @param project  The project whose urls should be generated.
            * @returns        A list of [[UrlMapping]] instances defining which models
            *                 should be rendered to which files.
            */
            DefaultTheme.prototype.getUrls = function (project) {
                var urls = [];

                if (this.renderer.application.settings.readme == 'none') {
                    project.url = 'index.html';
                    urls.push(new TypeDoc.Models.UrlMapping('index.html', project, 'reflection.hbs'));
                } else {
                    project.url = 'globals.html';
                    urls.push(new TypeDoc.Models.UrlMapping('globals.html', project, 'reflection.hbs'));
                    urls.push(new TypeDoc.Models.UrlMapping('index.html', project, 'index.hbs'));
                }

                project.children.forEach(function (child) {
                    DefaultTheme.buildUrls(child, urls);
                });

                return urls;
            };

            /**
            * Create a navigation structure for the given project.
            *
            * @param project  The project whose navigation should be generated.
            * @returns        The root navigation item.
            */
            DefaultTheme.prototype.getNavigation = function (project) {
                /**
                * Test whether the given list of modules contains an external module.
                *
                * @param modules  The list of modules to test.
                * @returns        TRUE if any of the modules is marked as being external.
                */
                function containsExternals(modules) {
                    for (var index = 0, length = modules.length; index < length; index++) {
                        if (modules[index].isExternal)
                            return true;
                    }
                    return false;
                }

                /**
                * Sort the given list of modules by name, groups external modules at the bottom.
                *
                * @param modules  The list of modules that should be sorted.
                */
                function sortReflections(modules) {
                    modules.sort(function (a, b) {
                        if (a.isExternal && !b.isExternal)
                            return 1;
                        if (!a.isExternal && b.isExternal)
                            return -1;
                        return a.getFullName() < b.getFullName() ? -1 : 1;
                    });
                }

                /**
                * Find the urls of all children of the given reflection and store them as dedicated urls
                * of the given NavigationItem.
                *
                * @param reflection  The reflection whose children urls should be included.
                * @param item        The navigation node whose dedicated urls should be set.
                */
                function includeDedicatedUrls(reflection, item) {
                    (function walk(reflection) {
                        reflection.children.forEach(function (child) {
                            if (child.hasOwnDocument && !child.kindOf(TypeScript.PullElementKind.SomeContainer)) {
                                if (!item.dedicatedUrls)
                                    item.dedicatedUrls = [];
                                item.dedicatedUrls.push(child.url);
                                walk(child);
                            }
                        });
                    })(reflection);
                }

                /**
                * Create navigation nodes for all container children of the given reflection.
                *
                * @param reflection  The reflection whose children modules should be transformed into navigation nodes.
                * @param parent      The parent NavigationItem of the newly created nodes.
                */
                function buildChildren(reflection, parent) {
                    var modules = reflection.getChildrenByKind(TypeScript.PullElementKind.SomeContainer);
                    modules.sort(function (a, b) {
                        return a.getFullName() < b.getFullName() ? -1 : 1;
                    });

                    modules.forEach(function (reflection) {
                        var item = TypeDoc.Models.NavigationItem.create(reflection, parent);
                        includeDedicatedUrls(reflection, item);
                        buildChildren(reflection, item);
                    });
                }

                /**
                * Create navigation nodes for the given list of reflections. The resulting nodes will be grouped into
                * an "internal" and an "external" section when applicable.
                *
                * @param reflections  The list of reflections which should be transformed into navigation nodes.
                * @param parent       The parent NavigationItem of the newly created nodes.
                * @param callback     Optional callback invoked for each generated node.
                */
                function buildGroups(reflections, parent, callback) {
                    var state = -1;
                    var hasExternals = containsExternals(reflections);
                    sortReflections(reflections);

                    reflections.forEach(function (reflection) {
                        if (hasExternals && !reflection.isExternal && state != 1) {
                            new TypeDoc.Models.NavigationItem('Internals', null, parent, "tsd-is-external");
                            state = 1;
                        } else if (hasExternals && reflection.isExternal && state != 2) {
                            new TypeDoc.Models.NavigationItem('Externals', null, parent, "tsd-is-external");
                            state = 2;
                        }

                        var item = TypeDoc.Models.NavigationItem.create(reflection, parent);
                        includeDedicatedUrls(reflection, item);
                        if (callback)
                            callback(reflection, item);
                    });
                }

                /**
                * Build the navigation structure.
                *
                * @param hasSeparateGlobals  Has the project a separated globals.html file?
                * @return                    The root node of the generated navigation structure.
                */
                function build(hasSeparateGlobals) {
                    var root = new TypeDoc.Models.NavigationItem('Index', 'index.html');
                    var globals = new TypeDoc.Models.NavigationItem('Globals', hasSeparateGlobals ? 'globals.html' : 'index.html', root);
                    globals.isGlobals = true;

                    var modules = project.getReflectionsByKind(TypeScript.PullElementKind.SomeContainer);
                    if (modules.length < 10) {
                        buildGroups(modules, root);
                    } else {
                        buildGroups(project.getChildrenByKind(TypeScript.PullElementKind.SomeContainer), root, buildChildren);
                    }

                    return root;
                }

                return build(this.renderer.application.settings.readme != 'none');
            };

            /**
            * Triggered before the renderer starts rendering a project.
            *
            * @param event  An event object describing the current render operation.
            */
            DefaultTheme.prototype.onRendererBegin = function (event) {
                if (event.project.groups) {
                    event.project.groups.forEach(DefaultTheme.applyGroupClasses);
                }

                event.project.reflections.forEach(function (reflection) {
                    DefaultTheme.applyReflectionClasses(reflection);

                    if (reflection.groups) {
                        reflection.groups.forEach(DefaultTheme.applyGroupClasses);
                    }
                });
            };

            /**
            * Return a url for the given reflection.
            *
            * @param reflection  The reflection the url should be generated for.
            * @param relative    The parent reflection the url generation should stop on.
            * @param separator   The separator used to generate the url.
            * @returns           The generated url.
            */
            DefaultTheme.getUrl = function (reflection, relative, separator) {
                if (typeof separator === "undefined") { separator = '.'; }
                var url = reflection.getAlias();

                if (reflection.parent && reflection.parent != relative && !(reflection.parent instanceof TypeDoc.Models.ProjectReflection))
                    url = DefaultTheme.getUrl(reflection.parent, relative, separator) + separator + url;

                return url;
            };

            /**
            * Return the template mapping fore the given reflection.
            *
            * @param reflection  The reflection whose mapping should be resolved.
            * @returns           The found mapping or NULL if no mapping could be found.
            */
            DefaultTheme.getMapping = function (reflection) {
                for (var i = 0, c = DefaultTheme.MAPPINGS.length; i < c; i++) {
                    var mapping = DefaultTheme.MAPPINGS[i];
                    if (reflection.kindOf(mapping.kind)) {
                        return mapping;
                    }
                }

                return null;
            };

            /**
            * Build the url for the the given reflection and all of its children.
            *
            * @param reflection  The reflection the url should be created for.
            * @param urls        The array the url should be appended to.
            * @returns           The altered urls array.
            */
            DefaultTheme.buildUrls = function (reflection, urls) {
                var mapping = DefaultTheme.getMapping(reflection);
                if (mapping) {
                    var url = Path.join(mapping.directory, DefaultTheme.getUrl(reflection) + '.html');
                    urls.push(new TypeDoc.Models.UrlMapping(url, reflection, mapping.template));

                    reflection.url = url;
                    reflection.anchor = null;
                    reflection.hasOwnDocument = true;

                    reflection.children.forEach(function (child) {
                        if (mapping.isLeaf) {
                            DefaultTheme.applyAnchorUrl(child, reflection);
                        } else {
                            DefaultTheme.buildUrls(child, urls);
                        }
                    });
                } else {
                    DefaultTheme.applyAnchorUrl(reflection, reflection.parent);
                }

                return urls;
            };

            /**
            * Generate an anchor url for the given reflection and all of its children.
            *
            * @param reflection  The reflection an anchor url should be created for.
            * @param container   The nearest reflection having an own document.
            */
            DefaultTheme.applyAnchorUrl = function (reflection, container) {
                var anchor = DefaultTheme.getUrl(reflection, container, '.');
                if (reflection.isStatic) {
                    anchor = 'static-' + anchor;
                }

                reflection.url = container.url + '#' + anchor;
                reflection.anchor = anchor;
                reflection.hasOwnDocument = false;

                reflection.children.forEach(function (child) {
                    if (!child.kindOf(TypeDoc.Models.Kind.Parameter)) {
                        DefaultTheme.applyAnchorUrl(child, container);
                    }
                });
            };

            /**
            * Generate the css classes for the given reflection and apply them to the
            * [[DeclarationReflection.cssClasses]] property.
            *
            * @param reflection  The reflection whose cssClasses property should be generated.
            */
            DefaultTheme.applyReflectionClasses = function (reflection) {
                var classes = [];
                var kind = TypeDoc.Models.Kind[reflection.kind];
                classes.push(DefaultTheme.toStyleClass('tsd-kind-' + kind));

                if (reflection.parent && reflection.parent instanceof TypeDoc.Models.DeclarationReflection) {
                    kind = TypeDoc.Models.Kind[reflection.parent.kind];
                    classes.push(DefaultTheme.toStyleClass('tsd-parent-kind-' + kind));
                }

                if (reflection.overwrites)
                    classes.push('tsd-is-overwrite');
                if (reflection.inheritedFrom)
                    classes.push('tsd-is-inherited');
                if (reflection.isPrivate)
                    classes.push('tsd-is-private');
                if (reflection.isStatic)
                    classes.push('tsd-is-static');
                if (reflection.isExternal)
                    classes.push('tsd-is-external');
                if (!reflection.isExported)
                    classes.push('tsd-is-not-exported');

                reflection.cssClasses = classes.join(' ');
            };

            /**
            * Generate the css classes for the given reflection group and apply them to the
            * [[ReflectionGroup.cssClasses]] property.
            *
            * @param group  The reflection group whose cssClasses property should be generated.
            */
            DefaultTheme.applyGroupClasses = function (group) {
                var classes = [];
                if (group.allChildrenAreInherited)
                    classes.push('tsd-is-inherited');
                if (group.allChildrenArePrivate)
                    classes.push('tsd-is-private');
                if (group.allChildrenAreExternal)
                    classes.push('tsd-is-external');
                if (!group.someChildrenAreExported)
                    classes.push('tsd-is-not-exported');

                group.cssClasses = classes.join(' ');
            };

            /**
            * Transform a space separated string into a string suitable to be used as a
            * css class, e.g. "constructor method" > "Constructor-method".
            */
            DefaultTheme.toStyleClass = function (str) {
                return str.replace(/(\w)([A-Z])/g, function (m, m1, m2) {
                    return m1 + '-' + m2;
                }).toLowerCase();
            };
            DefaultTheme.MAPPINGS = [
                {
                    kind: [TypeScript.PullElementKind.Class],
                    isLeaf: true,
                    directory: 'classes',
                    template: 'reflection.hbs'
                }, {
                    kind: [TypeScript.PullElementKind.Interface],
                    isLeaf: true,
                    directory: 'interfaces',
                    template: 'reflection.hbs'
                }, {
                    kind: [TypeScript.PullElementKind.Enum],
                    isLeaf: true,
                    directory: 'enums',
                    template: 'reflection.hbs'
                }, {
                    kind: [TypeScript.PullElementKind.Container, TypeScript.PullElementKind.DynamicModule],
                    isLeaf: false,
                    directory: 'modules',
                    template: 'reflection.hbs'
                }, {
                    kind: [TypeScript.PullElementKind.Script],
                    isLeaf: false,
                    directory: 'scripts',
                    template: 'reflection.hbs'
                }, {
                    kind: [TypeScript.PullElementKind.ObjectLiteral],
                    isLeaf: false,
                    directory: 'objects',
                    template: 'reflection.hbs'
                }];
            return DefaultTheme;
        })(Output.BaseTheme);
        Output.DefaultTheme = DefaultTheme;
    })(TypeDoc.Output || (TypeDoc.Output = {}));
    var Output = TypeDoc.Output;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    /**
    * Holds all logic used render and output the final documentation.
    *
    * The [[Renderer]] class is the central controller within this namespace. When invoked it creates
    * an instance of [[BaseTheme]] which defines the layout of the documentation and fires a
    * series of [[OutputEvent]] events. Instances of [[BasePlugin]] can listen to these events and
    * alter the generated output.
    */
    (function (Output) {
        

        /**
        * The renderer processes a [[ProjectReflection]] using a [[BaseTheme]] instance and writes
        * the emitted html documents to a output directory. You can specify which theme should be used
        * using the ```--theme <name>``` commandline argument.
        *
        * Subclasses of [[BasePlugin]] that have registered themselves in the [[Renderer.PLUGIN_CLASSES]]
        * will be automatically initialized. Most of the core functionality is provided as separate plugins.
        *
        * [[Renderer]] is a subclass of [[EventDispatcher]] and triggers a series of events while
        * a project is being processed. You can listen to these events to control the flow or manipulate
        * the output.
        *
        *  * [[Renderer.EVENT_BEGIN]]<br>
        *    Triggered before the renderer starts rendering a project. The listener receives
        *    an instance of [[OutputEvent]]. By calling [[OutputEvent.preventDefault]] the entire
        *    render process can be canceled.
        *
        *    * [[Renderer.EVENT_BEGIN_PAGE]]<br>
        *      Triggered before a document will be rendered. The listener receives an instance of
        *      [[OutputPageEvent]]. By calling [[OutputPageEvent.preventDefault]] the generation of the
        *      document can be canceled.
        *
        *    * [[Renderer.EVENT_END_PAGE]]<br>
        *      Triggered after a document has been rendered, just before it is written to disc. The
        *      listener receives an instance of [[OutputPageEvent]]. When calling
        *      [[OutputPageEvent.preventDefault]] the the document will not be saved to disc.
        *
        *  * [[Renderer.EVENT_END]]<br>
        *    Triggered after the renderer has written all documents. The listener receives
        *    an instance of [[OutputEvent]].
        */
        var Renderer = (function (_super) {
            __extends(Renderer, _super);
            /**
            * Create a new Renderer instance.
            *
            * @param application  The application this dispatcher is attached to.
            */
            function Renderer(application) {
                var _this = this;
                _super.call(this);
                /**
                * Hash map of all loaded templates indexed by filename.
                */
                this.templates = {};
                this.application = application;

                this.plugins = [];
                Renderer.PLUGIN_CLASSES.forEach(function (pluginClass) {
                    _this.addPlugin(pluginClass);
                });
            }
            /**
            * Add a plugin to the renderer.
            *
            * @param pluginClass  The class of the plugin that should be attached.
            */
            Renderer.prototype.addPlugin = function (pluginClass) {
                if (this.getPlugin(pluginClass) == null) {
                    this.plugins.push(new pluginClass(this));
                }
            };

            /**
            * Remove a plugin from the renderer.
            *
            * @param pluginClass  The class of the plugin that should be detached.
            */
            Renderer.prototype.removePlugin = function (pluginClass) {
                for (var i = 0, c = this.plugins.length; i < c; i++) {
                    if (this.plugins[i] instanceof pluginClass) {
                        this.plugins[i].remove();
                        this.plugins.splice(i, 1);
                        c -= 1;
                    }
                }
            };

            /**
            * Retrieve a plugin instance.
            *
            * @param pluginClass  The class of the plugin that should be retrieved.
            * @returns  The instance of the plugin or NULL if no plugin with the given class is attached.
            */
            Renderer.prototype.getPlugin = function (pluginClass) {
                for (var i = 0, c = this.plugins.length; i < c; i++) {
                    if (this.plugins[i] instanceof pluginClass) {
                        return this.plugins[i];
                    }
                }

                return null;
            };

            /**
            * Return the template with the given filename.
            *
            * Tries to find the file in the ´templates´ subdirectory of the current theme.
            * If it does not exist, TypeDoc tries to find the template in the default
            * theme templates subdirectory.
            *
            * @param fileName  The filename of the template that should be loaded.
            * @returns The compiled template or NULL if the file could not be found.
            */
            Renderer.prototype.getTemplate = function (fileName) {
                if (!this.theme) {
                    this.application.log(Util.format('Cannot resolve templates before theme is set.'), 3 /* Error */);
                    return null;
                }

                if (!this.templates[fileName]) {
                    var path = Path.resolve(Path.join(this.theme.basePath, fileName));
                    if (!FS.existsSync(path)) {
                        path = Path.resolve(Path.join(Renderer.getDefaultTheme(), fileName));
                        if (!FS.existsSync(path)) {
                            this.application.log(Util.format('Cannot find template %s', fileName), 3 /* Error */);
                            return null;
                        }
                    }

                    this.templates[fileName] = Handlebars.compile(Renderer.readFile(path));
                }

                return this.templates[fileName];
            };

            /**
            * Render the given project reflection to the specified output directory.
            *
            * @param project  The project that should be rendered.
            * @param outputDirectory  The path of the directory the documentation should be rendered to.
            */
            Renderer.prototype.render = function (project, outputDirectory) {
                var _this = this;
                this.application.log('Starting renderer', 0 /* Verbose */);

                if (!this.prepareTheme() || !this.prepareOutputDirectory(outputDirectory)) {
                    return;
                }

                var output = new Output.OutputEvent();
                output.outputDirectory = outputDirectory;
                output.project = project;
                output.settings = this.application.settings;
                output.urls = this.theme.getUrls(project);

                this.dispatch(Renderer.EVENT_BEGIN, output);
                if (!output.isDefaultPrevented) {
                    output.urls.forEach(function (mapping) {
                        _this.renderDocument(output.createPageEvent(mapping));
                    });

                    this.dispatch(Renderer.EVENT_END, output);
                }
            };

            /**
            * Render a single page.
            *
            * @param page An event describing the current page.
            * @return TRUE if the page has been saved to disc, otherwise FALSE.
            */
            Renderer.prototype.renderDocument = function (page) {
                this.application.log(Util.format('Render %s', page.url), 0 /* Verbose */);

                this.dispatch(Renderer.EVENT_BEGIN_PAGE, page);
                if (page.isDefaultPrevented) {
                    return false;
                }

                page.template = page.template || this.getTemplate(Path.join('templates', page.templateName));
                page.contents = page.template(page);

                this.dispatch(Renderer.EVENT_END_PAGE, page);
                if (page.isDefaultPrevented) {
                    return false;
                }

                try  {
                    TypeScript.IOUtils.writeFileAndFolderStructure(TypeScript.IO, page.filename, page.contents, true);
                } catch (error) {
                    this.application.log(Util.format('Error: Could not write %s', page.filename), 3 /* Error */);
                    return false;
                }

                return true;
            };

            /**
            * Ensure that a theme has been setup.
            *
            * If a the user has set a theme we try to find and load it. If no theme has
            * been specified we load the default theme.
            *
            * @returns TRUE if a theme has been setup, otherwise FALSE.
            */
            Renderer.prototype.prepareTheme = function () {
                if (!this.theme) {
                    var themeName = this.application.settings.theme;
                    var path = Path.resolve(themeName);
                    if (!FS.existsSync(path)) {
                        path = Path.join(Renderer.getThemeDirectory(), themeName);
                        if (!FS.existsSync(path)) {
                            this.application.log(Util.format('The theme %s could not be found.', themeName), 3 /* Error */);
                            return false;
                        }
                    }

                    var filename = Path.join(path, 'theme.js');
                    if (!FS.existsSync(filename)) {
                        this.theme = new Output.DefaultTheme(this, path);
                    } else {
                        var themeClass = eval(Renderer.readFile(filename));
                        this.theme = new themeClass(this, path);
                    }
                }

                return true;
            };

            /**
            * Prepare the output directory. If the directory does not exist, it will be
            * created. If the directory exists, it will be emptied.
            *
            * @param directory  The path to the directory that should be prepared.
            * @returns TRUE if the directory could be prepared, otherwise FALSE.
            */
            Renderer.prototype.prepareOutputDirectory = function (directory) {
                if (FS.existsSync(directory)) {
                    if (!this.theme.isOutputDirectory(directory)) {
                        this.application.log(Util.format('Error: The output directory "%s" exists but does not seem to be a documentation generated by TypeDoc.\n' + 'Make sure this is the right target directory, delete the folder and rerun TypeDoc.', directory), 3 /* Error */);
                        return false;
                    }

                    try  {
                        FS.rmrfSync(directory);
                    } catch (error) {
                        this.application.log('Warning: Could not empty the output directory.', 2 /* Warn */);
                    }
                }

                if (!FS.existsSync(directory)) {
                    try  {
                        FS.mkdirpSync(directory);
                    } catch (error) {
                        this.application.log(Util.format('Error: Could not create output directory %s', directory), 3 /* Error */);
                        return false;
                    }
                }

                return true;
            };

            /**
            * Return the path containing the themes shipped with TypeDoc.
            *
            * @returns The path to the theme directory.
            */
            Renderer.getThemeDirectory = function () {
                return Path.resolve(Path.join(__dirname, 'themes'));
            };

            /**
            * Return the path to the default theme.
            *
            * @returns The path to the default theme.
            */
            Renderer.getDefaultTheme = function () {
                return Path.join(Renderer.getThemeDirectory(), 'default');
            };

            /**
            * Load the given file and return its contents.
            *
            * @param file  The path of the file to read.
            * @returns The files contents.
            */
            Renderer.readFile = function (file) {
                var buffer = FS.readFileSync(file);
                switch (buffer[0]) {
                    case 0xFE:
                        if (buffer[1] === 0xFF) {
                            var i = 0;
                            while ((i + 1) < buffer.length) {
                                var temp = buffer[i];
                                buffer[i] = buffer[i + 1];
                                buffer[i + 1] = temp;
                                i += 2;
                            }
                            return buffer.toString("ucs2", 2);
                        }
                        break;
                    case 0xFF:
                        if (buffer[1] === 0xFE) {
                            return buffer.toString("ucs2", 2);
                        }
                        break;
                    case 0xEF:
                        if (buffer[1] === 0xBB) {
                            return buffer.toString("utf8", 3);
                        }
                }

                return buffer.toString("utf8", 0);
            };
            Renderer.EVENT_BEGIN = 'beginRender';

            Renderer.EVENT_END = 'endRender';

            Renderer.EVENT_BEGIN_PAGE = 'beginPage';

            Renderer.EVENT_END_PAGE = 'endPage';

            Renderer.PLUGIN_CLASSES = [];
            return Renderer;
        })(TypeDoc.EventDispatcher);
        Output.Renderer = Renderer;
    })(TypeDoc.Output || (TypeDoc.Output = {}));
    var Output = TypeDoc.Output;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Output) {
        /**
        * An event emitted by the [[Renderer]] class at the very beginning and
        * ending of the entire rendering process.
        *
        * @see [[Renderer.EVENT_BEGIN]]
        * @see [[Renderer.EVENT_END]]
        */
        var OutputEvent = (function (_super) {
            __extends(OutputEvent, _super);
            function OutputEvent() {
                _super.apply(this, arguments);
            }
            /**
            * Create an [[OutputPageEvent]] event based on this event and the given url mapping.
            *
            * @internal
            * @param mapping  The mapping that defines the generated [[OutputPageEvent]] state.
            * @returns A newly created [[OutputPageEvent]] instance.
            */
            OutputEvent.prototype.createPageEvent = function (mapping) {
                var event = new Output.OutputPageEvent();
                event.project = this.project;
                event.settings = this.settings;
                event.url = mapping.url;
                event.model = mapping.model;
                event.templateName = mapping.template;
                event.filename = Path.join(this.outputDirectory, mapping.url);
                return event;
            };
            return OutputEvent;
        })(TypeDoc.Event);
        Output.OutputEvent = OutputEvent;
    })(TypeDoc.Output || (TypeDoc.Output = {}));
    var Output = TypeDoc.Output;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Output) {
        /**
        * An event emitted by the [[Renderer]] class before and after the
        * markup of a page is rendered.
        *
        * This object will be passed as the rendering context to handlebars templates.
        *
        * @see [[Renderer.EVENT_BEGIN_PAGE]]
        * @see [[Renderer.EVENT_END_PAGE]]
        */
        var OutputPageEvent = (function (_super) {
            __extends(OutputPageEvent, _super);
            function OutputPageEvent() {
                _super.apply(this, arguments);
            }
            return OutputPageEvent;
        })(TypeDoc.Event);
        Output.OutputPageEvent = OutputPageEvent;
    })(TypeDoc.Output || (TypeDoc.Output = {}));
    var Output = TypeDoc.Output;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Output) {
        /**
        * A plugin that copies the subdirectory ´assets´ from the current themes
        * source folder to the output directory.
        */
        var AssetsPlugin = (function (_super) {
            __extends(AssetsPlugin, _super);
            /**
            * Create a new AssetsPlugin instance.
            *
            * @param renderer  The renderer this plugin should be attached to.
            */
            function AssetsPlugin(renderer) {
                _super.call(this, renderer);
                /**
                * Should the default assets always be copied to the output directory?
                */
                this.copyDefaultAssets = true;
                renderer.on(Output.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
            }
            /**
            * Triggered before the renderer starts rendering a project.
            *
            * @param event  An event object describing the current render operation.
            */
            AssetsPlugin.prototype.onRendererBegin = function (event) {
                var fromDefault = Path.join(Output.Renderer.getDefaultTheme(), 'assets');
                var to = Path.join(event.outputDirectory, 'assets');

                if (this.copyDefaultAssets) {
                    FS.copySync(fromDefault, to);
                } else {
                    fromDefault = null;
                }

                var from = Path.join(this.renderer.theme.basePath, 'assets');
                if (from != fromDefault && FS.existsSync(from)) {
                    FS.copySync(from, to);
                }
            };
            return AssetsPlugin;
        })(Output.BasePlugin);
        Output.AssetsPlugin = AssetsPlugin;

        /**
        * Register this plugin.
        */
        Output.Renderer.PLUGIN_CLASSES.push(AssetsPlugin);
    })(TypeDoc.Output || (TypeDoc.Output = {}));
    var Output = TypeDoc.Output;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Output) {
        /**
        * A plugin that exports an index of the project to a javascript file.
        *
        * The resulting javascript file can be used to build a simple search function.
        */
        var JavascriptIndexPlugin = (function (_super) {
            __extends(JavascriptIndexPlugin, _super);
            /**
            * Create a new JavascriptIndexPlugin instance.
            *
            * @param renderer  The renderer this plugin should be attached to.
            */
            function JavascriptIndexPlugin(renderer) {
                _super.call(this, renderer);
                renderer.on(Output.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
            }
            /**
            * Triggered after a document has been rendered, just before it is written to disc.
            *
            * @param event  An event object describing the current render operation.
            */
            JavascriptIndexPlugin.prototype.onRendererBegin = function (event) {
                var rows = [];
                var kinds = {};

                event.project.reflections.forEach(function (reflection) {
                    if (!reflection.url || !reflection.name || reflection.isExternal || reflection.name == '' || reflection.kindOf(TypeDoc.Models.Kind.Parameter))
                        return;

                    var parent = reflection.parent;
                    if (parent instanceof TypeDoc.Models.ProjectReflection) {
                        parent = null;
                    } else if (parent.signatures) {
                        return;
                    }

                    var row = {
                        id: rows.length,
                        kind: reflection.kind,
                        name: reflection.name,
                        url: reflection.url,
                        classes: reflection.cssClasses
                    };

                    if (parent) {
                        row.parent = parent.getFullName();
                    }

                    if (!kinds[reflection.kind]) {
                        kinds[reflection.kind] = TypeDoc.Factories.GroupHandler.getKindSingular(reflection.kind);
                    }

                    rows.push(row);
                });

                var fileName = Path.join(event.outputDirectory, 'assets', 'js', 'search.js');
                var data = 'var typedoc = typedoc || {};' + 'typedoc.search = typedoc.search || {};' + 'typedoc.search.data = ' + JSON.stringify({ kinds: kinds, rows: rows }) + ';';

                TypeScript.IOUtils.writeFileAndFolderStructure(TypeScript.IO, fileName, data, true);
            };
            return JavascriptIndexPlugin;
        })(Output.BasePlugin);
        Output.JavascriptIndexPlugin = JavascriptIndexPlugin;

        /**
        * Register this plugin.
        */
        Output.Renderer.PLUGIN_CLASSES.push(JavascriptIndexPlugin);
    })(TypeDoc.Output || (TypeDoc.Output = {}));
    var Output = TypeDoc.Output;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Output) {
        /**
        * A plugin that wraps the generated output with a layout template.
        *
        * Currently only a default layout is supported. The layout must be stored
        * as ´layouts/default.hbs´ in the theme directory.
        */
        var LayoutPlugin = (function (_super) {
            __extends(LayoutPlugin, _super);
            /**
            * Create a new LayoutPlugin instance.
            *
            * @param renderer  The renderer this plugin should be attached to.
            */
            function LayoutPlugin(renderer) {
                _super.call(this, renderer);
                renderer.on(Output.Renderer.EVENT_END_PAGE, this.onRendererEndPage, this);
            }
            /**
            * Triggered after a document has been rendered, just before it is written to disc.
            *
            * @param page  An event object describing the current render operation.
            */
            LayoutPlugin.prototype.onRendererEndPage = function (page) {
                var layout = this.renderer.getTemplate('layouts/default.hbs');
                page.contents = layout(page);
            };
            return LayoutPlugin;
        })(Output.BasePlugin);
        Output.LayoutPlugin = LayoutPlugin;

        /**
        * Register this plugin.
        */
        Output.Renderer.PLUGIN_CLASSES.push(LayoutPlugin);
    })(TypeDoc.Output || (TypeDoc.Output = {}));
    var Output = TypeDoc.Output;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Output) {
        /**
        * A plugin that exposes the markdown, compact and relativeURL helper to handlebars.
        *
        * Templates should parse all comments with the markdown handler so authors can
        * easily format their documentation. TypeDoc uses the Marked (https://github.com/chjj/marked)
        * markdown parser and HighlightJS (https://github.com/isagalaev/highlight.js) to highlight
        * code blocks within markdown sections. Additionally this plugin allows to link to other symbols
        * using double angle brackets.
        *
        * You can use the markdown helper anywhere in the templates to convert content to html:
        *
        * ```handlebars
        * {{#markdown}}{{{comment.text}}}{{/markdown}}
        * ```
        *
        * The compact helper removes all newlines of its content:
        *
        * ```handlebars
        * {{#compact}}
        *   Compact
        *   this
        * {{/compact}}
        * ```
        *
        * The relativeURL helper simply transforms an absolute url into a relative url:
        *
        * ```handlebars
        * {{#relativeURL url}}
        * ```
        */
        var MarkedPlugin = (function (_super) {
            __extends(MarkedPlugin, _super);
            /**
            * Create a new MarkedPlugin instance.
            *
            * @param renderer  The renderer this plugin should be attached to.
            */
            function MarkedPlugin(renderer) {
                var _this = this;
                _super.call(this, renderer);
                renderer.on(Output.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
                renderer.on(Output.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);

                var that = this;
                Handlebars.registerHelper('markdown', function (arg) {
                    return that.parseMarkdown(arg.fn(this));
                });
                Handlebars.registerHelper('compact', function (arg) {
                    return that.getCompact(arg.fn(this));
                });
                Handlebars.registerHelper('relativeURL', function (url) {
                    return _this.getRelativeUrl(url);
                });
                Handlebars.registerHelper('wbr', function (str) {
                    return _this.getWordBreaks(str);
                });
                Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
                    return that.getIfCond(v1, operator, v2, options, this);
                });

                HighlightJS.registerLanguage('typescript', highlightTypeScript);

                Marked.setOptions({
                    highlight: function (text, lang) {
                        return _this.getHighlighted(text, lang);
                    }
                });
            }
            /**
            * Transform the given absolute path into a relative path.
            *
            * @param absolute  The absolute path to transform.
            * @returns A path relative to the document currently processed.
            */
            MarkedPlugin.prototype.getRelativeUrl = function (absolute) {
                var relative = Path.relative(Path.dirname(this.location), Path.dirname(absolute));
                return Path.join(relative, Path.basename(absolute)).replace(/\\/g, '/');
            };

            /**
            * Compress the given string by removing all newlines.
            *
            * @param text  The string that should be compressed.
            * @returns The string with all newlsines stripped.
            */
            MarkedPlugin.prototype.getCompact = function (text) {
                var lines = text.split('\n');
                for (var i = 0, c = lines.length; i < c; i++) {
                    lines[i] = lines[i].trim().replace(/&nbsp;/, ' ');
                }
                return lines.join('');
            };

            /**
            * Insert word break tags ``<wbr>`` into the given string.
            *
            * Breaks the given string at ``_``, ``-`` and captial letters.
            *
            * @param str  The string that should be split.
            * @return     The original string containing ``<wbr>`` tags where possible.
            */
            MarkedPlugin.prototype.getWordBreaks = function (str) {
                str = str.replace(/([^_\-][_\-])([^_\-])/g, function (m, a, b) {
                    return a + '<wbr>' + b;
                });
                str = str.replace(/([^A-Z])([A-Z][^A-Z])/g, function (m, a, b) {
                    return a + '<wbr>' + b;
                });
                return str;
            };

            /**
            * Highlight the synatx of the given text using HighlightJS.
            *
            * @param text  The text taht should be highlightes.
            * @param lang  The language that should be used to highlight the string.
            * @return A html string with syntax highlighting.
            */
            MarkedPlugin.prototype.getHighlighted = function (text, lang) {
                try  {
                    if (lang) {
                        return HighlightJS.highlight(lang, text).value;
                    } else {
                        return HighlightJS.highlightAuto(text).value;
                    }
                } catch (error) {
                    this.renderer.application.log(error.message, 2 /* Warn */);
                    return text;
                }
            };

            /**
            * Handlebars if helper with condition.
            *
            * @param v1        The first value to be compared.
            * @param operator  The operand to perform on the two given values.
            * @param v2        The second value to be compared
            * @param options   The current handlebars object.
            * @param context   The current handlebars context.
            * @returns {*}
            */
            MarkedPlugin.prototype.getIfCond = function (v1, operator, v2, options, context) {
                switch (operator) {
                    case '==':
                        return (v1 == v2) ? options.fn(context) : options.inverse(context);
                    case '===':
                        return (v1 === v2) ? options.fn(context) : options.inverse(context);
                    case '<':
                        return (v1 < v2) ? options.fn(context) : options.inverse(context);
                    case '<=':
                        return (v1 <= v2) ? options.fn(context) : options.inverse(context);
                    case '>':
                        return (v1 > v2) ? options.fn(context) : options.inverse(context);
                    case '>=':
                        return (v1 >= v2) ? options.fn(context) : options.inverse(context);
                    case '&&':
                        return (v1 && v2) ? options.fn(context) : options.inverse(context);
                    case '||':
                        return (v1 || v2) ? options.fn(context) : options.inverse(context);
                    default:
                        return options.inverse(context);
                }
            };

            /**
            * Parse the given markdown string and return the resulting html.
            *
            * @param text  The markdown string that should be parsed.
            * @returns The resulting html string.
            */
            MarkedPlugin.prototype.parseMarkdown = function (text) {
                var html = Marked(text);
                return this.parseReferences(html);
            };

            /**
            * Find all references to symbols within the given text and transform them into a link.
            *
            * The references must be surrounded with double angle brackets. When the reference could
            * not be found, the original text containing the brackets will be returned.
            *
            * This function is aware of the current context and will try to find the symbol within the
            * current reflection. It will walk up the reflection chain till the symbol is found or the
            * root reflection is reached. As a last resort the function will search the entire project
            * for the given symbol.
            *
            * @param text  The text that should be parsed.
            * @returns The text with symbol references replaced by links.
            */
            MarkedPlugin.prototype.parseReferences = function (text) {
                var _this = this;
                return text.replace(/\[\[([^\]]+)\]\]/g, function (match, name) {
                    var reflection;
                    if (_this.reflection) {
                        reflection = _this.reflection.findReflectionByName(name);
                    } else if (_this.project) {
                        reflection = _this.project.findReflectionByName(name);
                    }

                    if (reflection) {
                        return Util.format('<a href="%s">%s</a>', _this.getRelativeUrl(reflection.url), name);
                    } else {
                        return match;
                    }
                });
            };

            /**
            * Triggered before the renderer starts rendering a project.
            *
            * @param event  An event object describing the current render operation.
            */
            MarkedPlugin.prototype.onRendererBegin = function (event) {
                this.project = event.project;
            };

            /**
            * Triggered before a document will be rendered.
            *
            * @param page  An event object describing the current render operation.
            */
            MarkedPlugin.prototype.onRendererBeginPage = function (page) {
                this.location = page.url;
                this.reflection = page.model instanceof TypeDoc.Models.DeclarationReflection ? page.model : null;
            };
            return MarkedPlugin;
        })(Output.BasePlugin);
        Output.MarkedPlugin = MarkedPlugin;

        /**
        * TypeScript HighlightJS definition.
        */
        function highlightTypeScript(hljs) {
            var IDENT_RE = '[a-zA-Z_$][a-zA-Z0-9_$]*';
            var IDENT_FUNC_RETURN_TYPE_RE = '([*]|[a-zA-Z_$][a-zA-Z0-9_$]*)';
            var AS3_REST_ARG_MODE = {
                className: 'rest_arg',
                begin: '[.]{3}', end: IDENT_RE,
                relevance: 10
            };

            return {
                aliases: ['ts'],
                keywords: {
                    keyword: 'in if for while finally var new function do return void else break catch ' + 'instanceof with throw case default try this switch continue typeof delete ' + 'let yield const class interface enum static private public',
                    literal: 'true false null undefined NaN Infinity any string number void',
                    built_in: 'eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent ' + 'encodeURI encodeURIComponent escape unescape Object Function Boolean Error ' + 'EvalError InternalError RangeError ReferenceError StopIteration SyntaxError ' + 'TypeError URIError Number Math Date String RegExp Array Float32Array ' + 'Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array ' + 'Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require'
                },
                contains: [
                    hljs.APOS_STRING_MODE,
                    hljs.QUOTE_STRING_MODE,
                    hljs.C_LINE_COMMENT_MODE,
                    hljs.C_BLOCK_COMMENT_MODE,
                    hljs.C_NUMBER_MODE,
                    {
                        className: 'module',
                        beginKeywords: 'module', end: '{',
                        contains: [hljs.TITLE_MODE]
                    },
                    {
                        className: 'class',
                        beginKeywords: 'class interface', end: '{',
                        contains: [
                            {
                                beginKeywords: 'extends implements'
                            },
                            hljs.TITLE_MODE
                        ]
                    },
                    {
                        className: 'function',
                        beginKeywords: 'function', end: '[{;]',
                        illegal: '\\S',
                        contains: [
                            hljs.TITLE_MODE,
                            {
                                className: 'params',
                                begin: '\\(', end: '\\)',
                                contains: [
                                    hljs.APOS_STRING_MODE,
                                    hljs.QUOTE_STRING_MODE,
                                    hljs.C_LINE_COMMENT_MODE,
                                    hljs.C_BLOCK_COMMENT_MODE,
                                    AS3_REST_ARG_MODE
                                ]
                            },
                            {
                                className: 'type',
                                begin: ':',
                                end: IDENT_FUNC_RETURN_TYPE_RE,
                                relevance: 10
                            }
                        ]
                    }
                ]
            };
        }

        /**
        * Register this plugin.
        */
        Output.Renderer.PLUGIN_CLASSES.push(MarkedPlugin);
    })(TypeDoc.Output || (TypeDoc.Output = {}));
    var Output = TypeDoc.Output;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Output) {
        /**
        * A plugin that exposes the navigation structure of the documentation
        * to the rendered templates.
        *
        * The navigation structure is generated using the current themes
        * [[BaseTheme.getNavigation]] function. This plugins takes care that the navigation
        * is updated and passed to the render context.
        */
        var NavigationPlugin = (function (_super) {
            __extends(NavigationPlugin, _super);
            /**
            * Create a new NavigationPlugin instance.
            *
            * @param renderer  The renderer this plugin should be attached to.
            */
            function NavigationPlugin(renderer) {
                _super.call(this, renderer);
                renderer.on(Output.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
                renderer.on(Output.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
            }
            /**
            * Triggered before the renderer starts rendering a project.
            *
            * @param event  An event object describing the current render operation.
            */
            NavigationPlugin.prototype.onRendererBegin = function (event) {
                this.navigation = this.renderer.theme.getNavigation(event.project);
            };

            /**
            * Triggered before a document will be rendered.
            *
            * @param page  An event object describing the current render operation.
            */
            NavigationPlugin.prototype.onRendererBeginPage = function (page) {
                var currentItems = [];
                (function updateItem(item) {
                    item.isCurrent = false;
                    item.isInPath = false;
                    item.isVisible = item.isGlobals;

                    if (item.url == page.url || (item.dedicatedUrls && item.dedicatedUrls.indexOf(page.url) != -1)) {
                        currentItems.push(item);
                    }

                    if (item.children) {
                        item.children.forEach(function (child) {
                            return updateItem(child);
                        });
                    }
                })(this.navigation);

                currentItems.forEach(function (item) {
                    item.isCurrent = true;

                    var depth = item.isGlobals ? -1 : 0;
                    var count = 1;
                    while (item) {
                        item.isInPath = true;
                        item.isVisible = true;

                        count += 1;
                        depth += 1;
                        if (item.children) {
                            count += item.children.length;
                            if (depth < 2 || count < 30) {
                                item.children.forEach(function (child) {
                                    return child.isVisible = true;
                                });
                            }
                        }

                        item = item.parent;
                    }
                });

                page.navigation = this.navigation;
            };
            return NavigationPlugin;
        })(Output.BasePlugin);
        Output.NavigationPlugin = NavigationPlugin;

        /**
        * Register this plugin.
        */
        Output.Renderer.PLUGIN_CLASSES.push(NavigationPlugin);
    })(TypeDoc.Output || (TypeDoc.Output = {}));
    var Output = TypeDoc.Output;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Output) {
        /**
        * A plugin that loads all partials of the current theme.
        *
        * Partials must be placed in the ´partials´ subdirectory of the theme. The plugin first
        * loads the partials of the default theme and then the partials of the current theme.
        */
        var PartialsPlugin = (function (_super) {
            __extends(PartialsPlugin, _super);
            /**
            * Create a new PartialsPlugin instance.
            *
            * @param renderer  The renderer this plugin should be attached to.
            */
            function PartialsPlugin(renderer) {
                _super.call(this, renderer);
                renderer.on(Output.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
            }
            /**
            * Load all files in the given directory and registers them as partials.
            *
            * @param path  The path of the directory that should be scanned.
            */
            PartialsPlugin.prototype.loadPartials = function (path) {
                if (!FS.existsSync(path) || !FS.statSync(path).isDirectory()) {
                    return;
                }

                FS.readdirSync(path).forEach(function (fileName) {
                    var file = Path.join(path, fileName);
                    var name = Path.basename(fileName, Path.extname(fileName));
                    Handlebars.registerPartial(name, Output.Renderer.readFile(file));
                });
            };

            /**
            * Triggered before the renderer starts rendering a project.
            *
            * @param event  An event object describing the current render operation.
            */
            PartialsPlugin.prototype.onRendererBegin = function (event) {
                var themePath = Path.join(this.renderer.theme.basePath, 'partials');
                var defaultPath = Path.join(Output.Renderer.getDefaultTheme(), 'partials');

                if (themePath != defaultPath) {
                    this.loadPartials(defaultPath);
                }

                this.loadPartials(themePath);
            };
            return PartialsPlugin;
        })(Output.BasePlugin);
        Output.PartialsPlugin = PartialsPlugin;

        /**
        * Register this plugin.
        */
        Output.Renderer.PLUGIN_CLASSES.push(PartialsPlugin);
    })(TypeDoc.Output || (TypeDoc.Output = {}));
    var Output = TypeDoc.Output;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Output) {
        /**
        * List of states the parser of [[PrettyPrintPlugin]] can be in.
        */
        var PrettyPrintState;
        (function (PrettyPrintState) {
            /**
            * Default state of the parser. Empty lines will be removed and indention will be adjusted.
            */
            PrettyPrintState[PrettyPrintState["Default"] = 0] = "Default";

            /**
            * Comment state, the parser waits for a comment closing tag.
            */
            PrettyPrintState[PrettyPrintState["Comment"] = 1] = "Comment";

            /**
            * Pre state, the parser waits for the closing tag of the current pre block.
            */
            PrettyPrintState[PrettyPrintState["Pre"] = 2] = "Pre";
        })(PrettyPrintState || (PrettyPrintState = {}));

        /**
        * A plugin that pretty prints the generated html.
        *
        * This not only aids in making the generated html source code more readable, by removing
        * blank lines and unnecessary whitespaces the size of the documentation is reduced without
        * visual impact.
        *
        * At the point writing this the docs of TypeDoc took 97.8 MB  without and 66.4 MB with this
        * plugin enabled, so it reduced the size to 68% of the original output.
        */
        var PrettyPrintPlugin = (function (_super) {
            __extends(PrettyPrintPlugin, _super);
            /**
            * Create a new PrettyPrintPlugin instance.
            *
            * @param renderer  The renderer this plugin should be attached to.
            */
            function PrettyPrintPlugin(renderer) {
                _super.call(this, renderer);
                renderer.on(Output.Renderer.EVENT_END_PAGE, this.onRendererEndPage, this, -1024);
            }
            /**
            * Triggered after a document has been rendered, just before it is written to disc.
            *
            * @param event
            */
            PrettyPrintPlugin.prototype.onRendererEndPage = function (event) {
                var match, line, lineState, lineDepth, tagName, preName;

                var tagExp = /<\s*(\w+)[^>]*>|<\/\s*(\w+)[^>]*>|<!--|-->/g;
                var emptyLineExp = /^[\s]*$/;
                var minLineDepth = 1;
                var state = 0 /* Default */;
                var stack = [];

                var lines = event.contents.split(/\r\n?|\n/);
                var index = 0;
                var count = lines.length;

                while (index < count) {
                    line = lines[index];
                    if (emptyLineExp.test(line)) {
                        if (state == 0 /* Default */) {
                            lines.splice(index, 1);
                            count -= 1;
                            continue;
                        }
                    } else {
                        lineState = state;
                        lineDepth = stack.length;

                        while (match = tagExp.exec(line)) {
                            if (state == 1 /* Comment */) {
                                if (match[0] == '-->') {
                                    state = 0 /* Default */;
                                }
                            } else if (state == 2 /* Pre */) {
                                if (match[2] && match[2].toLowerCase() == preName) {
                                    state = 0 /* Default */;
                                }
                            } else {
                                if (match[0] == '<!--') {
                                    state = 1 /* Comment */;
                                } else if (match[1]) {
                                    tagName = match[1].toLowerCase();
                                    if (tagName in PrettyPrintPlugin.IGNORED_TAGS)
                                        continue;
                                    if (tagName in PrettyPrintPlugin.PRE_TAGS) {
                                        state = 2 /* Pre */;
                                        preName = tagName;
                                    } else {
                                        if (tagName == 'body')
                                            minLineDepth = 2;
                                        stack.push(tagName);
                                    }
                                } else if (match[2]) {
                                    tagName = match[2].toLowerCase();
                                    if (tagName in PrettyPrintPlugin.IGNORED_TAGS)
                                        continue;

                                    var n = stack.lastIndexOf(tagName);
                                    if (n != -1) {
                                        stack.length = n;
                                    }
                                }
                            }
                        }

                        if (lineState == 0 /* Default */) {
                            lineDepth = Math.min(lineDepth, stack.length);
                            line = line.replace(/^\s+/, '');
                            if (lineDepth > minLineDepth) {
                                line = Array(lineDepth - minLineDepth + 1).join('\t') + line;
                            }

                            lines[index] = line;
                        }
                    }

                    index++;
                }

                event.contents = lines.join('\n');
            };
            PrettyPrintPlugin.IGNORED_TAGS = {
                area: true,
                base: true,
                br: true,
                wbr: true,
                col: true,
                command: true,
                embed: true,
                hr: true,
                img: true,
                input: true,
                link: true,
                meta: true,
                param: true,
                source: true
            };

            PrettyPrintPlugin.PRE_TAGS = {
                pre: true,
                code: true,
                textarea: true,
                script: true,
                style: true
            };
            return PrettyPrintPlugin;
        })(Output.BasePlugin);
        Output.PrettyPrintPlugin = PrettyPrintPlugin;

        /**
        * Register this plugin.
        */
        Output.Renderer.PLUGIN_CLASSES.push(PrettyPrintPlugin);
    })(TypeDoc.Output || (TypeDoc.Output = {}));
    var Output = TypeDoc.Output;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Output) {
        /**
        * A plugin that generates a table of contents for the current page.
        *
        * The table of contents will start at the nearest module or dynamic module. This plugin
        * sets the [[OutputPageEvent.toc]] property.
        */
        var TocPlugin = (function (_super) {
            __extends(TocPlugin, _super);
            /**
            * Create a new TocPlugin instance.
            *
            * @param renderer  The renderer this plugin should be attached to.
            */
            function TocPlugin(renderer) {
                _super.call(this, renderer);
                renderer.on(Output.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
            }
            /**
            * Triggered before a document will be rendered.
            *
            * @param page  An event object describing the current render operation.
            */
            TocPlugin.prototype.onRendererBeginPage = function (page) {
                var model = page.model;
                if (!(model instanceof TypeDoc.Models.BaseReflection)) {
                    return;
                }

                var trail = [];
                while (!(model instanceof TypeDoc.Models.ProjectReflection) && !model.kindOf(TypeScript.PullElementKind.SomeContainer)) {
                    trail.unshift(model);
                    model = model.parent;
                }

                page.toc = new TypeDoc.Models.NavigationItem();
                TocPlugin.buildToc(model, trail, page.toc);
            };

            /**
            * Create a toc navigation item structure.
            *
            * @param model   The models whose children should be written to the toc.
            * @param trail   Defines the active trail of expanded toc entries.
            * @param parent  The parent [[Models.NavigationItem]] the toc should be appended to.
            */
            TocPlugin.buildToc = function (model, trail, parent) {
                var index = trail.indexOf(model);
                if (index < trail.length - 1 && model.children.length > 40) {
                    var child = trail[index + 1];
                    var item = TypeDoc.Models.NavigationItem.create(child, parent, true);
                    item.isInPath = true;
                    item.isCurrent = false;
                    TocPlugin.buildToc(child, trail, item);
                } else {
                    model.children.forEach(function (child) {
                        if (child.kindOf(TypeScript.PullElementKind.SomeContainer)) {
                            return;
                        }

                        var item = TypeDoc.Models.NavigationItem.create(child, parent, true);
                        if (trail.indexOf(child) != -1) {
                            item.isInPath = true;
                            item.isCurrent = (trail[trail.length - 1] == child);
                            TocPlugin.buildToc(child, trail, item);
                        }
                    });
                }
            };
            return TocPlugin;
        })(Output.BasePlugin);
        Output.TocPlugin = TocPlugin;

        /**
        * Register this plugin.
        */
        Output.Renderer.PLUGIN_CLASSES.push(TocPlugin);
    })(TypeDoc.Output || (TypeDoc.Output = {}));
    var Output = TypeDoc.Output;
})(TypeDoc || (TypeDoc = {}));
//
// Copyright (c) Microsoft Corporation.  All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
var TypeScript;
(function (TypeScript) {
    (function (IOUtils) {
        // Creates the directory including its parent if not already present
        function createDirectoryStructure(ioHost, dirName) {
            if (ioHost.directoryExists(dirName)) {
                return;
            }

            var parentDirectory = ioHost.dirName(dirName);
            if (parentDirectory != "") {
                createDirectoryStructure(ioHost, parentDirectory);
            }
            ioHost.createDirectory(dirName);
        }

        // Creates a file including its directory structure if not already present
        function writeFileAndFolderStructure(ioHost, fileName, contents, writeByteOrderMark) {
            var start = new Date().getTime();
            var path = ioHost.resolvePath(fileName);
            TypeScript.ioHostResolvePathTime += new Date().getTime() - start;

            var start = new Date().getTime();
            var dirName = ioHost.dirName(path);
            TypeScript.ioHostDirectoryNameTime += new Date().getTime() - start;

            var start = new Date().getTime();
            createDirectoryStructure(ioHost, dirName);
            TypeScript.ioHostCreateDirectoryStructureTime += new Date().getTime() - start;

            var start = new Date().getTime();
            ioHost.writeFile(path, contents, writeByteOrderMark);
            TypeScript.ioHostWriteFileTime += new Date().getTime() - start;
        }
        IOUtils.writeFileAndFolderStructure = writeFileAndFolderStructure;

        function throwIOError(message, error) {
            var errorMessage = message;
            if (error && error.message) {
                errorMessage += (" " + error.message);
            }
            throw new Error(errorMessage);
        }
        IOUtils.throwIOError = throwIOError;

        function combine(prefix, suffix) {
            return prefix + "/" + suffix;
        }
        IOUtils.combine = combine;

        var BufferedTextWriter = (function () {
            // Inner writer does not need a WriteLine method, since the BufferedTextWriter wraps it itself
            function BufferedTextWriter(writer, capacity) {
                if (typeof capacity === "undefined") { capacity = 1024; }
                this.writer = writer;
                this.capacity = capacity;
                this.buffer = "";
            }
            BufferedTextWriter.prototype.Write = function (str) {
                this.buffer += str;
                if (this.buffer.length >= this.capacity) {
                    this.writer.Write(this.buffer);
                    this.buffer = "";
                }
            };
            BufferedTextWriter.prototype.WriteLine = function (str) {
                this.Write(str + '\r\n');
            };
            BufferedTextWriter.prototype.Close = function () {
                this.writer.Write(this.buffer);
                this.writer.Close();
                this.buffer = null;
            };
            return BufferedTextWriter;
        })();
        IOUtils.BufferedTextWriter = BufferedTextWriter;
    })(TypeScript.IOUtils || (TypeScript.IOUtils = {}));
    var IOUtils = TypeScript.IOUtils;

    TypeScript.IO = (function () {
        // Create an IO object for use inside WindowsScriptHost hosts
        // Depends on WSCript and FileSystemObject
        function getWindowsScriptHostIO() {
            var fso = new ActiveXObject("Scripting.FileSystemObject");
            var streamObjectPool = [];

            function getStreamObject() {
                if (streamObjectPool.length > 0) {
                    return streamObjectPool.pop();
                } else {
                    return new ActiveXObject("ADODB.Stream");
                }
            }

            function releaseStreamObject(obj) {
                streamObjectPool.push(obj);
            }

            var args = [];
            for (var i = 0; i < WScript.Arguments.length; i++) {
                args[i] = WScript.Arguments.Item(i);
            }

            return {
                appendFile: function (path, content) {
                    var txtFile = fso.OpenTextFile(path, 8, true);
                    txtFile.Write(content);
                    txtFile.Close();
                },
                readFile: function (path, codepage) {
                    return TypeScript.Environment.readFile(path, codepage);
                },
                writeFile: function (path, contents, writeByteOrderMark) {
                    TypeScript.Environment.writeFile(path, contents, writeByteOrderMark);
                },
                fileExists: function (path) {
                    return fso.FileExists(path);
                },
                resolvePath: function (path) {
                    return fso.GetAbsolutePathName(path);
                },
                dirName: function (path) {
                    return fso.GetParentFolderName(path);
                },
                findFile: function (rootPath, partialFilePath) {
                    var path = fso.GetAbsolutePathName(rootPath) + "/" + partialFilePath;

                    while (true) {
                        if (fso.FileExists(path)) {
                            return { fileInformation: this.readFile(path), path: path };
                        } else {
                            rootPath = fso.GetParentFolderName(fso.GetAbsolutePathName(rootPath));

                            if (rootPath == "") {
                                return null;
                            } else {
                                path = fso.BuildPath(rootPath, partialFilePath);
                            }
                        }
                    }
                },
                deleteFile: function (path) {
                    try  {
                        if (fso.FileExists(path)) {
                            fso.DeleteFile(path, true); // true: delete read-only files
                        }
                    } catch (e) {
                        IOUtils.throwIOError(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Could_not_delete_file_0, [path]), e);
                    }
                },
                directoryExists: function (path) {
                    return fso.FolderExists(path);
                },
                createDirectory: function (path) {
                    try  {
                        if (!this.directoryExists(path)) {
                            fso.CreateFolder(path);
                        }
                    } catch (e) {
                        IOUtils.throwIOError(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Could_not_create_directory_0, [path]), e);
                    }
                },
                dir: function (path, spec, options) {
                    options = options || {};
                    function filesInFolder(folder, root) {
                        var paths = [];
                        var fc;

                        if (options.recursive) {
                            fc = new Enumerator(folder.subfolders);

                            for (; !fc.atEnd(); fc.moveNext()) {
                                paths = paths.concat(filesInFolder(fc.item(), root + "/" + fc.item().Name));
                            }
                        }

                        fc = new Enumerator(folder.files);

                        for (; !fc.atEnd(); fc.moveNext()) {
                            if (!spec || fc.item().Name.match(spec)) {
                                paths.push(root + "/" + fc.item().Name);
                            }
                        }

                        return paths;
                    }

                    var folder = fso.GetFolder(path);
                    var paths = [];

                    return filesInFolder(folder, path);
                },
                print: function (str) {
                    WScript.StdOut.Write(str);
                },
                printLine: function (str) {
                    WScript.Echo(str);
                },
                arguments: args,
                stderr: WScript.StdErr,
                stdout: WScript.StdOut,
                watchFile: null,
                run: function (source, fileName) {
                    try  {
                        eval(source);
                    } catch (e) {
                        IOUtils.throwIOError(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Error_while_executing_file_0, [fileName]), e);
                    }
                },
                getExecutingFilePath: function () {
                    return WScript.ScriptFullName;
                },
                quit: function (exitCode) {
                    if (typeof exitCode === "undefined") { exitCode = 0; }
                    try  {
                        WScript.Quit(exitCode);
                    } catch (e) {
                    }
                }
            };
        }
        ;

        // Create an IO object for use inside Node.js hosts
        // Depends on 'fs' and 'path' modules
        function getNodeIO() {
            var _fs = require('fs');
            var _path = require('path');
            var _module = require('module');

            return {
                appendFile: function (path, content) {
                    _fs.appendFileSync(path, content);
                },
                readFile: function (file, codepage) {
                    return TypeScript.Environment.readFile(file, codepage);
                },
                writeFile: function (path, contents, writeByteOrderMark) {
                    TypeScript.Environment.writeFile(path, contents, writeByteOrderMark);
                },
                deleteFile: function (path) {
                    try  {
                        _fs.unlinkSync(path);
                    } catch (e) {
                        IOUtils.throwIOError(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Could_not_delete_file_0, [path]), e);
                    }
                },
                fileExists: function (path) {
                    return _fs.existsSync(path);
                },
                dir: function dir(path, spec, options) {
                    options = options || {};

                    function filesInFolder(folder) {
                        var paths = [];

                        try  {
                            var files = _fs.readdirSync(folder);
                            for (var i = 0; i < files.length; i++) {
                                var stat = _fs.statSync(folder + "/" + files[i]);
                                if (options.recursive && stat.isDirectory()) {
                                    paths = paths.concat(filesInFolder(folder + "/" + files[i]));
                                } else if (stat.isFile() && (!spec || files[i].match(spec))) {
                                    paths.push(folder + "/" + files[i]);
                                }
                            }
                        } catch (err) {
                            /*
                            *   Skip folders that are inaccessible
                            */
                        }

                        return paths;
                    }

                    return filesInFolder(path);
                },
                createDirectory: function (path) {
                    try  {
                        if (!this.directoryExists(path)) {
                            _fs.mkdirSync(path);
                        }
                    } catch (e) {
                        IOUtils.throwIOError(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Could_not_create_directory_0, [path]), e);
                    }
                },
                directoryExists: function (path) {
                    return _fs.existsSync(path) && _fs.statSync(path).isDirectory();
                },
                resolvePath: function (path) {
                    return _path.resolve(path);
                },
                dirName: function (path) {
                    var dirPath = _path.dirname(path);

                    // Node will just continue to repeat the root path, rather than return null
                    if (dirPath === path) {
                        dirPath = null;
                    }

                    return dirPath;
                },
                findFile: function (rootPath, partialFilePath) {
                    var path = rootPath + "/" + partialFilePath;

                    while (true) {
                        if (_fs.existsSync(path)) {
                            return { fileInformation: this.readFile(path), path: path };
                        } else {
                            var parentPath = _path.resolve(rootPath, "..");

                            // Node will just continue to repeat the root path, rather than return null
                            if (rootPath === parentPath) {
                                return null;
                            } else {
                                rootPath = parentPath;
                                path = _path.resolve(rootPath, partialFilePath);
                            }
                        }
                    }
                },
                print: function (str) {
                    process.stdout.write(str);
                },
                printLine: function (str) {
                    process.stdout.write(str + '\n');
                },
                arguments: process.argv.slice(2),
                stderr: {
                    Write: function (str) {
                        process.stderr.write(str);
                    },
                    WriteLine: function (str) {
                        process.stderr.write(str + '\n');
                    },
                    Close: function () {
                    }
                },
                stdout: {
                    Write: function (str) {
                        process.stdout.write(str);
                    },
                    WriteLine: function (str) {
                        process.stdout.write(str + '\n');
                    },
                    Close: function () {
                    }
                },
                watchFile: function (fileName, callback) {
                    var firstRun = true;
                    var processingChange = false;

                    var fileChanged = function (curr, prev) {
                        if (!firstRun) {
                            if (curr.mtime < prev.mtime) {
                                return;
                            }

                            _fs.unwatchFile(fileName, fileChanged);
                            if (!processingChange) {
                                processingChange = true;
                                callback(fileName);
                                setTimeout(function () {
                                    processingChange = false;
                                }, 100);
                            }
                        }
                        firstRun = false;
                        _fs.watchFile(fileName, { persistent: true, interval: 500 }, fileChanged);
                    };

                    fileChanged();
                    return {
                        fileName: fileName,
                        close: function () {
                            _fs.unwatchFile(fileName, fileChanged);
                        }
                    };
                },
                run: function (source, fileName) {
                    require.main.fileName = fileName;
                    require.main.paths = _module._nodeModulePaths(_path.dirname(_fs.realpathSync(fileName)));
                    require.main._compile(source, fileName);
                },
                getExecutingFilePath: function () {
                    return process['mainModule'].filename;
                },
                quit: function (code) {
                    var stderrFlushed = process.stderr.write('');
                    var stdoutFlushed = process.stdout.write('');
                    process.stderr.on('drain', function () {
                        stderrFlushed = true;
                        if (stdoutFlushed) {
                            process.exit(code);
                        }
                    });
                    process.stdout.on('drain', function () {
                        stdoutFlushed = true;
                        if (stderrFlushed) {
                            process.exit(code);
                        }
                    });
                    setTimeout(function () {
                        process.exit(code);
                    }, 5);
                }
            };
        }
        ;

        if (typeof WScript !== "undefined" && typeof ActiveXObject === "function")
            return getWindowsScriptHostIO();
        else if (typeof module !== 'undefined' && module.exports)
            return getNodeIO();
        else
            return null;
    })();
})(TypeScript || (TypeScript = {}));
//
// Copyright (c) Microsoft Corporation.  All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
///<reference path="io.ts" />
var TypeScript;
(function (TypeScript) {
    var OptionsParser = (function () {
        function OptionsParser(host, version) {
            this.host = host;
            this.version = version;
            this.DEFAULT_SHORT_FLAG = "-";
            this.DEFAULT_LONG_FLAG = "--";
            this.printedVersion = false;
            this.unnamed = [];
            this.options = [];
        }
        // Find the option record for the given string. Returns null if not found.
        OptionsParser.prototype.findOption = function (arg) {
            var upperCaseArg = arg && arg.toUpperCase();

            for (var i = 0; i < this.options.length; i++) {
                var current = this.options[i];

                if (upperCaseArg === (current.short && current.short.toUpperCase()) || upperCaseArg === (current.name && current.name.toUpperCase())) {
                    return current;
                }
            }

            return null;
        };

        OptionsParser.prototype.printUsage = function () {
            this.printVersion();

            var optionsWord = TypeScript.getLocalizedText(TypeScript.DiagnosticCode.options, null);
            var fileWord = TypeScript.getLocalizedText(TypeScript.DiagnosticCode.file1, null);
            var tscSyntax = "typedoc [" + optionsWord + "] [" + fileWord + " ..]";
            var syntaxHelp = TypeScript.getLocalizedText(TypeScript.DiagnosticCode.Syntax_0, [tscSyntax]);
            this.host.printLine(syntaxHelp);
            this.host.printLine("");
            this.host.printLine(TypeScript.getLocalizedText(TypeScript.DiagnosticCode.Examples, null) + " typedoc --out ../doc/ hello.ts");
            this.host.printLine("");
            this.host.printLine(TypeScript.getLocalizedText(TypeScript.DiagnosticCode.Options, null));

            var output = [];
            var maxLength = 0;
            var i = 0;

            this.options = this.options.sort(function (a, b) {
                var aName = a.name.toLowerCase();
                var bName = b.name.toLowerCase();

                if (aName > bName) {
                    return 1;
                } else if (aName < bName) {
                    return -1;
                } else {
                    return 0;
                }
            });

            for (i = 0; i < this.options.length; i++) {
                var option = this.options[i];

                if (option.experimental) {
                    continue;
                }

                if (!option.usage) {
                    break;
                }

                var usageString = "  ";
                var type = option.type ? (" " + TypeScript.getLocalizedText(option.type, null)) : "";

                if (option.short) {
                    usageString += this.DEFAULT_SHORT_FLAG + option.short + type + ", ";
                }

                usageString += this.DEFAULT_LONG_FLAG + option.name + type;

                output.push([usageString, TypeScript.getLocalizedText(option.usage.locCode, option.usage.args)]);

                if (usageString.length > maxLength) {
                    maxLength = usageString.length;
                }
            }

            var fileDescription = TypeScript.getLocalizedText(TypeScript.DiagnosticCode.Insert_command_line_options_and_files_from_a_file, null);
            output.push(["  @<" + fileWord + ">", fileDescription]);

            for (i = 0; i < output.length; i++) {
                this.host.printLine(output[i][0] + (new Array(maxLength - output[i][0].length + 3)).join(" ") + output[i][1]);
            }
        };

        OptionsParser.prototype.printVersion = function () {
            if (!this.printedVersion) {
                this.host.printLine(TypeScript.getLocalizedText(TypeScript.DiagnosticCode.Version_0, [this.version]));
                this.printedVersion = true;
            }
        };

        OptionsParser.prototype.option = function (name, config, short) {
            if (!config) {
                config = short;
                short = null;
            }

            config.name = name;
            config.short = short;
            config.flag = false;

            this.options.push(config);
        };

        OptionsParser.prototype.flag = function (name, config, short) {
            if (!config) {
                config = short;
                short = null;
            }

            config.name = name;
            config.short = short;
            config.flag = true;

            this.options.push(config);
        };

        // Parse an arguments string
        OptionsParser.prototype.parseString = function (argString) {
            var position = 0;
            var tokens = argString.match(/\s+|"|[^\s"]+/g);

            function peek() {
                return tokens[position];
            }

            function consume() {
                return tokens[position++];
            }

            function consumeQuotedString() {
                var value = '';
                consume(); // skip opening quote.

                var token = peek();

                while (token && token !== '"') {
                    consume();

                    value += token;

                    token = peek();
                }

                consume(); // skip ending quote;

                return value;
            }

            var args = [];
            var currentArg = '';

            while (position < tokens.length) {
                var token = peek();

                if (token === '"') {
                    currentArg += consumeQuotedString();
                } else if (token.match(/\s/)) {
                    if (currentArg.length > 0) {
                        args.push(currentArg);
                        currentArg = '';
                    }

                    consume();
                } else {
                    consume();
                    currentArg += token;
                }
            }

            if (currentArg.length > 0) {
                args.push(currentArg);
            }

            this.parse(args);
        };

        // Parse arguments as they come from the platform: split into arguments.
        OptionsParser.prototype.parse = function (args) {
            var position = 0;

            function consume() {
                return args[position++];
            }

            while (position < args.length) {
                var current = consume();
                var match = current.match(/^(--?|@)(.*)/);
                var value = null;

                if (match) {
                    if (match[1] === '@') {
                        this.parseString(this.host.readFile(match[2], null).contents);
                    } else {
                        var arg = match[2];
                        var option = this.findOption(arg);

                        if (option === null) {
                            this.host.printLine(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Unknown_option_0, [arg]));
                            this.host.printLine(TypeScript.getLocalizedText(TypeScript.DiagnosticCode.Use_the_0_flag_to_see_options, ["--help"]));
                        } else {
                            if (!option.flag) {
                                value = consume();
                                if (value === undefined) {
                                    // No value provided
                                    this.host.printLine(TypeScript.getDiagnosticMessage(TypeScript.DiagnosticCode.Option_0_specified_without_1, [arg, TypeScript.getLocalizedText(option.type, null)]));
                                    this.host.printLine(TypeScript.getLocalizedText(TypeScript.DiagnosticCode.Use_the_0_flag_to_see_options, ["--help"]));
                                    continue;
                                }
                            }

                            option.set(value);
                        }
                    }
                } else {
                    this.unnamed.push(current);
                }
            }
        };
        return OptionsParser;
    })();
    TypeScript.OptionsParser = OptionsParser;
})(TypeScript || (TypeScript = {}));
module.exports = TypeDoc;
