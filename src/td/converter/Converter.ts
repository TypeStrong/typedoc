/// <reference path="../models/comments/Comment.ts" />
/// <reference path="../models/comments/CommentTag.ts" />

module td.converter
{
    /**
     * Return a string that explains the given flag bit mask.
     *
     * @param value  A bit mask containing TypeScript.PullElementFlags bits.
     * @returns A string describing the given bit mask.
     */
    function flagsToString(value:any, flags:any):string {
        var items = [];
        for (var flag in flags) {
            if (!flags.hasOwnProperty(flag)) continue;
            if (flag != +flag) continue;
            if (value & flag) items.push(flags[flag]);
        }

        return items.join(', ');
    }


    export interface IConverterResult {
        project:any;
        errors:ts.Diagnostic[];
    }


    export enum SignatureType
    {
        Call,
        Constructor,
        Index
    }


    export interface ISourceReference
    {
        file:ISourceFile;

        line:number;

        character:number;
    }


    export interface ISourceFile
    {
        fileName:string;
    }


    export class Reflection
    {
        parent:Reflection;

        id:number;

        name:string;

        qualifiedName:string;

        comment:models.Comment;

        kind:ts.SyntaxKind;

        sources:ISourceReference[];

        isPrivate:boolean;

        isProtected:boolean;

        isPublic:boolean;

        isStatic:boolean;

        isExported:boolean;



        constructor(parent?:Reflection, name?:string) {
            this.name = name;
            this.qualifiedName = name;
            this.parent = parent;
        }


        toString(indent:string = '') {
            return indent + this.qualifiedName;
        }
    }


    export class Signature extends Reflection
    {
        parent:Container;

        parameters:Parameter[];
    }


    export class Parameter extends Reflection
    {
        parent:Signature;
    }


    export class Container extends Reflection
    {
        parent:Container;

        children:ts.Map<Container>;

        callSignatures:Signature[];

        constructorSignatures:Signature[];

        indexSignatures:Signature[];


        toString(indent:string = '') {
            var lines = [super.toString(indent)];
            indent += '  ';

            if (this.constructorSignatures) {
                this.constructorSignatures.forEach((n) => { lines.push(n.toString(indent)); });
            }

            if (this.indexSignatures) {
                this.indexSignatures.forEach((n) => { lines.push(n.toString(indent)); });
            }

            if (this.callSignatures) {
                this.callSignatures.forEach((n) => { lines.push(n.toString(indent)); });
            }

            if (this.children) {
                for (var key in this.children) {
                    lines.push(this.children[key].toString(indent));
                }
            }

            return lines.join('\n');
        }
    }


    export class Project extends Container
    {
        reflections:Reflection[] = [];

        nodeMapping:{[id:number]:number} = {};

        symbolMapping:{[id:number]:number} = {};

        files:ts.Map<ISourceFile> = {};
    }



