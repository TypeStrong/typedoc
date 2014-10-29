/// <reference path="../models/comments/Comment.ts" />
/// <reference path="../models/comments/CommentTag.ts" />
/// <reference path="../PluginHost.ts" />

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


    export interface ISourceContainer
    {
        sources:ISourceReference[];
    }


    export interface ICommentContainer
    {
        comment:models.Comment;
    }


    export enum ReflectionKind
    {
        Global = 0,
        ExternalModule = 1,
        Module = 2,
        Enum = 4,
        EnumMember = 16,
        Variable = 32,
        Function = 64,
        Class = 128,
        Interface = 256,
        Constructor = 512,
        Property = 1024,
        Method = 2048,
        CallSignature = 4096,
        IndexSignature = 8192,
        ConstructorSignature = 16384,
        Parameter = 32768,

        ClassOrInterface = Class | Interface,
        VariableOrProperty = Variable | Property,
        FunctionOrMethod = Function | Method,
        SomeSignature = CallSignature | IndexSignature | ConstructorSignature
    }


    export class Reflection
    {
        id:number;

        name:string;

        kind:ReflectionKind;

        parent:Reflection;


        constructor(parent?:Reflection, name?:string, kind?:ReflectionKind) {
            this.name = name;
            this.parent = parent;
            this.kind = kind;
        }


        toString() {
            return ReflectionKind[this.kind] + ' ' + this.name;
        }


        toStringHierarchy(indent:string = '') {
            return indent + this.toString();
        }
    }


    export class Signature extends Reflection implements ISourceContainer, ICommentContainer
    {
        parent:Container;

        comment:models.Comment;

        sources:ISourceReference[];

        parameters:Parameter[];


        toStringHierarchy(indent:string = '') {
            var lines = [indent + this.toString()];

            if (this.parameters) {
                indent += '  ';
                this.parameters.forEach((n) => { lines.push(n.toStringHierarchy(indent)); });
            }

            return lines.join('\n');
        }
    }


    export class Parameter extends Reflection implements ICommentContainer
    {
        parent:Signature;

        comment:models.Comment;
    }


    export class Container extends Reflection
    {
        parent:Container;

        children:ts.Map<Declaration>;


        toStringHierarchy(indent:string = '') {
            var lines = [indent + this.toString()];
            indent += '  ';

            if (this.children) {
                for (var key in this.children) {
                    lines.push(this.children[key].toStringHierarchy(indent));
                }
            }

            return lines.join('\n');
        }
    }


    export class Declaration extends Container implements ISourceContainer, ICommentContainer
    {
        comment:models.Comment;

        sources:ISourceReference[];

        callSignatures:Signature[];

        constructorSignatures:Signature[];

        indexSignatures:Signature[];

        defaultValue:string;

        isPrivate:boolean;

        isProtected:boolean;

        isPublic:boolean;

        isStatic:boolean;

        isExported:boolean;


        toStringHierarchy(indent:string = '') {
            var lines = [indent + this.toString()];
            indent += '  ';

            if (this.constructorSignatures) {
                this.constructorSignatures.forEach((n) => { lines.push(n.toStringHierarchy(indent)); });
            }

            if (this.indexSignatures) {
                this.indexSignatures.forEach((n) => { lines.push(n.toStringHierarchy(indent)); });
            }

            if (this.callSignatures) {
                this.callSignatures.forEach((n) => { lines.push(n.toStringHierarchy(indent)); });
            }

            if (this.children) {
                for (var key in this.children) {
                    lines.push(this.children[key].toStringHierarchy(indent));
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



    export class Converter extends PluginHost
    {
        constructor() {
            super();
            this.plugins = Converter.loadPlugins(this);
        }


        /**
         */
        convert(fileNames:string[], settings:Settings):IConverterResult {
            var host    = this.createCompilerHost(settings.compilerOptions);
            var program = ts.createProgram(fileNames, settings.compilerOptions, host);
            var checker = program.getTypeChecker(true);
            var project = new Project(null, 'TypeScript project', ReflectionKind.Global);
            var result  = {
                project: project,
                errors: program.getDiagnostics().concat(checker.getDiagnostics())
            };

            program.getSourceFiles().forEach((sourceFile) => {
                visit(sourceFile, project);
            });

            project.reflections.forEach((reflection) => this.dispatch('resolve', project, reflection));

            console.log(project.toStringHierarchy());
            return result;


            /**
             * Parse the given node.
             */
            function visit(node:ts.Node, scope:Container) {
                switch (node.kind) {
                    case ts.SyntaxKind.ClassDeclaration:
                        visitClassDeclaration(<ts.ClassDeclaration>node, scope);
                        break;
                    case ts.SyntaxKind.InterfaceDeclaration:
                        visitInterfaceDeclaration(<ts.InterfaceDeclaration>node, scope);
                        break;
                    case ts.SyntaxKind.SourceFile:
                        visitSourceFile(<ts.SourceFile>node, scope);
                        break;
                    case ts.SyntaxKind.ModuleDeclaration:
                        visitModuleDeclaration(<ts.ModuleDeclaration>node, scope);
                        break;
                    case ts.SyntaxKind.VariableStatement:
                        visitVariableStatement(<ts.VariableStatement>node, scope);
                        break;
                    case ts.SyntaxKind.Property:
                    case ts.SyntaxKind.PropertyAssignment:
                    case ts.SyntaxKind.VariableDeclaration:
                        visitVariableDeclaration(<ts.VariableDeclaration>node, scope);
                        break;
                    case ts.SyntaxKind.EnumDeclaration:
                        visitEnumDeclaration(<ts.EnumDeclaration>node, scope);
                        break;
                    case ts.SyntaxKind.EnumMember:
                        visitEnumMember(<ts.EnumMember>node, scope);
                        break;
                    case ts.SyntaxKind.Constructor:
                    case ts.SyntaxKind.ConstructSignature:
                        visitConstructor(<ts.ConstructorDeclaration>node, scope);
                        break;
                    case ts.SyntaxKind.Method:
                    case ts.SyntaxKind.FunctionDeclaration:
                        visitFunctionDeclaration(<ts.MethodDeclaration>node, scope);
                        break;
                    case ts.SyntaxKind.CallSignature:
                        visitSignature(<ts.SignatureDeclaration>node, scope, SignatureType.Call);
                        break;
                    case ts.SyntaxKind.IndexSignature:
                        visitSignature(<ts.SignatureDeclaration>node, scope, SignatureType.Index);
                        break;
                    case ts.SyntaxKind.Block:
                    case ts.SyntaxKind.ModuleBlock:
                        visitBlock(<ts.Block>node, scope);
                        break;
                    case ts.SyntaxKind.ObjectLiteral:
                        visitObjectLiteral(<ts.ObjectLiteral>node, scope);
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


            function createDeclaration(container:Container, node:ts.Node, kind:ReflectionKind, name:string = node.symbol.name):Declaration {
                var child:Declaration;

                if (!container.children) container.children = {};
                if (!container.children[name]) {
                    child = new Declaration(container, name, kind);
                    child.isPrivate   = !!(node.flags & ts.NodeFlags.Private);
                    child.isProtected = !!(node.flags & ts.NodeFlags.Protected);
                    child.isPublic    = !!(node.flags & ts.NodeFlags.Public);
                    child.isStatic    = !!(node.flags & ts.NodeFlags.Static);
                    child.isExported  = !!(node.flags & ts.NodeFlags.Export);


                    container.children[name] = child;
                    registerReflection(child, node);
                } else {
                    child = container.children[name];
                }

                createSourceReference(child, node);
                createComment(child, node);
                return child;
            }


            function createSignature(container:Declaration, node:ts.SignatureDeclaration, type:SignatureType):Signature {
                var name, prop, kind;
                switch (type) {
                    case SignatureType.Index:
                        prop = container.indexSignatures || (container.indexSignatures = []);
                        name = '__index';
                        kind = ReflectionKind.IndexSignature;
                        break;
                    case SignatureType.Constructor:
                        prop = container.constructorSignatures || (container.constructorSignatures = []);
                        name = '__construct';
                        kind = ReflectionKind.ConstructorSignature;
                        break;
                    default :
                        prop = container.callSignatures || (container.callSignatures = []);
                        name = '__call';
                        kind = ReflectionKind.CallSignature;
                }

                var signature = new Signature(container, name, kind);
                prop.push(signature);

                node.parameters.forEach((parameter:ts.ParameterDeclaration) => {
                    createParameter(signature, parameter);
                });

                registerReflection(signature, node);
                createSourceReference(signature, node);
                createComment(signature, node);
                return signature;
            }


            function createParameter(signature:Signature, node:ts.ParameterDeclaration) {
                var parameter = new Parameter(signature, node.symbol.name, ReflectionKind.Parameter);

                if (!signature.parameters) signature.parameters = [];
                signature.parameters.push(parameter);

                registerReflection(parameter, node);
            }


            function createSourceReference(reflection:ISourceContainer, node:ts.Node) {
                var sourceFile = ts.getSourceFileOfNode(node);
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
            }


            function createComment(reflection:ICommentContainer, node:ts.Node) {
                var sourceFile = ts.getSourceFileOfNode(node);
                var comments = ts.getJsDocComments(node, sourceFile);
                if (comments) {
                    comments.forEach((comment) => {
                        reflection.comment = parseComment(sourceFile.text.substring(comment.pos, comment.end), reflection.comment);
                    });
                }
            }


            function visitSourceFile(sourceFile:ts.SourceFile, scope:Container) {
                if (ts.isDeclarationFile(sourceFile)) {
                    return;
                } else if (ts.shouldEmitToOwnFile(sourceFile, settings.compilerOptions)) {
                    scope = createDeclaration(scope, sourceFile, ReflectionKind.ExternalModule, sourceFile.filename);
                }

                visitBlock(sourceFile, scope);
            }


            function visitModuleDeclaration(node:ts.ModuleDeclaration, scope:Container) {
                var container = createDeclaration(scope, node, ReflectionKind.Module);
                visit(node.body, container);
            }


            function visitClassDeclaration(node:ts.ClassDeclaration, scope:Container) {
                var container = createDeclaration(scope, node, ReflectionKind.Class);

                node.members.forEach((member) => {
                    visit(member, container);
                });

                if (node.baseType) {
                    var type = checker.getTypeOfNode(node.baseType);
                    type.symbol.declarations.forEach((declaration) => {
                        inherit(declaration, container);
                    });
                }
            }


            function visitInterfaceDeclaration(node:ts.InterfaceDeclaration, scope:Container) {
                var container = createDeclaration(scope, node, ReflectionKind.Interface);

                node.members.forEach((member, isInherit) => {
                    visit(member, container);
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


            function visitBlock(node:ts.Block, scope:Container) {
                node.statements.forEach((statement) => {
                    visit(statement, scope);
                });
            }


            function visitVariableStatement(node:ts.VariableStatement, scope:Container) {
                node.declarations.forEach((variableDeclaration) => {
                    visitVariableDeclaration(variableDeclaration, scope);
                });
            }


            function visitVariableDeclaration(node:ts.VariableDeclaration, scope:Container) {
                var kind = scope.kind & ReflectionKind.ClassOrInterface ? ReflectionKind.Property : ReflectionKind.Variable;
                var variable = createDeclaration(scope, node, kind);

                if (node.initializer) {
                    switch (node.initializer.kind) {
                        case ts.SyntaxKind.ArrowFunction:
                        case ts.SyntaxKind.FunctionExpression:
                            visitSignature(<ts.SignatureDeclaration>node.initializer, variable, SignatureType.Call);
                            if (variable.kind == kind) {
                                variable.kind = scope.kind & ReflectionKind.ClassOrInterface ? ReflectionKind.Method : ReflectionKind.Function;
                            }
                            break;
                        case ts.SyntaxKind.ObjectLiteral:
                            visitObjectLiteral(<ts.ObjectLiteral>node.initializer, variable);
                            break;
                        case ts.SyntaxKind.StringLiteral:
                            variable.defaultValue = '"' + (<ts.LiteralExpression>node).text + '"';
                            break;
                        case ts.SyntaxKind.NumericLiteral:
                            variable.defaultValue = (<ts.LiteralExpression>node).text;
                            break;
                        case ts.SyntaxKind.TrueKeyword:
                            variable.defaultValue = 'true';
                            break;
                        case ts.SyntaxKind.FalseKeyword:
                            variable.defaultValue = 'false';
                            break;
                    }
                }
            }


            function visitEnumDeclaration(node:ts.EnumDeclaration, scope:Container) {
                scope = createDeclaration(scope, node, ReflectionKind.Enum);
                node.members.forEach((node) => {
                    visitEnumMember(node, scope)
                });
            }


            function visitEnumMember(node:ts.EnumMember, scope:Container) {
                createDeclaration(scope, node, ReflectionKind.EnumMember);
            }


            function visitConstructor(node:ts.ConstructorDeclaration, scope:Container) {
                var hasBody = !!node.body;
                var method = createDeclaration(scope, node, ReflectionKind.Constructor);

                if (!hasBody || !method.callSignatures) {
                    createSignature(method, node, SignatureType.Constructor);
                } else {
                    createSourceReference(method, node);
                }
            }


            function visitFunctionDeclaration(node:ts.MethodDeclaration, scope:Container) {
                var kind = scope.kind & ReflectionKind.ClassOrInterface ? ReflectionKind.Method : ReflectionKind.Function;
                var hasBody = !!node.body;
                var method = createDeclaration(scope, node, kind);

                if (!hasBody || !method.callSignatures) {
                    createSignature(method, node, SignatureType.Call);
                } else {
                    createSourceReference(method, node);
                }
            }


            function visitSignature(node:ts.SignatureDeclaration, scope:Container, type:SignatureType) {
                if (scope instanceof Declaration) {
                    createSignature(<Declaration>scope, node, type);
                }
            }


            function visitObjectLiteral(node:ts.ObjectLiteral, scope:Container) {
                if (node.properties) {
                    node.properties.forEach((node) => visit(node, scope));
                }
            }


            function inherit(node:ts.Node, target:Container) {
                var tree = new Container();
                visit(node, tree);

                for (var key in tree.children) {
                    var parent = tree.children[key];
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