/// <reference path="../PluginHost.ts" />

module td
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


    export class Converter extends PluginHost
    {
        constructor() {
            super();
            this.plugins = Converter.loadPlugins(this);
        }


        /**
         * Compile the given source files and create a reflection tree for them.
         *
         * @param fileNames  Array of the file names that should be compiled.
         * @param settings   The settings that should be used to compile the files.
         */
        convert(fileNames:string[], settings:Settings):IConverterResult {
            var dispatcher = this;
            var host       = this.createCompilerHost(settings.compilerOptions);
            var program    = ts.createProgram(fileNames, settings.compilerOptions, host);
            var checker    = program.getTypeChecker(true);
            var project    = new ProjectReflection(settings.name);

            var isInherit             = false;
            var inheritParent:ts.Node = null;
            var inherited:string[]    = [];
            var typeParameters:{[name:string]:Type} = {};

            return compile();


            function compile():IConverterResult {
                var errors = program.getDiagnostics();
                errors = errors.concat(checker.getDiagnostics());

                program.getSourceFiles().forEach((sourceFile) => {
                    visitSourceFile(sourceFile, project);
                });

                project.reflections.forEach((reflection) => {
                    dispatcher.dispatch('resolve', project, reflection)
                });

                return {
                    errors: errors,
                    project: project
                }
            }


            function registerReflection(reflection:Reflection, node:ts.Node) {
                var id = project.reflections.length;
                reflection.id = id;
                project.reflections.push(reflection);

                if (node.id && !project.nodeMapping[node.id]) {
                    project.nodeMapping[node.id] = id;
                }

                if (node.symbol && node.symbol.id && !project.symbolMapping[node.symbol.id]) {
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

                    if (container.kind == ReflectionKind.Class && node.parent.kind != ts.SyntaxKind['ClassDeclaration']) {
                        child.isStatic = true;
                    }

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


            function createSignature(container:DeclarationReflection, node:ts.SignatureDeclaration, name:string, kind:ReflectionKind):SignatureReflection {
                var signature = new SignatureReflection(container, name, kind);
                withTypeParameters(signature, node.typeParameters, null, true, () => {
                    node.parameters.forEach((parameter:ts.ParameterDeclaration) => {
                        createParameter(signature, parameter);
                    });

                    registerReflection(signature, node);

                    if (kind == ReflectionKind.CallSignature) {
                        var type = checker.getTypeOfNode(node);
                        checker.getSignaturesOfType(type, ts.SignatureKind.Call).forEach((tsSignature) => {
                            if (tsSignature.declaration == node) {
                                signature.type = extractType(node.type, checker.getReturnTypeOfSignature(tsSignature));
                            }
                        });
                    }

                    if (!signature.type) {
                        signature.type = extractType(node.type, checker.getTypeOfNode(node));
                    }

                    createSourceReference(signature, node);
                    createComment(signature, node);
                });

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
                var file:SourceFile;
                if (!project.files[fileName]) {
                    file = project.files[fileName] = new SourceFile(fileName);
                } else {
                    file = project.files[fileName];
                }

                var position = sourceFile.getLineAndCharacterFromPosition(node.pos);

                if (!reflection.sources) reflection.sources = [];
                reflection.sources.push({
                    file:      file,
                    fileName:  fileName,
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
                    return extractIntrinsicType(node, <ts.IntrinsicType>type);
                } else if (type.flags & ts.TypeFlags['Enum']) {
                    return extractEnumType(node, type);
                } else if (type.flags & ts.TypeFlags['TypeParameter']) {
                    return extractTypeParameterType(<ts.TypeReferenceNode>node, type);
                } else if (type.flags & ts.TypeFlags['StringLiteral']) {
                    return extractStringLiteralType(node, <ts.StringLiteralType>type);
                } else if (type.flags & ts.TypeFlags['ObjectType']) {
                    return extractObjectType(node, type);
                } else {
                    return extractUnknownType(node, type);
                }
            }


            function extractIntrinsicType(node:ts.TypeNode, type:ts.IntrinsicType):Type {
                return new IntrinsicType(type.intrinsicName);
            }


            function extractEnumType(node:ts.TypeNode, type:ts.Type):Type {
                return new ReferenceType(type.symbol.id);
            }


            function extractTypeParameterType(node:ts.TypeReferenceNode, type:ts.Type):Type {
                var name = node.typeName['text'];
                if (typeParameters[name]) {
                    return typeParameters[name];
                } else {
                    var result = new TypeParameterType();
                    result.name = name;
                    return result;
                }
            }


            function extractStringLiteralType(node:ts.TypeNode, type:ts.StringLiteralType):Type {
                return new StringLiteralType(type.text);
            }


            function extractObjectType(node:ts.TypeNode, type:ts.Type):Type {
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
            }


            function extractUnknownType(node:ts.TypeNode, type:ts.Type):Type {
                return new UnknownType(checker.typeToString(type));
            }


            function extractDefaultValue(node:ts.VariableDeclaration, reflection:IDefaultValueContainer) {
                if (!node.initializer) return;

                if (reflection instanceof DeclarationReflection) {
                    var declaration = <DeclarationReflection>reflection;
                    switch (node.initializer.kind) {
                        case ts.SyntaxKind['ArrowFunction']:
                        case ts.SyntaxKind['FunctionExpression']:
                            visitCallSignatureDeclaration(<ts.SignatureDeclaration>node.initializer, declaration);
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


            function extractTypeArguments(typeArguments:ts.NodeArray<ts.TypeNode>):Type[] {
                var result:Type[] = [];

                if (typeArguments) {
                    typeArguments.forEach((node:ts.TypeNode) => {
                        result.push(extractType(node, checker.getTypeOfNode(node)));
                    });
                }

                return result;
            }


            function withTypeParameters(reflection:ITypeParameterContainer, parameters:ts.NodeArray<ts.TypeParameterDeclaration>, typeArguments:Type[], keepTypeParameters:boolean, callback:Function) {
                var oldTypeParameters = typeParameters;
                typeParameters = {};

                if (keepTypeParameters) {
                    for (var key in oldTypeParameters) {
                        typeParameters[key] = oldTypeParameters[key];
                    }
                }

                if (parameters) {
                    parameters.forEach((declaration:ts.TypeParameterDeclaration, index:number) => {
                        var name = declaration.symbol.name;
                        if (typeArguments && typeArguments[index]) {
                            typeParameters[name] = typeArguments[index];
                        } else {
                            var typeParameter = new TypeParameterType();
                            typeParameter.name = declaration.symbol.name;
                            if (declaration.constraint) typeParameter.constraint = extractType(declaration.constraint, checker.getTypeOfNode(declaration.constraint));
                            typeParameters[name] = typeParameter;

                            if (!reflection.typeParameters) reflection.typeParameters = [];
                            reflection.typeParameters.push(typeParameter);
                        }
                    });
                }

                callback();
                typeParameters = oldTypeParameters;
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
                        return visitGetAccessorDeclaration(<ts.SignatureDeclaration>node, scope);
                    case ts.SyntaxKind['SetAccessor']:
                        return visitSetAccessorDeclaration(<ts.SignatureDeclaration>node, scope);
                    case ts.SyntaxKind['CallSignature']:
                        return visitCallSignatureDeclaration(<ts.SignatureDeclaration>node, <DeclarationReflection>scope);
                    case ts.SyntaxKind['IndexSignature']:
                        return visitIndexSignatureDeclaration(<ts.SignatureDeclaration>node, <DeclarationReflection>scope);
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
                    var prefered = [ts.SyntaxKind['ClassDeclaration'], ts.SyntaxKind['InterfaceDeclaration'], ts.SyntaxKind['EnumDeclaration']];
                    var statements = [];
                    node.statements.forEach((statement) => {
                        if (prefered.indexOf(statement.kind) != -1) {
                            visit(statement, scope);
                        } else {
                            statements.push(statement);
                        }
                    });

                    statements.forEach((statement) => {
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
                    withTypeParameters(reflection, node.typeParameters, typeArguments, false, () => {
                        if (node.members) {
                            node.members.forEach((member) => {
                                visit(member, reflection);
                            });
                        }

                        if (node.baseType) {
                            var type = checker.getTypeOfNode(node.baseType);
                            if (!type || !type.symbol) {
                                console.log('Error: No type for ' + checker.typeToString(type));
                                return;
                            }

                            type.symbol.declarations.forEach((declaration) => {
                                inherit(declaration, reflection, extractTypeArguments(node.baseType.typeArguments));
                            });
                        }
                    });
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
                    withTypeParameters(reflection, node.typeParameters, typeArguments, false, () => {
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
                    });
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
                        var signature = createSignature(method, node, '__constructor', ReflectionKind.ConstructorSignature);
                        method.constructorSignatures = method.constructorSignatures || [];
                        method.constructorSignatures.push(signature);
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
                        var signature = createSignature(method, node, '__call', ReflectionKind.CallSignature);
                        method.callSignatures = method.callSignatures || [];
                        method.callSignatures.push(signature);
                    } else {
                        createSourceReference(method, node);
                    }
                }

                return method;
            }


            /**
             * Analyze the given call signature declaration node and create a suitable reflection.
             *
             * @param node   The signature declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @param type   The type (call, index or constructor) of the signature.
             * @return The resulting reflection or NULL.
             */
            function visitCallSignatureDeclaration(node:ts.SignatureDeclaration, scope:DeclarationReflection):Reflection {
                if (scope instanceof DeclarationReflection) {
                    var signature = createSignature(<DeclarationReflection>scope, node, '__call', ReflectionKind.CallSignature);
                    scope.callSignatures = scope.callSignatures || [];
                    scope.callSignatures.push(signature);
                }

                return scope;
            }


            /**
             * Analyze the given index signature declaration node and create a suitable reflection.
             *
             * @param node   The signature declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @param type   The type (call, index or constructor) of the signature.
             * @return The resulting reflection or NULL.
             */
            function visitIndexSignatureDeclaration(node:ts.SignatureDeclaration, scope:DeclarationReflection):Reflection {
                if (scope instanceof DeclarationReflection) {
                    var signature = createSignature(<DeclarationReflection>scope, node, '__index', ReflectionKind.IndexSignature);
                    signature.name = '__index';
                    scope.indexSignature = signature;
                }

                return scope;
            }


            /**
             * Analyze the given getter declaration node and create a suitable reflection.
             *
             * @param node   The signature declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitGetAccessorDeclaration(node:ts.SignatureDeclaration, scope:ContainerReflection):Reflection {
                var accessor = createDeclaration(scope, node, ReflectionKind.Accessor);
                if (accessor) {
                    var signature = createSignature(accessor, node, '__get', ReflectionKind.Getter);
                    signature.name = '__get';
                    accessor.getSignature = signature;
                }

                return accessor;
            }


            /**
             * Analyze the given setter declaration node and create a suitable reflection.
             *
             * @param node   The signature declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitSetAccessorDeclaration(node:ts.SignatureDeclaration, scope:ContainerReflection):Reflection {
                var accessor = createDeclaration(scope, node, ReflectionKind.Accessor);
                if (accessor) {
                    var signature = createSignature(accessor, node, '__set', ReflectionKind.Setter);
                    signature.name = '__set';
                    accessor.setSignature = signature;
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
            function parseComment(text:string, comment:Comment = new Comment()):Comment {
                function consumeTypeData(line:string):string {
                    line = line.replace(/^\{[^\}]*\}/, '');
                    line = line.replace(/^\[[^\]]*\]/, '');
                    return line.trim();
                }

                text = text.replace(/^\s*\/\*+/, '');
                text = text.replace(/\*+\/\s*$/, '');

                var currentTag:CommentTag;
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

                        currentTag = new CommentTag(tagName, paramName, line);
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