    export class Converter extends EventDispatcher
    {
        /**
         */
        convert(fileNames:string[], settings:Settings):IConverterResult {
            var host    = this.createCompilerHost(settings.compilerOptions);
            var program = ts.createProgram(fileNames, settings.compilerOptions, host);
            var checker = program.getTypeChecker(true);
            var project = new Project(null, 'TypeScript project');
            var result  = {
                project: project,
                errors: program.getDiagnostics().concat(checker.getDiagnostics())
            };

            program.getSourceFiles().forEach((sourceFile) => {
                parse(sourceFile, project);
            });

            console.log(project.toString());
            return result;


            /**
             * Parse the given node.
             */
            function parse(node:ts.Node, scope:Container) {
                switch (node.kind) {
                    case ts.SyntaxKind.ClassDeclaration:
                        parseClassDeclaration(<ts.ClassDeclaration>node, scope);
                        break;
                    case ts.SyntaxKind.InterfaceDeclaration:
                        parseInterfaceDeclaration(<ts.InterfaceDeclaration>node, scope);
                        break;
                    case ts.SyntaxKind.SourceFile:
                        parseSourceFile(<ts.SourceFile>node, scope);
                        break;
                    case ts.SyntaxKind.ModuleDeclaration:
                        parseModuleDeclaration(<ts.ModuleDeclaration>node, scope);
                        break;
                    case ts.SyntaxKind.VariableStatement:
                        parseVariableStatement(<ts.VariableStatement>node, scope);
                        break;
                    case ts.SyntaxKind.VariableDeclaration:
                        parseVariableDeclaration(<ts.VariableDeclaration>node, scope);
                        break;
                    case ts.SyntaxKind.EnumDeclaration:
                        parseEnumDeclaration(<ts.EnumDeclaration>node, scope);
                        break;
                    case ts.SyntaxKind.EnumMember:
                        parseEnumMember(<ts.EnumMember>node, scope);
                        break;
                    case ts.SyntaxKind.Constructor:
                    case ts.SyntaxKind.ConstructSignature:
                        parseConstructor(<ts.ConstructorDeclaration>node, scope);
                        break;
                    case ts.SyntaxKind.Method:
                    case ts.SyntaxKind.FunctionDeclaration:
                        parseFunctionDeclaration(<ts.MethodDeclaration>node, scope);
                        break;
                    case ts.SyntaxKind.IndexSignature:
                        parseIndexSignature(<ts.SignatureDeclaration>node, scope);
                        break;
                    case ts.SyntaxKind.Property:
                        parseProperty(<ts.PropertyDeclaration>node, scope);
                        break;
                    case ts.SyntaxKind.Block:
                    case ts.SyntaxKind.ModuleBlock:
                        parseBlock(<ts.Block>node, scope);
                        break;
                    default:
                        console.log('Unhandeled: ' + ts.SyntaxKind[node.kind]);
                }
            }


            function registerReflection(reflection:Reflection, node:ts.Node) {
                var id = project.reflections.length;
                reflection.id = id;
                project.reflections.push(reflection);

                if (node.id) {
                    project.nodeMapping[node.id] = id;
                }

                if (node.symbol && node.symbol.id) {
                    project.symbolMapping[node.symbol.id] = id;
                }
            }


            function createChild(container:Container, node:ts.Node, name:string = node.symbol.name):Container {
                var child;

                if (!container.children) container.children = {};
                if (!container.children[name]) {
                    child = new Container(container, name);
                    child.kind        = node.kind;
                    child.flags       = node.flags;
                    child.isPrivate   = (node.flags & ts.NodeFlags.Private);
                    child.isProtected = (node.flags & ts.NodeFlags.Protected);
                    child.isPublic    = (node.flags & ts.NodeFlags.Public);
                    child.isStatic    = (node.flags & ts.NodeFlags.Static);
                    child.isExported  = (node.flags & ts.NodeFlags.Export);

                    if (node.symbol) {
                        child.qualifiedName = checker.getFullyQualifiedName(node.symbol);
                    } else {
                        child.qualifiedName = name;
                    }

                    container.children[name] = child;
                    registerReflection(child, node);
                } else {
                    child = container.children[name];
                }

                createSourceReference(child, node);
                return child;
            }


            function createSignature(container:Container, node:ts.SignatureDeclaration, type:SignatureType):Signature {
                var name, prop;
                switch (type) {
                    case SignatureType.Index:
                        prop = container.indexSignatures || (container.indexSignatures = []);
                        name = '__index';
                        break;
                    case SignatureType.Constructor:
                        prop = container.constructorSignatures || (container.constructorSignatures = []);
                        name = '__construct';
                        break;
                    default :
                        prop = container.callSignatures || (container.callSignatures = []);
                        name = '__call';
                }

                var signature = new Signature(container, name);
                prop.push(signature);

                node.parameters.forEach((parameter:ts.ParameterDeclaration) => {

                });

                registerReflection(signature, node);
                createSourceReference(signature, node);
                return signature;
            }


            function createSourceReference(reflection:Reflection, node:ts.Node) {
                var sourceFile = <ts.SourceFile>node;
                while (sourceFile.parent) sourceFile = <ts.SourceFile>sourceFile.parent;

                var fileName = sourceFile.filename;
                var file:ISourceFile;
                if (!project.files[fileName]) {
                    file = project.files[fileName] = {
                        fileName: fileName
                    };
                } else {
                    file = project.files[fileName];
                }

                var position = sourceFile.getLineAndCharacterFromPosition(node.pos);

                if (!reflection.sources) reflection.sources = [];
                reflection.sources.push({
                    file:      file,
                    line:      position.line,
                    character: position.character
                });


                var comments = ts.getJsDocComments(node, sourceFile);
                if (comments) {
                    comments.forEach((comment) => {
                        reflection.comment = parseComment(sourceFile.text.substring(comment.pos, comment.end), reflection.comment);
                    });
                }
            }


            function parseSourceFile(sourceFile:ts.SourceFile, scope:Container) {
                if (sourceFile.flags & ts.NodeFlags.DeclarationFile) {
                    return;
                } else if (settings.compilerOptions.module == ts.ModuleKind.AMD) {
                    scope = createChild(scope, sourceFile, sourceFile.filename);
                }

                parseBlock(sourceFile, scope);
            }


            function parseModuleDeclaration(node:ts.ModuleDeclaration, scope:Container) {
                var container = createChild(scope, node);
                parse(node.body, container);
            }


            function parseClassDeclaration(node:ts.ClassDeclaration, scope:Container) {
                var container = createChild(scope, node);

                node.members.forEach((member) => {
                    parse(member, container);
                });

                if (node.baseType) {
                    var type = checker.getTypeOfNode(node.baseType);
                    type.symbol.declarations.forEach((declaration) => {
                        inherit(declaration, container);
                    });
                }
            }


            function parseInterfaceDeclaration(node:ts.InterfaceDeclaration, scope:Container) {
                var container = createChild(scope, node);

                node.members.forEach((member, isInherit) => {
                    parse(member, container);
                });

                if (node.baseTypes) {
                    node.baseTypes.forEach((baseType:ts.TypeReferenceNode) => {
                        var type = checker.getTypeOfNode(baseType);
                        if (!type || !type.symbol) {
                            console.log('Error: No type for ' + baseType.typeName['text']);
                            return;
                        }

                        type.symbol.declarations.forEach((declaration) => {
                            inherit(declaration, container);
                        });
                    });
                }
            }


            function parseBlock(node:ts.Block, scope:Container) {
                node.statements.forEach((statement) => {
                    parse(statement, scope);
                });
            }


            function parseVariableStatement(node:ts.VariableStatement, scope:Container) {
                node.declarations.forEach((variableDeclaration) => {
                    parseVariableDeclaration(variableDeclaration, scope);
                });
            }


            function parseVariableDeclaration(node:ts.VariableDeclaration, scope:Container) {
                createChild(scope, node);
            }


            function parseEnumDeclaration(node:ts.EnumDeclaration, scope:Container) {
                scope = createChild(scope, node);
                node.members.forEach((node) => parseEnumMember(node, scope));
            }


            function parseEnumMember(node:ts.EnumMember, scope:Container) {
                createChild(scope, node);
            }


            function parseConstructor(node:ts.ConstructorDeclaration, scope:Container) {
                createSignature(scope, node, SignatureType.Constructor);
            }


            function parseFunctionDeclaration(node:ts.MethodDeclaration, scope:Container) {
                var hasBody = !!node.body;
                var method = createChild(scope, node);
                if (!hasBody || !method.callSignatures) {
                    createSignature(method, node, SignatureType.Call);
                } else {
                    createSourceReference(method, node);
                }
            }


            function parseIndexSignature(node:ts.SignatureDeclaration, scope:Container) {
                createSignature(scope, node, SignatureType.Index);
            }


            function parseProperty(node:ts.PropertyDeclaration, scope:Container) {
                createChild(scope, node);
            }


            function inherit(node:ts.Node, target:Container) {
                var tree = new Container();
                parse(node, tree);

                for (var key in tree.children) {
                    var parent = <Container>tree.children[key];
                    if (parent.constructorSignatures && !target.constructorSignatures) {
                        target.constructorSignatures = parent.constructorSignatures;
                    }

                    if (!target.children) target.children = {};
                    for (var childName in parent.children) {
                        if (target.children[childName]) {

                        } else {
                            target.children[childName] = parent.children[childName];
                        }
                    }
                }
            }


            /**
             * Parse the given doc comment string.
             *
             * @param text     The doc comment string that should be parsed.
             * @param comment  The [[Models.Comment]] instance the parsed results should be stored into.
             * @returns        A populated [[Models.Comment]] instance.
             */
            function parseComment(text:string, comment:models.Comment = new models.Comment()):models.Comment {
                function consumeTypeData(line:string):string {
                    line = line.replace(/^\{[^\}]*\}/, '');
                    line = line.replace(/^\[[^\]]*\]/, '');
                    return line.trim();
                }

