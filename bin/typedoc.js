/// <reference path="../lib/typescript/typescript.d.ts" />
/// <reference path="../lib/node/node.d.ts" />

var Handlebars = require('handlebars');
var Marked = require('marked');
var HighlightJS = require('highlight.js');
var VM = require('vm');
var Path = require('path');
var FS = require('fs.extra');

var dirname = Path.dirname(require.resolve('typescript'));
var file = Path.resolve(dirname, 'typescript.js');
if (!file) {
    process.stderr.write('Could not find ´typescript.js´. Please install typescript, e.g. \'npm install typescript\'.\n');
    process.exit();
}

eval(FS.readFileSync(file, 'utf-8'));

TypeScript.typescriptPath = dirname;
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
/// <reference path="bootstrap.ts" />
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
                    return process.mainModule.filename;
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
/// <reference path="bootstrap.ts" />
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
            var tscSyntax = "tsd [" + optionsWord + "] [" + fileWord + " ..]";
            var syntaxHelp = TypeScript.getLocalizedText(TypeScript.DiagnosticCode.Syntax_0, [tscSyntax]);
            this.host.printLine(syntaxHelp);
            this.host.printLine("");
            this.host.printLine(TypeScript.getLocalizedText(TypeScript.DiagnosticCode.Examples, null) + " tsd --out ../doc/ hello.ts");
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
/// <reference path="bootstrap.ts" />
/// <reference path='io.ts'/>
/// <reference path='optionsParser.ts'/>
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

            this.alterOptionsParser(opts);
            opts.parse(this.ioHost.arguments);

            this.compilationSettings = TypeScript.ImmutableCompilationSettings.fromCompilationSettings(mutableSettings);

            if (locale) {
                if (!this.setLocale(locale)) {
                    return false;
                }
            }

            this.inputFiles.push.apply(this.inputFiles, opts.unnamed);
            needsHelp = this.postOptionsParse() || needsHelp;

            if (shouldPrintVersionOnly) {
                opts.printVersion();
                return false;
            } else if (this.inputFiles.length === 0 || needsHelp) {
                opts.printUsage();
                return false;
            }

            return !this.hasErrors;
        };

        BatchCompiler.prototype.alterOptionsParser = function (opts) {
        };
        BatchCompiler.prototype.postOptionsParse = function () {
            return false;
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
    var Event = (function () {
        function Event() {
        }
        Event.prototype.stopPropagation = function () {
            this.isPropagationStopped = true;
        };

        Event.prototype.preventDefault = function () {
            this.isDefaultPrevented = true;
        };
        return Event;
    })();
    TypeDoc.Event = Event;

    var EventDispatcher = (function () {
        function EventDispatcher() {
        }
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

        EventDispatcher.prototype.off = function (event, handler, scope) {
            if (typeof event === "undefined") { event = null; }
            if (typeof handler === "undefined") { handler = null; }
            if (typeof scope === "undefined") { scope = null; }
            if (!this.listeners)
                return;
            if (!event || !handler || !scope) {
                this.listeners = null;
            } else {
                function offEvent(event) {
                    if (!this.listeners[event])
                        return;
                    var listeners = this.listeners[event];
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
                        delete this.listeners[event];
                    }
                }

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
/// <reference path="typescript/tsc.ts" />
/// <reference path="typedoc/utils/EventDispatcher.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeDoc;
(function (TypeDoc) {
    var Application = (function (_super) {
        __extends(Application, _super);
        function Application() {
            _super.call(this, TypeScript.IO);
            this.project = new TypeDoc.Models.ProjectReflection();
            this.renderer = new TypeDoc.Renderer.Renderer(this);
        }
        Application.prototype.runFromCLI = function () {
            if (this.parseOptions()) {
                this.batchCompile();
                this.renderer.render();
            }
            // this.ioHost.quit(this.hasErrors ? 1 : 0);
        };

        Application.prototype.alterOptionsParser = function (opts) {
            var _this = this;
            var options = [];
            var invalidOptions = { out: true, outDir: true, sourcemap: true, sourceRoot: true, declaration: true, watch: true, removeComments: true };
            opts.options.forEach(function (opt) {
                if (opt.name in invalidOptions)
                    return;
                options.push(opt);
            });
            opts.options = options;

            opts.option('out', {
                usage: {
                    locCode: 'Specifies the location the documentation should be written to.',
                    args: null
                },
                type: TypeScript.DiagnosticCode.DIRECTORY,
                set: function (str) {
                    _this.renderer.dirName = _this.resolvePath(str);
                }
            });

            opts.option('name', {
                usage: {
                    locCode: 'Set the name of the project that will be used in the header of the template.',
                    args: null
                },
                set: function (str) {
                    _this.project.name = str;
                }
            });
        };

        Application.prototype.postOptionsParse = function () {
            var _this = this;
            if (!this.renderer.dirName) {
                return true;
            }

            var files = [];
            function add(dirname) {
                FS.readdirSync(dirname).forEach(function (file) {
                    var realpath = TypeScript.IOUtils.combine(dirname, file);
                    if (FS.statSync(realpath).isDirectory()) {
                        add(realpath);
                    } else if (/\.ts$/.test(realpath)) {
                        files.push(realpath);
                    }
                });
            }

            this.inputFiles.forEach(function (file) {
                file = _this.resolvePath(file);
                if (FS.statSync(file).isDirectory()) {
                    add(file);
                } else {
                    files.push(file);
                }
            });

            this.inputFiles = files;
            return false;
        };

        Application.prototype.compile = function () {
            var _this = this;
            var compiler = new TypeScript.TypeScriptCompiler(this.logger, this.compilationSettings);
            var dispatcher = new TypeDoc.Factories.Dispatcher(this.project, this);

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

            compiler.fileNames().forEach(function (fileName) {
                dispatcher.attachDocument(compiler.getDocument(fileName));
            });

            dispatcher.resolve();
        };

        Application.prototype.getDefaultLibraryFilePath = function () {
            return this.resolvePath(TypeScript.IOUtils.combine(TypeScript.typescriptPath, "lib.d.ts"));
        };
        return Application;
    })(TypeScript.BatchCompiler);
    TypeDoc.Application = Application;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        var BasePath = (function () {
            function BasePath() {
            }
            BasePath.prototype.add = function (fileName) {
                var dirname = BasePath.normalize(Path.dirname(fileName));
                if (this.basePath) {
                    var len = this.basePath.length;
                    while (len > dirname.length || this.basePath != dirname.substr(0, len)) {
                        var basePath = BasePath.normalize(Path.resolve(Path.join(this.basePath, '..')));
                        if (this.basePath == basePath)
                            break;
                        this.basePath = basePath;
                        len = this.basePath.length;
                    }
                } else {
                    this.basePath = dirname;
                }
            };

            BasePath.prototype.trim = function (fileName) {
                return fileName.substr(this.basePath.length + 1);
            };

            BasePath.normalize = function (path) {
                path = path.replace(/\\/g, '/');
                path = path.replace(/^["']+|["']+$/g, '');
                path = path.replace(/^([^\:]+)\:\//, function (m, m1) {
                    return m1.toUpperCase() + ':/';
                });
                return path;
            };
            return BasePath;
        })();
        Factories.BasePath = BasePath;
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * Create a type instance for the given symbol.
        *
        * @param symbol  The TypeScript symbol the type should point to.
        */
        function createType(symbol) {
            if (symbol instanceof TypeScript.PullStringConstantTypeSymbol) {
                return new TypeDoc.Models.StringConstantType(symbol.name);
            } else if (symbol instanceof TypeScript.PullPrimitiveTypeSymbol) {
                return new TypeDoc.Models.NamedType(symbol.getDisplayName());
            }

            return new TypeDoc.Models.LateResolvingType(symbol);
            /*
            if (symbol instanceof TypeScript.PullErrorTypeSymbol)
            if (symbol instanceof TypeScript.PullTypeAliasSymbol)
            if (symbol instanceof TypeScript.PullTypeParameterSymbol)
            if (symbol instanceof TypeScript.PullTypeSymbol)
            */
        }
        Factories.createType = createType;

        /**
        * The central dispatcher receives documents from the compiler and emits
        * events for all discovered declarations.
        *
        * Factories should listen to the events emitted by the dispatcher. Each event
        * contains a state object describing the current state the dispatcher is in. Factories
        * can alter the state or stop it from being further processed.
        *
        * While the compiler is active, it passes documents to the dispatcher. Each document
        * will create an ´enterDocument´ event. By stopping the generated state, factories can
        * prevent entire documents from being processed.
        *
        * The dispatcher will iterate over all declarations and its children in the document
        * and yields a child state for them. For each of this states an ´enterDeclaration´ event
        * will be emitted. By stopping the child state, factories can prevent declarations from
        * being processed.
        *
        * - enterDocument
        *   - enterDeclaration
        *   - mergeReflection / createReflection
        *   - process
        *   - **Recursion**
        */
        var Dispatcher = (function (_super) {
            __extends(Dispatcher, _super);
            /**
            * Create a new Dispatcher instance.
            *
            * @param project  The target project instance.
            */
            function Dispatcher(project, compiler) {
                var _this = this;
                _super.call(this);
                this.idMap = {};
                this.snapshots = {};
                this.project = project;
                this.compiler = compiler;

                Dispatcher.FACTORIES.forEach(function (factory) {
                    new factory(_this);
                });
            }
            /**
            * Return the snapshot of the given filename.
            *
            * @param fileName  The filename of the snapshot.
            */
            Dispatcher.prototype.getSnapshot = function (fileName) {
                var _this = this;
                if (!this.snapshots[fileName]) {
                    var snapshot;
                    var lineMap;

                    this.snapshots[fileName] = {
                        getText: function (start, end) {
                            if (!snapshot)
                                snapshot = _this.compiler.getScriptSnapshot(fileName);
                            return snapshot.getText(start, end);
                        },
                        getLineNumber: function (position) {
                            if (!snapshot)
                                snapshot = _this.compiler.getScriptSnapshot(fileName);
                            if (!lineMap)
                                lineMap = TypeScript.LineMap1.fromScriptSnapshot(snapshot);
                            return lineMap.getLineNumberFromPosition(position);
                        }
                    };
                }

                return this.snapshots[fileName];
            };

            /**
            * Process the given state.
            *
            * @param state  The state that should be processed.
            */
            Dispatcher.prototype.processState = function (state) {
                var _this = this;
                this.dispatch('enterDeclaration', state);
                if (state.isDefaultPrevented)
                    return;

                this.ensureReflection(state);
                this.dispatch('process', state);
                if (state.isDefaultPrevented)
                    return;

                state.declaration.getChildDecls().forEach(function (declaration) {
                    _this.processState(state.createChildState(declaration));
                });

                this.dispatch('leaveDeclaration', state);
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
                    this.dispatch('mergeReflection', state);
                    return false;
                }

                var parent = state.parentState.reflection;
                var reflection = new TypeDoc.Models.DeclarationReflection();
                reflection.name = (state.flattenedName ? state.flattenedName + '.' : '') + state.getName();
                reflection.parent = parent;

                state.reflection = reflection;
                if (state.isSignature) {
                    if (!parent.signatures)
                        parent.signatures = [];
                    parent.signatures.push(reflection);
                } else {
                    parent.children.push(reflection);
                }

                this.project.reflections.push(reflection);
                if (!state.isInherited) {
                    var declID = state.declaration.declID;
                    this.idMap[declID] = reflection;
                }

                this.dispatch('createReflection', state);
                return true;
            };

            /**
            * Attach the given document to the project.
            *
            * This method is called by the compiler for each compiled document.
            *
            * @param document  The TypeScript document that should be processed by the dispatcher.
            */
            Dispatcher.prototype.attachDocument = function (document) {
                var _this = this;
                var state = new Factories.DocumentState(this, document);
                this.dispatch('enterDocument', state);
                if (state.isDefaultPrevented)
                    return;

                state.declaration.getChildDecls().forEach(function (declaration) {
                    _this.processState(state.createChildState(declaration));
                });

                this.dispatch('leaveDocument', state);
            };

            Dispatcher.prototype.resolve = function () {
                var _this = this;
                this.dispatch('enterResolve');

                this.project.reflections.forEach(function (reflection) {
                    _this.dispatch('resolveReflection', reflection);
                });

                this.dispatch('leaveResolve');
            };
            Dispatcher.FACTORIES = [];
            return Dispatcher;
        })(TypeDoc.EventDispatcher);
        Factories.Dispatcher = Dispatcher;
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        var CommentHandler = (function () {
            function CommentHandler(dispatcher) {
                dispatcher.on('process', this.onProcess, this);
                dispatcher.on('resolveReflection', this.onResolveReflection, this);
            }
            CommentHandler.prototype.onProcess = function (state) {
                var isInherit = false;
                if (state.isInherited) {
                    isInherit = state.reflection.comment && state.reflection.comment.hasTag('inherit');
                }

                if (!state.reflection.comment || isInherit) {
                    CommentHandler.applyComments(state);
                }
            };

            CommentHandler.prototype.onResolveReflection = function (reflection) {
                if (reflection.signatures) {
                    CommentHandler.postProcessSignatures(reflection);
                }

                CommentHandler.removeCommentTags(reflection.comment, 'param');
                CommentHandler.removeCommentTags(reflection.comment, 'returns');
            };

            CommentHandler.postProcessSignatures = function (reflection) {
                if (reflection.comment && reflection.comment.hasTag('returns')) {
                    reflection.comment.returns = reflection.comment.getTag('returns').text;
                }

                reflection.signatures.forEach(function (signature) {
                    if (reflection.comment) {
                        if (!signature.comment)
                            signature.comment = new TypeDoc.Models.Comment();

                        if (!signature.comment.shortText)
                            signature.comment.shortText = reflection.comment.shortText;

                        if (!signature.comment.text)
                            signature.comment.text = reflection.comment.text;

                        if (signature.comment.hasTag('returns')) {
                            signature.comment.returns = signature.comment.getTag('returns').text;
                        } else {
                            signature.comment.returns = reflection.comment.returns;
                        }
                    }

                    signature.children.forEach(function (parameter) {
                        var tag;
                        if (signature.comment)
                            tag = signature.comment.getTag('param', parameter.name);

                        if (reflection.comment && !tag)
                            tag = reflection.comment.getTag('param', parameter.name);

                        if (tag)
                            parameter.comment = new TypeDoc.Models.Comment(tag.text);
                    });
                });
            };

            CommentHandler.findComments = function (state) {
                var decl = state.declaration;
                var ast = decl.ast();
                var result = [];

                if (ast.kind() == 225 /* VariableDeclarator */) {
                    var list = ast.parent;
                    if (list.kind() != 2 /* SeparatedList */) {
                        return result;
                    }

                    var dispatcher = state.getDocumentState().dispatcher;
                    var snapshot = dispatcher.getSnapshot(ast.fileName());
                    var astSource = snapshot.getText(ast.start(), ast.end());
                    var listSource = snapshot.getText(list.start(), list.end());
                    if (astSource != listSource) {
                        return result;
                    }

                    ast = list.parent.parent;
                }

                var comments = ast.preComments();
                if (!comments || comments.length == 0) {
                    return result;
                }

                comments.forEach(function (comment) {
                    if (!CommentHandler.isDocComment(comment))
                        return;
                    result.push(comment.fullText());
                });

                return result;
            };

            CommentHandler.applyComments = function (state) {
                CommentHandler.findComments(state).forEach(function (comment) {
                    state.reflection.comment = CommentHandler.parseDocComment(comment);
                });
            };

            CommentHandler.isDocComment = function (comment) {
                if (comment.kind() === 6 /* MultiLineCommentTrivia */) {
                    var fullText = comment.fullText();
                    return fullText.charAt(2) === "*" && fullText.charAt(3) !== "/";
                }

                return false;
            };

            CommentHandler.removeCommentTags = function (comment, tagName) {
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
                var lines = text.split(/\r\n/);
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
        })();
        Factories.CommentHandler = CommentHandler;

        Factories.Dispatcher.FACTORIES.push(CommentHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        var DynamicModuleHandler = (function () {
            function DynamicModuleHandler(dispatcher) {
                this.basePath = new Factories.BasePath();
                dispatcher.on('process', this.onProcess, this);
                dispatcher.on('resolveReflection', this.onResolveReflection, this);
            }
            DynamicModuleHandler.prototype.onProcess = function (state) {
                if (!state.kindOf(TypeDoc.Models.Kind.DynamicModule)) {
                    return;
                }

                var name = state.declaration.name;
                name = name.replace(/"/g, '');
                state.reflection.name = name.substr(0, name.length - Path.extname(name).length);
                this.basePath.add(name);
            };

            DynamicModuleHandler.prototype.onResolveReflection = function (reflection) {
                if (!reflection.kindOf(TypeDoc.Models.Kind.DynamicModule)) {
                    return;
                }

                reflection.name = this.basePath.trim(reflection.name);
            };
            return DynamicModuleHandler;
        })();
        Factories.DynamicModuleHandler = DynamicModuleHandler;

        Factories.Dispatcher.FACTORIES.push(DynamicModuleHandler);
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
        var GroupHandler = (function () {
            /**
            * Create a new GroupHandler instance.
            *
            * Handlers are created automatically if they are registered in the static Dispatcher.FACTORIES array.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function GroupHandler(dispatcher) {
                this.dispatcher = dispatcher;
                dispatcher.on('leaveResolve', this.onLeaveResolve, this);
            }
            /**
            * Triggered once after all documents have been read and the dispatcher
            * leaves the resolving phase.
            */
            GroupHandler.prototype.onLeaveResolve = function () {
                function walkDirectory(directory) {
                    directory.groups = GroupHandler.getReflectionGroups(directory.getAllReflections());

                    for (var key in directory.directories) {
                        if (!directory.directories.hasOwnProperty(key))
                            continue;
                        walkDirectory(directory.directories[key]);
                    }
                }

                var project = this.dispatcher.project;
                if (project.children && project.children.length > 0) {
                    project.children.sort(GroupHandler.sortCallback);
                    project.groups = GroupHandler.getReflectionGroups(project.children);
                }

                project.reflections.forEach(function (reflection) {
                    if (reflection.kindOf(TypeDoc.Models.Kind.SomeSignature))
                        return;
                    if (!reflection.children || reflection.children.length == 0)
                        return;

                    reflection.children.sort(GroupHandler.sortCallback);
                    reflection.kindString = GroupHandler.getKindSingular(reflection.kind);
                    reflection.groups = GroupHandler.getReflectionGroups(reflection.children);
                });

                walkDirectory(this.dispatcher.project.directory);
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
                    var allExported = true, allInherited = true, allPrivate = true;
                    group.children.forEach(function (child) {
                        allExported = child.isExported && allExported;
                        allInherited = child.inheritedFrom && allInherited;
                        allPrivate = child.isPrivate && allPrivate;
                    });

                    group.allChildrenAreExported = allExported;
                    group.allChildrenAreInherited = allInherited;
                    group.allChildrenArePrivate = allPrivate;
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
                TypeScript.PullElementKind.EnumMember,
                TypeScript.PullElementKind.ConstructorMethod,
                TypeScript.PullElementKind.Property,
                TypeScript.PullElementKind.GetAccessor,
                TypeScript.PullElementKind.SetAccessor,
                TypeScript.PullElementKind.Method,
                TypeScript.PullElementKind.Function
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
        })();
        Factories.GroupHandler = GroupHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.FACTORIES.push(GroupHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        var InheritanceHandler = (function () {
            function InheritanceHandler(dispatcher) {
                this.dispatcher = dispatcher;
                dispatcher.on('mergeReflection', this.onMergeReflection, this);
                dispatcher.on('createReflection', this.onCreateReflection, this);
                dispatcher.on('enterDeclaration', this.onEnterDeclaration, this, 1024);
                dispatcher.on('leaveDeclaration', this.onLeaveDeclaration, this);
            }
            InheritanceHandler.prototype.onMergeReflection = function (state) {
                if (state.isInherited && state.reflection && !state.reflection.inheritedFrom && !state.kindOf([TypeDoc.Models.Kind.Class, TypeDoc.Models.Kind.Interface])) {
                    state.reflection.overwrites = new TypeDoc.Models.LateResolvingType(state.declaration);
                    state.preventDefault();
                }
            };

            InheritanceHandler.prototype.onCreateReflection = function (state) {
                if (!state.isInherited)
                    return;
                state.reflection.inheritedFrom = new TypeDoc.Models.LateResolvingType(state.declaration);
            };

            InheritanceHandler.prototype.onEnterDeclaration = function (state) {
                if (state.isInherited && (state.hasFlag(TypeScript.PullElementFlags.Private) || state.hasFlag(TypeScript.PullElementFlags.Static))) {
                    state.preventDefault();
                    state.stopPropagation();
                }
            };

            InheritanceHandler.prototype.onLeaveDeclaration = function (state) {
                var _this = this;
                var symbol = state.declaration.getSymbol();
                if (!(symbol instanceof TypeScript.PullTypeSymbol)) {
                    return;
                }

                if (!state.isInherited) {
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
                }

                symbol.getExtendedTypes().forEach(function (symbol) {
                    symbol.getDeclarations().forEach(function (declaration) {
                        _this.dispatcher.processState(state.createInheritanceState(declaration));
                    });
                });
            };
            return InheritanceHandler;
        })();
        Factories.InheritanceHandler = InheritanceHandler;

        Factories.Dispatcher.FACTORIES.push(InheritanceHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A factory that filters declarations that should be ignored and prevents
        * the creation of reflections for them.
        *
        * TypeDoc currently ignores all type aliases, object literals, object types and
        * implicit variables. Furthermore declaration files are ignored.
        */
        var NullHandler = (function () {
            function NullHandler(dispatcher) {
                dispatcher.on('enterDocument', this.onEnterDocument, this, 1024);
                dispatcher.on('enterDeclaration', this.onEnterDeclaration, this, 1024);
            }
            NullHandler.prototype.onEnterDocument = function (state) {
                // Ignore declare files
                if (state.document.isDeclareFile()) {
                    state.stopPropagation();
                    state.preventDefault();
                }
            };

            NullHandler.prototype.onEnterDeclaration = function (state) {
                // Ignore all type aliases, object literals and types
                if (state.kindOf([TypeDoc.Models.Kind.ObjectLiteral, TypeDoc.Models.Kind.ObjectType, TypeDoc.Models.Kind.TypeAlias, TypeDoc.Models.Kind.FunctionType, TypeDoc.Models.Kind.FunctionExpression])) {
                    state.stopPropagation();
                    state.preventDefault();
                }

                // Ignore all implicit variables
                if (state.kindOf(TypeDoc.Models.Kind.Variable) && state.hasFlag(TypeDoc.Models.Flags.ImplicitVariable)) {
                    state.stopPropagation();
                    state.preventDefault();
                }
            };
            return NullHandler;
        })();
        Factories.NullHandler = NullHandler;

        Factories.Dispatcher.FACTORIES.push(NullHandler);
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
        var PackageHandler = (function () {
            /**
            * Create a new PackageHandler instance.
            *
            * Handlers are created automatically if they are registered in the static Dispatcher.FACTORIES array.
            *
            * @param dispatcher  The dispatcher this handler should be attached to.
            */
            function PackageHandler(dispatcher) {
                this.dispatcher = dispatcher;
                /**
                * List of directories the handler already inspected.
                */
                this.visited = [];
                dispatcher.on('enterDocument', this.onEnterDocument, this);
                dispatcher.on('enterResolve', this.onEnterResolve, this);
            }
            /**
            * Triggered when the dispatcher begins processing a typescript document.
            *
            * @param state  The state that describes the current declaration and reflection.
            */
            PackageHandler.prototype.onEnterDocument = function (state) {
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
                        if (!_this.readmeFile && lfile == 'readme.md') {
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
            * Triggered once after all documents have been read and the dispatcher
            * enters the resolving phase.
            */
            PackageHandler.prototype.onEnterResolve = function () {
                var project = this.dispatcher.project;

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
        })();
        Factories.PackageHandler = PackageHandler;

        /**
        * Register this handler.
        */
        Factories.Dispatcher.FACTORIES.push(PackageHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A factory that copies basic values from declarations to reflections.
        *
        * This factory sets the following values on reflection models:
        *  - flags
        *  - kind
        *  - type
        *  - definition
        *  - isOptional
        *  - defaultValue
        */
        var ReflectionHandler = (function () {
            function ReflectionHandler(dispatcher) {
                this.dispatcher = dispatcher;
                dispatcher.on('createReflection', this.onCreateReflection, this);
                dispatcher.on('mergeReflection', this.onMergeReflection, this);
                dispatcher.on('resolveReflection', this.onResolveReflection, this);
            }
            ReflectionHandler.prototype.onCreateReflection = function (state) {
                var _this = this;
                state.reflection.flags = state.declaration.flags;
                state.reflection.kind = state.declaration.kind;

                var symbol = state.declaration.getSymbol();
                if (symbol) {
                    state.reflection.type = Factories.createType(symbol.type);
                    state.reflection.definition = symbol.toString();
                    state.reflection.isOptional = symbol.isOptional;

                    if (symbol.type.kind == TypeDoc.Models.Kind.ObjectType || symbol.type.kind == TypeDoc.Models.Kind.ObjectLiteral) {
                        var typeDeclaration = symbol.type.getDeclarations()[0];
                        typeDeclaration.getChildDecls().forEach(function (declaration) {
                            var typeState = state.createChildState(declaration);
                            typeState.isFlattened = true;
                            typeState.flattenedName = state.getName();
                            _this.dispatcher.processState(typeState);
                        });
                    }

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

            ReflectionHandler.prototype.onMergeReflection = function (state) {
                if (state.declaration.kind != TypeDoc.Models.Kind.Container) {
                    state.reflection.kind = state.declaration.kind;
                }
            };

            /**
            * Triggered by the dispatcher for each reflection in the resolving phase.
            *
            * @param reflection  The final generated reflection.
            */
            ReflectionHandler.prototype.onResolveReflection = function (reflection) {
                var flagsArray = [];
                var flags = reflection.kindOf(TypeDoc.Models.Kind.Parameter) ? ReflectionHandler.RELEVANT_PARAMETER_FLAGS : ReflectionHandler.RELEVANT_FLAGS;
                flags.forEach(function (key) {
                    if ((reflection.flags & key) == key) {
                        flagsArray.push(TypeScript.PullElementFlags[key].toLowerCase());
                    }
                });

                var isExported = false, target = reflection;
                if (target.kindOf(TypeDoc.Models.Kind.SomeContainer))
                    isExported = true;
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
            ReflectionHandler.RELEVANT_FLAGS = [
                TypeScript.PullElementFlags.Optional,
                TypeScript.PullElementFlags.Public,
                TypeScript.PullElementFlags.Private,
                TypeScript.PullElementFlags.Static
            ];

            ReflectionHandler.RELEVANT_PARAMETER_FLAGS = [
                TypeScript.PullElementFlags.Optional
            ];
            return ReflectionHandler;
        })();
        Factories.ReflectionHandler = ReflectionHandler;

        Factories.Dispatcher.FACTORIES.push(ReflectionHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A factory that creates signature reflections.
        */
        var ResolveHandler = (function () {
            function ResolveHandler(dispatcher) {
                this.dispatcher = dispatcher;
                dispatcher.on('enterDeclaration', this.onEnterDeclaration, this, 1024);
            }
            ResolveHandler.prototype.onEnterDeclaration = function (state) {
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
        })();
        Factories.ResolveHandler = ResolveHandler;

        Factories.Dispatcher.FACTORIES.push(ResolveHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A factory that creates signature reflections.
        */
        var SignatureHandler = (function () {
            function SignatureHandler(dispatcher) {
                this.dispatcher = dispatcher;
                dispatcher.on('enterDeclaration', this.onEnterDeclaration, this, 512);
                dispatcher.on('process', this.onProcess, this);
            }
            SignatureHandler.prototype.onEnterDeclaration = function (state) {
                // Ignore everything except parameters in functions
                if (state.parentState.isSignature && !state.kindOf(TypeDoc.Models.Kind.Parameter)) {
                    state.preventDefault();
                    return;
                }

                if (state.kindOf([TypeDoc.Models.Kind.SomeFunction, TypeDoc.Models.Kind.SomeSignature]) && !(state.isSignature)) {
                    // Ignore inherited overwritten methods
                    if (SignatureHandler.isMethodOverwrite(state)) {
                        var type = new TypeDoc.Models.LateResolvingType(state.declaration);
                        state.reflection.overwrites = type;
                        state.reflection.signatures.forEach(function (signature) {
                            return signature.overwrites = type;
                        });
                        state.preventDefault();
                        return;
                    }

                    this.dispatcher.ensureReflection(state);
                    state.reflection.kind = state.declaration.kind;

                    var hasSignatures = (state.reflection.signatures && state.reflection.signatures.length > 0);
                    var isAccessor = state.kindOf([TypeDoc.Models.Kind.GetAccessor, TypeDoc.Models.Kind.SetAccessor]);
                    if (state.hasFlag(TypeDoc.Models.Flags.Signature) || !hasSignatures || isAccessor) {
                        var signature = state.createSignatureState();
                        this.dispatcher.ensureReflection(signature);

                        signature.reflection.inheritedFrom = state.reflection.inheritedFrom;
                        signature.reflection.overwrites = state.reflection.overwrites;

                        this.dispatcher.processState(signature);
                    }

                    // Move to signature
                    if (state.hasFlag(TypeDoc.Models.Flags.Signature)) {
                        state.preventDefault();
                    }
                }
            };

            SignatureHandler.prototype.onProcess = function (state) {
                if (!state.kindOf(TypeDoc.Models.Kind.SomeFunction)) {
                    return;
                }

                if (state.isSignature) {
                    var symbol = state.declaration.getSignatureSymbol();
                    if (symbol.returnType.name != 'void') {
                        state.reflection.type = Factories.createType(symbol.returnType);
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

            SignatureHandler.isMethodOverwrite = function (state) {
                if (!state.reflection)
                    return false;
                if (!state.isInherited)
                    return false;
                if (!(state.reflection.inheritedFrom instanceof TypeDoc.Models.LateResolvingType))
                    return true;

                var type = state.reflection.inheritedFrom;
                return type.declaration.getParentDecl() != state.declaration.parentDecl;
            };
            return SignatureHandler;
        })();
        Factories.SignatureHandler = SignatureHandler;

        Factories.Dispatcher.FACTORIES.push(SignatureHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        var SourceHandler = (function () {
            function SourceHandler(dispatcher) {
                this.dispatcher = dispatcher;
                this.basePath = new Factories.BasePath();
                this.fileMappings = {};
                dispatcher.on('process', this.onProcess, this);
                dispatcher.on('enterDocument', this.onEnterDocument, this);
                dispatcher.on('enterResolve', this.onEnterResolve, this);
                dispatcher.on('resolveReflection', this.onResolveReflection, this);
                dispatcher.on('leaveResolve', this.onLeaveResolve, this, 512);
            }
            SourceHandler.prototype.onEnterDocument = function (state) {
                var fileName = state.document.fileName;
                this.basePath.add(fileName);

                var file = new TypeDoc.Models.SourceFile(fileName);
                this.fileMappings[fileName] = file;
                this.dispatcher.project.files.push(file);
            };

            SourceHandler.prototype.onProcess = function (state) {
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
                    fileName: fileName,
                    line: snapshot.getLineNumber(ast.start())
                });
            };

            SourceHandler.prototype.onEnterResolve = function () {
                var _this = this;
                this.dispatcher.project.files.forEach(function (file) {
                    var fileName = file.fileName = _this.basePath.trim(file.fileName);
                    _this.fileMappings[fileName] = file;
                });
            };

            SourceHandler.prototype.onResolveReflection = function (reflection) {
                var _this = this;
                reflection.sources.forEach(function (source) {
                    source.fileName = _this.basePath.trim(source.fileName);
                });
            };

            SourceHandler.prototype.onLeaveResolve = function () {
                var home = this.dispatcher.project.directory;
                this.dispatcher.project.files.forEach(function (file) {
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
        })();
        Factories.SourceHandler = SourceHandler;

        Factories.Dispatcher.FACTORIES.push(SourceHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * A factory that converts all instances of LateResolvingType to their renderable equivalents.
        */
        var TypeHandler = (function () {
            function TypeHandler(dispatcher) {
                this.dispatcher = dispatcher;
                dispatcher.on('resolveReflection', this.onResolveReflection, this);
            }
            TypeHandler.prototype.onResolveReflection = function (reflection) {
                reflection.type = this.resolveType(reflection.type);
                reflection.inheritedFrom = this.resolveType(reflection.inheritedFrom);
                reflection.overwrites = this.resolveType(reflection.overwrites);
                reflection.extendedTypes = this.resolveTypes(reflection.extendedTypes);
                reflection.extendedBy = this.resolveTypes(reflection.extendedBy);
                reflection.typeHierarchy = TypeHandler.buildTypeHierarchy(reflection);
            };

            TypeHandler.prototype.resolveTypes = function (types) {
                if (!types)
                    return types;
                for (var i = 0, c = types.length; i < c; i++) {
                    types[i] = this.resolveType(types[i]);
                }
                return types;
            };

            TypeHandler.prototype.resolveType = function (type) {
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
                var reflection = this.dispatcher.idMap[declID];
                if (reflection) {
                    if (reflection.kindOf(TypeDoc.Models.Kind.SomeSignature)) {
                        reflection = reflection.parent;
                    }
                    return new TypeDoc.Models.ReflectionType(reflection, isArray);
                } else {
                    if (symbol.fullName() == '') {
                        return new TypeDoc.Models.NamedType(symbol.toString());
                    } else {
                        return new TypeDoc.Models.NamedType(symbol.fullName());
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
                if (!reflection.extendedTypes && !reflection.extendedBy)
                    return null;
                var root = null;
                var item;
                var hierarchy;

                function push(item) {
                    if (hierarchy) {
                        hierarchy.children = [item];
                        hierarchy = item;
                    } else {
                        root = hierarchy = item;
                    }
                }

                if (reflection.extendedTypes) {
                    reflection.extendedTypes.forEach(function (type) {
                        push({ type: type });
                    });
                }

                item = { type: new TypeDoc.Models.ReflectionType(reflection, false), isTarget: true };
                push(item);

                if (reflection.extendedBy) {
                    item.children = [];
                    reflection.extendedBy.forEach(function (type) {
                        item.children.push({ type: type });
                    });
                }

                return root;
            };
            return TypeHandler;
        })();
        Factories.TypeHandler = TypeHandler;

        Factories.Dispatcher.FACTORIES.push(TypeHandler);
    })(TypeDoc.Factories || (TypeDoc.Factories = {}));
    var Factories = TypeDoc.Factories;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Factories) {
        /**
        * Base class of all states.
        *
        * States store the current declaration and its matching reflection while
        * being processed by the dispatcher. Factories can alter the state and
        * stop it from being further processed.
        * For each child declaration the dispatcher will create a child {DeclarationState}
        * state. The root state is always an instance of {DocumentState}.
        */
        var BaseState = (function (_super) {
            __extends(BaseState, _super);
            /**
            * Create a new BaseState instance.
            */
            function BaseState(parentState, declaration, reflection) {
                _super.call(this);

                this.parentState = parentState;
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
            BaseState.prototype.kindOf = function (kind) {
                if (Array.isArray(kind)) {
                    for (var i = 0, c = kind.length; i < c; i++) {
                        if ((this.declaration.kind & kind[i]) !== 0) {
                            return true;
                        }
                    }
                    return false;
                } else {
                    return (this.declaration.kind & kind) !== 0;
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
                return this.getDocumentState().dispatcher.getSnapshot(fileName);
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

                var reflection = this.reflection.getChildByName(BaseState.getName(declaration));
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
        })(TypeDoc.Event);
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
                    state.parentState = this.parentState;
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
            * @param dispatcher  The dispatcher that has created this state.
            * @param document    The TypeScript document that contains the declarations.
            */
            function DocumentState(dispatcher, document) {
                _super.call(this, null, document.topLevelDecl(), dispatcher.project);

                this.dispatcher = dispatcher;
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
    (function (Models) {
        var Comment = (function () {
            function Comment(shortText, text) {
                this.shortText = shortText || '';
                this.text = text || '';
            }
            Comment.prototype.hasTag = function (tag) {
                if (!this.tags)
                    return false;
                for (var i = 0, c = this.tags.length; i < c; i++) {
                    if (this.tags[i].tagName == tag) {
                        return true;
                    }
                }
                return false;
            };

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
        var CommentTag = (function () {
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
    (function (Models) {
        /**
        * Base class for all reflection classes.
        *
        * While generating a documentation, TypeDoc creates an instance of the ProjectReflection
        * as the root for all reflections within the project. All other reflections are represented
        * by the DeclarationReflection class.
        */
        var BaseReflection = (function () {
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
                    return this.parent.getFullName(separator) + separator + this.name;
                } else {
                    return this.name;
                }
            };

            /**
            * Return a child by its name.
            *
            * @param name  The name of the child to look for.
            * @returns     The found child or NULL.
            */
            BaseReflection.prototype.getChildByName = function (name) {
                for (var i = 0, c = this.children.length; i < c; i++) {
                    if (this.children[i].name == name)
                        return this.children[i];
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
                    this.alias = this.name.toLowerCase();
                    this.alias = this.alias.replace(/\/\\:/g, '.');
                    this.alias = this.alias.replace(/[\\\/]/g, '-');
                }

                return this.alias;
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
            function ProjectReflection() {
                _super.apply(this, arguments);
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
        var SourceDirectory = (function () {
            function SourceDirectory(name, parent) {
                this.name = null;
                this.dirName = null;
                this.parent = null;
                this.directories = {};
                this.files = [];
                if (name && parent) {
                    this.name = name;
                    this.dirName = (parent.dirName ? parent.dirName + '/' : '') + name;
                    this.parent = parent;
                }
            }
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
        var SourceFile = (function () {
            function SourceFile(fileName) {
                this.reflections = [];
                this.fileName = fileName;
                this.name = Path.basename(fileName);
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
        var NavigationItem = (function () {
            function NavigationItem(title, url, parent) {
                this.isCurrent = false;
                this.isInPath = false;
                this.isPrimary = false;
                this.title = title || '';
                this.url = url || '';
                this.parent = parent || null;

                if (this.parent) {
                    if (!this.parent.children)
                        this.parent.children = [];
                    this.parent.children.push(this);
                }
            }
            return NavigationItem;
        })();
        Models.NavigationItem = NavigationItem;
    })(TypeDoc.Models || (TypeDoc.Models = {}));
    var Models = TypeDoc.Models;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Models) {
        var RenderOutput = (function (_super) {
            __extends(RenderOutput, _super);
            function RenderOutput(target) {
                _super.call(this);
                this.target = target;
            }
            return RenderOutput;
        })(TypeDoc.Event);
        Models.RenderOutput = RenderOutput;
    })(TypeDoc.Models || (TypeDoc.Models = {}));
    var Models = TypeDoc.Models;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Models) {
        var RenderTarget = (function (_super) {
            __extends(RenderTarget, _super);
            function RenderTarget() {
                _super.apply(this, arguments);
            }
            return RenderTarget;
        })(TypeDoc.Event);
        Models.RenderTarget = RenderTarget;
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
    (function (Renderer) {
        var BasePlugin = (function () {
            function BasePlugin(renderer) {
                this.renderer = renderer;
            }
            return BasePlugin;
        })();
        Renderer.BasePlugin = BasePlugin;
    })(TypeDoc.Renderer || (TypeDoc.Renderer = {}));
    var Renderer = TypeDoc.Renderer;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Renderer) {
        var BaseTheme = (function () {
            function BaseTheme(renderer, project, basePath) {
                this.renderer = renderer;
                this.basePath = basePath;
                this.project = project;

                this.initialize();
            }
            BaseTheme.prototype.initialize = function () {
            };

            BaseTheme.prototype.isOutputDirectory = function (dirname) {
                return false;
            };

            BaseTheme.prototype.getUrls = function () {
                return [];
            };

            BaseTheme.prototype.getNavigation = function () {
                return null;
            };
            return BaseTheme;
        })();
        Renderer.BaseTheme = BaseTheme;
    })(TypeDoc.Renderer || (TypeDoc.Renderer = {}));
    var Renderer = TypeDoc.Renderer;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (_Renderer) {
        var Renderer = (function (_super) {
            __extends(Renderer, _super);
            function Renderer(application) {
                var _this = this;
                _super.call(this);
                this.templates = {};
                this.application = application;
                this.ioHost = application.ioHost;

                this.plugins = [];
                Renderer.PLUGIN_CLASSES.forEach(function (pluginClass) {
                    _this.plugins.push(new pluginClass(_this));
                });

                Marked.setOptions({
                    highlight: function (code) {
                        return HighlightJS.highlightAuto(code).value;
                    }
                });

                Handlebars.registerHelper('compact', function (options) {
                    var lines = options.fn(this).split('\n');
                    for (var i = 0, c = lines.length; i < c; i++) {
                        lines[i] = lines[i].trim().replace(/&nbsp;/, ' ');
                    }
                    return lines.join('');
                });

                Handlebars.registerHelper('markdown', function (options) {
                    return Marked(options.fn(this));
                });
            }
            Renderer.prototype.setTheme = function (dirname) {
                dirname = this.ioHost.resolvePath(dirname);
                if (!this.ioHost.fileExists(dirname)) {
                    throw new Error('Theme directory ´' + dirname + '´ does not exist.');
                }

                var filename = TypeScript.IOUtils.combine(dirname, 'theme.js');
                if (!this.ioHost.fileExists(filename)) {
                    throw new Error('Theme theme.js ´' + filename + '´ does not exist.');
                }

                var themeClass = eval(TypeDoc.readFile(filename));
                this.theme = new themeClass(this, this.application.project, dirname);
            };

            Renderer.prototype.getDefaultTheme = function () {
                var compilerFilePath = this.application.ioHost.getExecutingFilePath();
                var containingDirectoryPath = this.application.ioHost.dirName(compilerFilePath);
                var libraryFilePath = this.application.resolvePath(TypeScript.IOUtils.combine(TypeScript.IOUtils.combine(containingDirectoryPath, 'themes'), 'default'));

                return libraryFilePath;
            };

            Renderer.prototype.getTemplate = function (fileName) {
                if (!this.theme) {
                    throw new Error('Cannot resolve templates before theme is set.');
                }

                if (!this.templates[fileName]) {
                    var absFileName = TypeScript.IOUtils.combine(this.theme.basePath, fileName);
                    absFileName = this.ioHost.resolvePath(absFileName);

                    if (!this.ioHost.fileExists(absFileName)) {
                        throw new Error('Cannot find template ´' + absFileName + '´.');
                    }

                    this.templates[fileName] = Handlebars.compile(TypeDoc.readFile(absFileName));
                }

                return this.templates[fileName];
            };

            Renderer.prototype.render = function () {
                if (!this.theme) {
                    this.setTheme(this.getDefaultTheme());
                }

                if (FS.existsSync(this.dirName)) {
                    if (this.theme.isOutputDirectory(this.dirName)) {
                        FS.rmrfSync(this.dirName);
                        FS.mkdirpSync(this.dirName);
                    }
                } else {
                    FS.mkdirRecursiveSync(this.dirName);
                }

                var target = new TypeDoc.Models.RenderTarget();
                target.dirname = this.dirName;
                target.project = this.application.project;
                target.urls = this.theme.getUrls();

                this.dispatch('beginTarget', target);
                if (target.isDefaultPrevented)
                    return;

                this.renderTarget(target);
                this.dispatch('endTarget', target);
            };

            Renderer.prototype.renderTarget = function (target) {
                var _this = this;
                target.urls.forEach(function (mapping) {
                    var output = new TypeDoc.Models.RenderOutput(target);
                    output.project = target.project;
                    output.url = mapping.url;
                    output.model = mapping.model;
                    output.templateName = mapping.template;
                    output.template = _this.getTemplate(Path.join('templates', mapping.template));
                    output.filename = Path.join(target.dirname, mapping.url);

                    _this.dispatch('beginOutput', output);
                    if (output.isDefaultPrevented || !output.template)
                        return;

                    output.contents = output.template(output);

                    _this.dispatch('endOutput', output);
                    if (output.isDefaultPrevented)
                        return;

                    TypeScript.IOUtils.writeFileAndFolderStructure(_this.application.ioHost, output.filename, output.contents, true);
                });
            };
            Renderer.PLUGIN_CLASSES = [];
            return Renderer;
        })(TypeDoc.EventDispatcher);
        _Renderer.Renderer = Renderer;
    })(TypeDoc.Renderer || (TypeDoc.Renderer = {}));
    var Renderer = TypeDoc.Renderer;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Renderer) {
        var AssetsPlugin = (function (_super) {
            __extends(AssetsPlugin, _super);
            function AssetsPlugin(renderer) {
                var _this = this;
                _super.call(this, renderer);
                renderer.on('beginTarget', function (t) {
                    return _this.onRendererBeginTarget(t);
                });
            }
            AssetsPlugin.prototype.onRendererBeginTarget = function (target) {
                var ready = false;
                var from = TypeScript.IOUtils.combine(this.renderer.theme.basePath, 'assets');
                if (this.renderer.ioHost.fileExists(from)) {
                    var to = Path.join(target.dirname, 'assets');
                    FS.mkdirRecursiveSync(to);
                    FS.copyRecursive(from, to, function (e) {
                        console.log('finished!');
                    });
                }
            };
            return AssetsPlugin;
        })(Renderer.BasePlugin);
        Renderer.AssetsPlugin = AssetsPlugin;

        Renderer.Renderer.PLUGIN_CLASSES.push(AssetsPlugin);
    })(TypeDoc.Renderer || (TypeDoc.Renderer = {}));
    var Renderer = TypeDoc.Renderer;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Renderer) {
        var LayoutPlugin = (function (_super) {
            __extends(LayoutPlugin, _super);
            function LayoutPlugin(renderer) {
                var _this = this;
                _super.call(this, renderer);
                renderer.on('endOutput', function (o) {
                    return _this.onRendererEndOutput(o);
                });
            }
            LayoutPlugin.prototype.onRendererEndOutput = function (output) {
                var layout = this.renderer.getTemplate('layouts/default.hbs');
                output.contents = layout(output);
            };
            return LayoutPlugin;
        })(Renderer.BasePlugin);
        Renderer.LayoutPlugin = LayoutPlugin;

        Renderer.Renderer.PLUGIN_CLASSES.push(LayoutPlugin);
    })(TypeDoc.Renderer || (TypeDoc.Renderer = {}));
    var Renderer = TypeDoc.Renderer;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Renderer) {
        var NavigationPlugin = (function (_super) {
            __extends(NavigationPlugin, _super);
            function NavigationPlugin(renderer) {
                var _this = this;
                _super.call(this, renderer);
                renderer.on('beginTarget', function (t) {
                    return _this.onRendererBeginTarget(t);
                });
                renderer.on('beginOutput', function (o) {
                    return _this.onRendererBeginOutput(o);
                });
            }
            NavigationPlugin.prototype.onRendererBeginTarget = function (target) {
                var _this = this;
                this.navigation = this.renderer.theme.getNavigation();

                Handlebars.registerHelper('relativeURL', function (url) {
                    var relativePath = Path.relative(Path.dirname(_this.location), Path.dirname(url));
                    return Path.join(relativePath, Path.basename(url)).replace(/\\/g, '/');
                });
            };

            NavigationPlugin.prototype.onRendererBeginOutput = function (output) {
                var currentItems = [];
                var secondary = [];
                function updateItem(item) {
                    item.isCurrent = false;
                    item.isInPath = false;
                    if (item.url == output.url) {
                        currentItems.push(item);
                    }

                    if (item.children) {
                        item.children.forEach(function (child) {
                            updateItem(child);
                        });
                    }
                }

                updateItem(this.navigation);
                currentItems.forEach(function (item) {
                    item.isCurrent = true;

                    var primary = item;
                    while (primary && !primary.isPrimary) {
                        primary = primary.parent;
                    }
                    if (primary)
                        secondary.push(primary);

                    while (item) {
                        item.isInPath = true;
                        item = item.parent;
                    }
                });

                this.location = output.url;
                output.navigation = this.navigation;
                output.secondary = secondary;
            };
            return NavigationPlugin;
        })(Renderer.BasePlugin);
        Renderer.NavigationPlugin = NavigationPlugin;

        Renderer.Renderer.PLUGIN_CLASSES.push(NavigationPlugin);
    })(TypeDoc.Renderer || (TypeDoc.Renderer = {}));
    var Renderer = TypeDoc.Renderer;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    (function (Renderer) {
        var PartialsPlugin = (function (_super) {
            __extends(PartialsPlugin, _super);
            function PartialsPlugin(renderer) {
                var _this = this;
                _super.call(this, renderer);
                renderer.on('beginTarget', function (t) {
                    return _this.onRendererBeginTarget(t);
                });
            }
            PartialsPlugin.prototype.onRendererBeginTarget = function (target) {
                var dirName = Path.join(this.renderer.theme.basePath, 'partials');
                var partials = this.renderer.ioHost.dir(dirName);

                partials.forEach(function (partial) {
                    var name = Path.basename(partial, Path.extname(partial));
                    Handlebars.registerPartial(name, TypeDoc.readFile(partial));
                });
            };
            return PartialsPlugin;
        })(Renderer.BasePlugin);
        Renderer.PartialsPlugin = PartialsPlugin;

        Renderer.Renderer.PLUGIN_CLASSES.push(PartialsPlugin);
    })(TypeDoc.Renderer || (TypeDoc.Renderer = {}));
    var Renderer = TypeDoc.Renderer;
})(TypeDoc || (TypeDoc = {}));
var TypeDoc;
(function (TypeDoc) {
    /**
    *
    * @param file
    * @returns {TypeScript.FileInformation}
    */
    function readFile(file) {
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
    }
    TypeDoc.readFile = readFile;
})(TypeDoc || (TypeDoc = {}));
module.exports = TypeDoc;
