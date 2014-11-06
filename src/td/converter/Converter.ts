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
        Index,
        Get,
        Set
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


    export interface ISourceContainer extends Reflection
    {
        sources:ISourceReference[];
    }


    export interface ICommentContainer extends Reflection
    {
        comment:models.Comment;
    }


    export interface IDefaultValueContainer extends Reflection
    {
        defaultValue:string;
    }


    export interface ITypeContainer extends Reflection
    {
        type:Type;
    }


    export interface ITypeParameterContainer extends Reflection
    {
        typeParameters:TypeParameterType[];
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
        TypeLiteral = 65536,
        TypeParameter = 131072,
        Accessor = 262144,
        Getter = 524288,
        Setter = 1048576,

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


    export class SignatureReflection extends Reflection implements ISourceContainer, ICommentContainer, ITypeContainer, ITypeParameterContainer
    {
        parent:ContainerReflection;

        comment:models.Comment;

        sources:ISourceReference[];

        parameters:ParameterReflection[];

        typeParameters:TypeParameterType[];

        type:Type;


        toString() {
            return super.toString() + (this.type ? ':' + this.type.toString() :  '');
        }


        toStringHierarchy(indent:string = '') {
            var lines = [indent + this.toString()];
            indent += '  ';

            if (this.typeParameters) {
                this.typeParameters.forEach((n) => { lines.push(indent + n.toString()); });
            }

            if (this.type instanceof ReflectionType) {
                lines.push((<ReflectionType>this.type).declaration.toStringHierarchy(indent));
            }

            if (this.parameters) {
                this.parameters.forEach((n) => { lines.push(n.toStringHierarchy(indent)); });
            }

            return lines.join('\n');
        }
    }


    export class ParameterReflection extends Reflection implements ICommentContainer, IDefaultValueContainer, ITypeContainer
    {
        parent:SignatureReflection;

        comment:models.Comment;

        defaultValue:string;

        type:Type;

        isOptional:boolean;


        toString() {
            return super.toString() + (this.type ? ':' + this.type.toString() :  '');
        }


        toStringHierarchy(indent:string = '') {
            var lines = [indent + this.toString()];
            indent += '  ';

            if (this.type instanceof ReflectionType) {
                lines.push((<ReflectionType>this.type).declaration.toStringHierarchy(indent));
            }

            return lines.join('\n');
        }
    }


    export class ContainerReflection extends Reflection
    {
        parent:ContainerReflection;

        children:ts.Map<DeclarationReflection>;


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


    export class DeclarationReflection extends ContainerReflection implements ISourceContainer, ICommentContainer, IDefaultValueContainer, ITypeContainer, ITypeParameterContainer
    {
        comment:models.Comment;

        type:Type;

        typeParameters:TypeParameterType[];

        sources:ISourceReference[];

        callSignatures:SignatureReflection[];

        constructorSignatures:SignatureReflection[];

        indexSignature:SignatureReflection;

        getSignature:SignatureReflection;

        setSignature:SignatureReflection;

        defaultValue:string;

        isPrivate:boolean;

        isProtected:boolean;

        isPublic:boolean;

        isStatic:boolean;

        isExported:boolean;

        isOptional:boolean;

        overwrites:Type;

        inheritedFrom:Type;


        toString() {
            return super.toString() + (this.type ? ':' + this.type.toString() :  '');
        }


        toStringHierarchy(indent:string = '') {
            var lines = [indent + this.toString()];
            indent += '  ';

            if (this.typeParameters) {
                this.typeParameters.forEach((n) => { lines.push(indent + n.toString()); });
            }

            if (this.type instanceof ReflectionType) {
                lines.push((<ReflectionType>this.type).declaration.toStringHierarchy(indent));
            }

            if (this.constructorSignatures) {
                this.constructorSignatures.forEach((n) => { lines.push(n.toStringHierarchy(indent)); });
            }

            if (this.indexSignature) {
                lines.push(this.indexSignature.toStringHierarchy(indent));
            }

            if (this.getSignature) {
                lines.push(this.getSignature.toStringHierarchy(indent));
            }

            if (this.setSignature) {
                lines.push(this.setSignature.toStringHierarchy(indent));
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


    export class Project extends ContainerReflection
    {
        reflections:Reflection[] = [];

        nodeMapping:{[id:number]:number} = {};

        symbolMapping:{[id:number]:number} = {};

        files:ts.Map<ISourceFile> = {};
    }




    export class Type
    {
        isArray:boolean;
    }


    export class IntrinsicType extends Type
    {
        name:string;


        constructor(name:string) {
            super();
            this.name = name;
        }


        toString() {
            return this.name + (this.isArray ? '[]' : '');
        }
    }


    export class ReferenceType extends Type
    {
        symbolID:number;


        constructor(symbolID:number) {
            super();
            this.symbolID = symbolID;
        }


        toString() {
            return '=> ' + this.symbolID + (this.isArray ? '[]' : '');
        }
    }

    export class ReflectionType extends Type
    {
        declaration:DeclarationReflection;


        constructor(declaration:DeclarationReflection) {
            super();
            this.declaration = declaration;
        }


        toString() {
            return 'object';
        }
    }


    export class TypeParameterType extends Type
    {
        name:string;

        constraint:Type;


        toString() {
            return this.name;
        }
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

            var isInherit = false;
            var inheritParent:ts.Node;
            var inherited:string[] = [];
            var typeParameters:{[name:string]:Type} = {};

            program.getSourceFiles().forEach((sourceFile) => {
                visitSourceFile(sourceFile, project);
            });

            project.reflections.forEach((reflection) => this.dispatch('resolve', project, reflection));

            console.log(project.toStringHierarchy());
            return result;


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


            function createDeclaration(container:ContainerReflection, node:ts.Node, kind:ReflectionKind, name?:string):DeclarationReflection {
                var child:DeclarationReflection;
                if (!name) {
                    if (!node.symbol) return null;
                    name = node.symbol.name;
                }

                if (!container.children) container.children = {};
                if (!container.children[name]) {
                    child = new DeclarationReflection(container, name, kind);
                    child.isPrivate   = !!(node.flags & ts.NodeFlags['Private']);
                    child.isProtected = !!(node.flags & ts.NodeFlags['Protected']);
                    child.isPublic    = !!(node.flags & ts.NodeFlags['Public']);
                    child.isStatic    = !!(node.flags & ts.NodeFlags['Static']);
                    child.isExported  = !!(node.flags & ts.NodeFlags['Export']);
                    child.isOptional  = !!(node.flags & ts.NodeFlags['QuestionMark']);

                    container.children[name] = child;
                    registerReflection(child, node);

                    if (isInherit && node.parent == inheritParent) {
                        child.inheritedFrom = new ReferenceType(node.symbol.id);
                    }
                } else {
                    child = container.children[name];
                    if (isInherit && node.parent == inheritParent && inherited.indexOf(name) != -1) {
                        child.overwrites = new ReferenceType(node.symbol.id);
                        return null;
                    }
                }

                createSourceReference(child, node);
                createComment(child, node);
                return child;
            }


            function createSignature(container:DeclarationReflection, node:ts.SignatureDeclaration, type:SignatureType):SignatureReflection {
                var name, prop, kind, tsKind;
                switch (type) {
                    case SignatureType.Index:
                        prop   = 'indexSignature';
                        name   = '__index';
                        kind   = ReflectionKind.IndexSignature;
                        tsKind = -1;
                        break;
                    case SignatureType.Get:
                        prop   = 'getSignature';
                        name   = '__get';
                        kind   = ReflectionKind.Getter;
                        tsKind = -1;
                        break;
                    case SignatureType.Set:
                        prop   = 'setSignature';
                        name   = '__set';
                        kind   = ReflectionKind.Setter;
                        tsKind = -1;
                        break;
                    case SignatureType.Constructor:
                        prop   = container.constructorSignatures || (container.constructorSignatures = []);
                        name   = '__constructor';
                        kind   = ReflectionKind.ConstructorSignature;
                        tsKind = ts.SignatureKind['Construct'];
                        break;
                    default :
                        prop   = container.callSignatures || (container.callSignatures = []);
                        name   = '__call';
                        kind   = ReflectionKind.CallSignature;
                        tsKind = ts.SignatureKind['Call'];
                }

                var signature = new SignatureReflection(container, name, kind);
                if (typeof prop == 'string') {
                    container[prop] = signature;
                } else {
                    prop.push(signature);
                }

                var oldTypeParameters = typeParameters;
                typeParameters = extractTypeParameters(signature, node.typeParameters, null, oldTypeParameters);

                node.parameters.forEach((parameter:ts.ParameterDeclaration) => {
                    createParameter(signature, parameter);
                });

                registerReflection(signature, node);

                if (tsKind != -1) {
                    var tsType = checker.getTypeOfNode(node);
                    checker.getSignaturesOfType(tsType, tsKind).forEach((tsSignature) => {
                        if (tsSignature.declaration == node) {
                            signature.type = extractType(node.type, checker.getReturnTypeOfSignature(tsSignature));
                        }
                    });
                } else {
                    signature.type = extractType(node.type, checker.getTypeOfNode(node));
                }

                createSourceReference(signature, node);
                createComment(signature, node);

                typeParameters = oldTypeParameters;
                return signature;
            }


            function createParameter(signature:SignatureReflection, node:ts.ParameterDeclaration) {
                var parameter = new ParameterReflection(signature, node.symbol.name, ReflectionKind.Parameter);
                parameter.isOptional = !!(node.flags & ts.NodeFlags['QuestionMark']);
                parameter.type = extractType(node.type, checker.getTypeOfNode(node));

                extractDefaultValue(node, parameter);

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


            function extractType(node:ts.TypeNode, type:ts.Type):Type {
                if (type.flags & ts.TypeFlags['Intrinsic']) {
                    return new IntrinsicType((<ts.IntrinsicType>type).intrinsicName);
                } else if (type.flags & ts.TypeFlags['Enum']) {
                    return new ReferenceType(type.symbol.id);
                } else if (type.flags & ts.TypeFlags['TypeParameter']) {
                    var name = (<ts.TypeReferenceNode>node).typeName['text'];
                    return typeParameters[name];
                } else if (type.flags & ts.TypeFlags['ObjectType']) {
                    if (type.symbol) {
                        if (type.flags & ts.TypeFlags['Anonymous']) {
                            if (type.symbol.flags & ts.SymbolFlags['TypeLiteral']) {
                                var declaration = new DeclarationReflection();
                                declaration.kind = ReflectionKind.TypeLiteral;
                                declaration.name = '__type';
                                type.symbol.declarations.forEach((node) => {
                                    visit(node, declaration);
                                });
                                return new ReflectionType(declaration);
                            } else {
                                return new IntrinsicType('object');
                            }
                        } else {
                            return new ReferenceType(type.symbol.id);
                        }
                    } else {
                        if (node && node['elementType']) {
                            var result = extractType(node['elementType'], checker.getTypeOfNode(node['elementType']));
                            if (result) {
                                result.isArray = true;
                                return result;
                            } else {
                                return new IntrinsicType('object');
                            }
                        } else {
                            return new IntrinsicType('object');
                        }
                    }
                } else {
                    console.log('Unhadeled type: ' + flagsToString(type.flags, ts.TypeFlags));
                    return new IntrinsicType('any');
                }
            }


            function extractDefaultValue(node:ts.VariableDeclaration, reflection:IDefaultValueContainer) {
                if (!node.initializer) return;

                if (reflection instanceof DeclarationReflection) {
                    var declaration = <DeclarationReflection>reflection;
                    switch (node.initializer.kind) {
                        case ts.SyntaxKind['ArrowFunction']:
                        case ts.SyntaxKind['FunctionExpression']:
                            visitSignatureDeclaration(<ts.SignatureDeclaration>node.initializer, declaration, SignatureType.Call);
                            return;
                        case ts.SyntaxKind['ObjectLiteral']:
                            visitObjectLiteral(<ts.ObjectLiteral>node.initializer, declaration);
                            return;
                    }
                }

                switch (node.initializer.kind) {
                    case ts.SyntaxKind['StringLiteral']:
                        reflection.defaultValue = '"' + (<ts.LiteralExpression>node).text + '"';
                        break;
                    case ts.SyntaxKind['NumericLiteral']:
                        reflection.defaultValue = (<ts.LiteralExpression>node).text;
                        break;
                    case ts.SyntaxKind['TrueKeyword']:
                        reflection.defaultValue = 'true';
                        break;
                    case ts.SyntaxKind['FalseKeyword']:
                        reflection.defaultValue = 'false';
                        break;
                }
            }


            function extractTypeParameters(reflection:ITypeParameterContainer, typeParameters?:ts.NodeArray<ts.TypeParameterDeclaration>, typeArguments?:Type[], context?:{[name:string]:Type}):{[name:string]:Type} {
                var result:{[name:string]:Type} = {};

                if (context) {
                    for (var key in context) {
                        result[key] = context[key];
                    }
                }

                if (typeParameters) {
                    typeParameters.forEach((declaration:ts.TypeParameterDeclaration, index:number) => {
                        var name = declaration.symbol.name;
                        if (typeArguments && typeArguments[index]) {
                            result[name] = typeArguments[index];
                        } else {
                            var typeParameter = new TypeParameterType();
                            typeParameter.name = declaration.symbol.name;
                            if (declaration.constraint) typeParameter.constraint = extractType(declaration.constraint, checker.getTypeOfNode(declaration.constraint));
                            result[name] = typeParameter;

                            if (!reflection.typeParameters) reflection.typeParameters = [];
                            reflection.typeParameters.push(typeParameter);
                        }
                    });
                }

                return result;
            }


            function extractTypeArguments(typeArguments:ts.NodeArray<ts.TypeNode>):Type[] {
                var result:Type[] = [];

                if (typeArguments) {
                    typeArguments.forEach((node:ts.TypeNode) => {
                        result.push(extractType(node, checker.getTypeOfNode(node)));
                    });
                }

                return result;
            }


            /**
             * Apply all children of the given node to the given target reflection.
             *
             * @param node    The node whose children should be analyzed.
             * @param target  The reflection the children should be copied to.
             * @return The resulting reflection.
             */
            function inherit(node:ts.Node, target:ContainerReflection, typeArguments?:Type[]):Reflection {
                var wasInherit       = isInherit;
                var oldInherited     = inherited;
                var oldInheritParent = inheritParent;
                isInherit     = true;
                inheritParent = node;
                inherited     = target.children ? Object.keys(target.children) : [];

                visit(node, target, typeArguments);

                isInherit     = wasInherit;
                inherited     = oldInherited;
                inheritParent = oldInheritParent;
                return target;
            }


            /**
             * Analyze the given node and create a suitable reflection.
             *
             * This function checks the kind of the node and delegates to the matching function implementation.
             *
             * @param node   The compiler node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visit(node:ts.Node, scope:ContainerReflection, typeArguments?:Type[]):Reflection {
                switch (node.kind) {
                    case ts.SyntaxKind['ClassDeclaration']:
                        return visitClassDeclaration(<ts.ClassDeclaration>node, scope, typeArguments);
                    case ts.SyntaxKind['InterfaceDeclaration']:
                        return visitInterfaceDeclaration(<ts.InterfaceDeclaration>node, scope, typeArguments);
                    case ts.SyntaxKind['SourceFile']:
                        return visitSourceFile(<ts.SourceFile>node, scope);
                    case ts.SyntaxKind['ModuleDeclaration']:
                        return visitModuleDeclaration(<ts.ModuleDeclaration>node, scope);
                    case ts.SyntaxKind['VariableStatement']:
                        return visitVariableStatement(<ts.VariableStatement>node, scope);
                    case ts.SyntaxKind['Property']:
                    case ts.SyntaxKind['PropertyAssignment']:
                    case ts.SyntaxKind['VariableDeclaration']:
                        return visitVariableDeclaration(<ts.VariableDeclaration>node, scope);
                    case ts.SyntaxKind['EnumDeclaration']:
                        return visitEnumDeclaration(<ts.EnumDeclaration>node, scope);
                    case ts.SyntaxKind['EnumMember']:
                        return visitEnumMember(<ts.EnumMember>node, scope);
                    case ts.SyntaxKind['Constructor']:
                    case ts.SyntaxKind['ConstructSignature']:
                        return visitConstructor(<ts.ConstructorDeclaration>node, scope);
                    case ts.SyntaxKind['Method']:
                    case ts.SyntaxKind['FunctionDeclaration']:
                        return visitFunctionDeclaration(<ts.MethodDeclaration>node, scope);
                    case ts.SyntaxKind['GetAccessor']:
                        return visitAccessorDeclaration(<ts.SignatureDeclaration>node, scope, SignatureType.Get);
                    case ts.SyntaxKind['SetAccessor']:
                        return visitAccessorDeclaration(<ts.SignatureDeclaration>node, scope, SignatureType.Set);
                    case ts.SyntaxKind['CallSignature']:
                        return visitSignatureDeclaration(<ts.SignatureDeclaration>node, scope, SignatureType.Call);
                    case ts.SyntaxKind['IndexSignature']:
                        return visitSignatureDeclaration(<ts.SignatureDeclaration>node, scope, SignatureType.Index);
                    case ts.SyntaxKind['Block']:
                    case ts.SyntaxKind['ModuleBlock']:
                        return visitBlock(<ts.Block>node, scope);
                    case ts.SyntaxKind['ObjectLiteral']:
                        return visitObjectLiteral(<ts.ObjectLiteral>node, scope);
                    case ts.SyntaxKind['TypeLiteral']:
                        return visitTypeLiteral(<ts.TypeLiteralNode>node, scope);
                    default:
                        console.log('Unhandeled: ' + ts.SyntaxKind[node.kind]);
                        return null;
                }
            }


            /**
             * Analyze the given block node and create a suitable reflection.
             *
             * @param node   The source file node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitBlock(node:ts.Block, scope:ContainerReflection):Reflection {
                if (node.statements) {
                    node.statements.forEach((statement) => {
                        visit(statement, scope);
                    });
                }

                return scope;
            }


            /**
             * Analyze the given source file node and create a suitable reflection.
             *
             * @param node   The source file node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitSourceFile(node:ts.SourceFile, scope:ContainerReflection):Reflection {
                // TypeScript 1.3: ts.isDeclarationFile(node)
                if (node.flags & ts.NodeFlags['DeclarationFile']) {
                    return;

                // TypeScript 1.3: ts.shouldEmitToOwnFile(node, settings.compilerOptions)
                } else if ((ts.isExternalModule(node) || !settings.compilerOptions.out)) {
                    scope = createDeclaration(scope, node, ReflectionKind.ExternalModule, node.filename);
                }

                visitBlock(node, scope);
                return scope;
            }


            /**
             * Analyze the given module node and create a suitable reflection.
             *
             * @param node   The module node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitModuleDeclaration(node:ts.ModuleDeclaration, scope:ContainerReflection):Reflection {
                var reflection = createDeclaration(scope, node, ReflectionKind.Module);

                if (reflection && node.body) {
                    visit(node.body, reflection);
                }

                return reflection;
            }


            /**
             * Analyze the given class declaration node and create a suitable reflection.
             *
             * @param node   The class declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitClassDeclaration(node:ts.ClassDeclaration, scope:ContainerReflection, typeArguments?:Type[]):Reflection {
                var reflection;
                if (isInherit && inheritParent == node) {
                    reflection = scope;
                } else {
                    reflection = createDeclaration(scope, node, ReflectionKind.Class);
                }

                if (reflection) {
                    var oldTypeParameters = typeParameters;
                    typeParameters = extractTypeParameters(reflection, node.typeParameters, typeArguments);

                    if (node.members) {
                        node.members.forEach((member) => {
                            visit(member, reflection);
                        });
                    }

                    if (node.baseType) {
                        var type = checker.getTypeOfNode(node.baseType);
                        type.symbol.declarations.forEach((declaration) => {
                            inherit(declaration, reflection, extractTypeArguments(node.baseType.typeArguments));
                        });
                    }

                    typeParameters = oldTypeParameters;
                }

                return reflection;
            }


            /**
             * Analyze the given interface declaration node and create a suitable reflection.
             *
             * @param node   The interface declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitInterfaceDeclaration(node:ts.InterfaceDeclaration, scope:ContainerReflection, typeArguments?:Type[]):Reflection {
                var reflection;
                if (isInherit && inheritParent == node) {
                    reflection = scope;
                } else {
                    reflection = createDeclaration(scope, node, ReflectionKind.Interface);
                }

                if (reflection) {
                    var oldTypeParameters = typeParameters;
                    typeParameters = extractTypeParameters(reflection, node.typeParameters, typeArguments);

                    if (node.members) {
                        node.members.forEach((member, isInherit) => {
                            visit(member, reflection);
                        });
                    }

                    if (node.baseTypes) {
                        node.baseTypes.forEach((baseType:ts.TypeReferenceNode) => {
                            var type = checker.getTypeOfNode(baseType);
                            if (!type || !type.symbol) {
                                console.log('Error: No type for ' + baseType.typeName['text']);
                                return;
                            }

                            type.symbol.declarations.forEach((declaration) => {
                                inherit(declaration, reflection, extractTypeArguments(baseType.typeArguments));
                            });
                        });
                    }

                    typeParameters = oldTypeParameters;
                }

                return reflection;
            }


            /**
             * Analyze the given variable statement node and create a suitable reflection.
             *
             * @param node   The variable statement node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitVariableStatement(node:ts.VariableStatement, scope:ContainerReflection):Reflection {
                if (node.declarations) {
                    node.declarations.forEach((variableDeclaration) => {
                        visitVariableDeclaration(variableDeclaration, scope);
                    });
                }

                return scope;
            }


            /**
             * Analyze the given variable declaration node and create a suitable reflection.
             *
             * @param node   The variable declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitVariableDeclaration(node:ts.VariableDeclaration, scope:ContainerReflection):Reflection {
                var kind = scope.kind & ReflectionKind.ClassOrInterface ? ReflectionKind.Property : ReflectionKind.Variable;
                var variable = createDeclaration(scope, node, kind);
                if (variable) {
                    extractDefaultValue(node, variable);

                    if (variable.kind == kind && variable.callSignatures) {
                        variable.kind = scope.kind & ReflectionKind.ClassOrInterface ? ReflectionKind.Method : ReflectionKind.Function;
                    } else {
                        variable.type = extractType(node.type, checker.getTypeOfNode(node));
                    }
                }

                return variable;
            }


            /**
             * Analyze the given enumeration declaration node and create a suitable reflection.
             *
             * @param node   The enumeration declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitEnumDeclaration(node:ts.EnumDeclaration, scope:ContainerReflection):Reflection {
                var enumeration = createDeclaration(scope, node, ReflectionKind.Enum);

                if (enumeration && node.members) {
                    node.members.forEach((node) => {
                        visitEnumMember(node, enumeration);
                    });
                }

                return enumeration;
            }


            /**
             * Analyze the given enumeration member node and create a suitable reflection.
             *
             * @param node   The enumeration member node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitEnumMember(node:ts.EnumMember, scope:ContainerReflection):Reflection {
                var member = createDeclaration(scope, node, ReflectionKind.EnumMember);
                if (member) {
                    extractDefaultValue(node, member);
                }

                return member;
            }


            /**
             * Analyze the given constructor declaration node and create a suitable reflection.
             *
             * @param node   The constructor declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitConstructor(node:ts.ConstructorDeclaration, scope:ContainerReflection):Reflection {
                var hasBody = !!node.body;
                var method = createDeclaration(scope, node, ReflectionKind.Constructor);
                if (method) {
                    if (!hasBody || !method.constructorSignatures) {
                        createSignature(method, node, SignatureType.Constructor);
                    } else {
                        createSourceReference(method, node);
                    }
                }

                return method;
            }


            /**
             * Analyze the given function declaration node and create a suitable reflection.
             *
             * @param node   The function declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitFunctionDeclaration(node:ts.FunctionDeclaration, scope:ContainerReflection):Reflection {
                var kind = scope.kind & ReflectionKind.ClassOrInterface ? ReflectionKind.Method : ReflectionKind.Function;
                var hasBody = !!node.body;
                var method = createDeclaration(scope, node, kind);

                if (method) {
                    if (!hasBody || !method.callSignatures) {
                        createSignature(method, node, SignatureType.Call);
                    } else {
                        createSourceReference(method, node);
                    }
                }

                return method;
            }


            /**
             * Analyze the given signature declaration node and create a suitable reflection.
             *
             * @param node   The signature declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @param type   The type (call, index or constructor) of the signature.
             * @return The resulting reflection or NULL.
             */
            function visitSignatureDeclaration(node:ts.SignatureDeclaration, scope:ContainerReflection, type?:SignatureType):Reflection {
                if (scope instanceof DeclarationReflection) {
                    createSignature(<DeclarationReflection>scope, node, type || SignatureType.Call);
                }

                return scope;
            }


            /**
             * Analyze the given getter or setter declaration node and create a suitable reflection.
             *
             * @param node   The signature declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitAccessorDeclaration(node:ts.SignatureDeclaration, scope:ContainerReflection, type:SignatureType):Reflection {
                var accessor = createDeclaration(scope, node, ReflectionKind.Accessor);
                if (accessor) {
                    createSignature(accessor, node, type);
                }

                return accessor;
            }


            /**
             * Analyze the given object literal node and create a suitable reflection.
             *
             * @param node   The object literal node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitObjectLiteral(node:ts.ObjectLiteral, scope:ContainerReflection):Reflection {
                if (node.properties) {
                    node.properties.forEach((node) => {
                        visit(node, scope);
                    });
                }

                return scope;
            }


            /**
             * Analyze the given type literal node and create a suitable reflection.
             *
             * @param node   The type literal node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitTypeLiteral(node:ts.TypeLiteralNode, scope:ContainerReflection):Reflection {
                if (node.members) {
                    node.members.forEach((node) => {
                        visit(node, scope);
                    });
                }

                return scope;
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