                text = text.replace(/^\s*\/\*+/, '');
                text = text.replace(/\*+\/\s*$/, '');

                var currentTag:models.CommentTag;
                var shortText:number = 0;
                var lines = text.split(/\r\n?|\n/);
                lines.forEach((line) => {
                    line = line.replace(/^\s*\*? ?/, '');
                    line = line.replace(/\s*$/, '');

                    var tag = /^@(\w+)/.exec(line);
                    if (tag) {
                        var tagName = tag[1].toLowerCase();
                        line = line.substr(tagName.length + 1).trim();

                        if (tagName == 'return') tagName = 'returns';
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

                        currentTag = new models.CommentTag(tagName, paramName, line);
                        if (!comment.tags) comment.tags = [];
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
            }
        }


        /**
         * Create the compiler host.
         *
         * Taken from TypeScript source files.
         * @see https://github.com/Microsoft/TypeScript/blob/master/src/compiler/tsc.ts#L136
         */
        createCompilerHost(options:ts.CompilerOptions):ts.CompilerHost {
            var currentDirectory: string;
            var unsupportedFileEncodingErrorCode = -2147024809;


            function getCanonicalFileName(fileName:string):string {
                return sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
            }


            function getSourceFile(filename:string, languageVersion:ts.ScriptTarget, onError?: (message: string) => void):ts.SourceFile {
                try {
                    var text = sys.readFile(filename, options.charset);
                } catch (e) {
                    if (onError) {
                        onError(e.number === unsupportedFileEncodingErrorCode ?
                            'Unsupported file encoding' :
                            e.message);
                    }
                    text = "";
                }
                return text !== undefined ? ts.createSourceFile(filename, text, languageVersion, /*version:*/ "0") : undefined;
            }


            function writeFile(fileName:string, data:string, writeByteOrderMark:boolean, onError?:(message: string) => void) {
            }


            return {
                getSourceFile: getSourceFile,
                getDefaultLibFilename: () => ts.combinePaths(ts.getDirectoryPath(ts.normalizePath(td.tsPath)), "lib.d.ts"),
                writeFile: writeFile,
                getCurrentDirectory: () => currentDirectory || (currentDirectory = sys.getCurrentDirectory()),
                useCaseSensitiveFileNames: () => sys.useCaseSensitiveFileNames,
                getCanonicalFileName: getCanonicalFileName,
                getNewLine: () => sys.newLine
            };
        }
    }
}