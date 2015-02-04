/// <reference path="../PluginHost.ts" />

module td
{
    /**
     * Return a string that explains the given flag bit mask.
     *
     * @param value  A bit mask containing TypeScript.PullElementFlags bits.
     * @returns A string describing the given bit mask.
     */
    export function flagsToString(value:any, flags:any):string {
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


    export class Converter extends PluginHost<ConverterPlugin>
    {
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



        constructor() {
            super();
            Converter.loadPlugins(this);
        }


        /**
         * Compile the given source files and create a reflection tree for them.
         *
         * @param fileNames  Array of the file names that should be compiled.
         * @param settings   The settings that should be used to compile the files.
         */
        convert(fileNames:string[], settings:Settings):IConverterResult {
            for (var i = 0, c = fileNames.length; i < c; i++) {
                fileNames[i] = ts.normalizePath(ts.normalizeSlashes(fileNames[i]));
            }

            var dispatcher = this;
            var host    = this.createCompilerHost(settings.compilerOptions);
            var program = ts.createProgram(fileNames, settings.compilerOptions, host);
            var checker = program.getTypeChecker(true);
            var project = new ProjectReflection(settings.name);
            var event   = new CompilerEvent(checker, project, settings);

            var isExternal = false;
            var externalPattern = settings.externalPattern ? new Minimatch.Minimatch(settings.externalPattern) : null;
            var symbolID = -1024;
            var isInherit = false;
            var inheritParent:ts.Node = null;
            var inherited:string[] = [];
            var typeParameters:{[name:string]:Type} = {};

            return compile();


            function compile():IConverterResult {
                var errors = program.getDiagnostics();
                errors = errors.concat(checker.getDiagnostics());

                var converterEvent = new ConverterEvent(checker, project, settings);
                dispatcher.dispatch(Converter.EVENT_BEGIN, converterEvent);

                program.getSourceFiles().forEach((sourceFile) => {
                    visitSourceFile(sourceFile, project);
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


            function getSymbolID(symbol:ts.Symbol):number {
                if (!symbol) return null;
                if (!symbol.id) symbol.id = symbolID--;
                return symbol.id;
            }


            function registerReflection(reflection:Reflection, node:ts.Node) {
                project.reflections[reflection.id] = reflection;

                var id = getSymbolID(node.symbol);
                if (!isInherit && id && !project.symbolMapping[id]) {
                    project.symbolMapping[id] = reflection.id;
                }
            }


            function createDeclaration(container:ContainerReflection, node:ts.Node, kind:ReflectionKind, name?:string):DeclarationReflection {
                if (!name) {
                    if (!node.symbol) return null;
                    name = node.symbol.name;
                }

                var child:DeclarationReflection;
                var isStatic = !!(node.flags & ts.NodeFlags.Static);
                if (container.kind == ReflectionKind.Class && (!node.parent || node.parent.kind != ts.SyntaxKind.ClassDeclaration)) {
                    isStatic = true;
                }

                var isPrivate = !!(node.flags & ts.NodeFlags.Private);
                if (isInherit && isPrivate) {
                    return null;
                }

                if (!container.children) container.children = [];
                container.children.forEach((n) => {
                    if (n.name == name && n.flags.isStatic == isStatic) child = n;
                });

                if (!child) {
                    child = new DeclarationReflection(container, name, kind);
                    child.setFlag(ReflectionFlag.Static,    isStatic);
                    child.setFlag(ReflectionFlag.External,  isExternal);
                    child.setFlag(ReflectionFlag.Private,   isPrivate);
                    child.setFlag(ReflectionFlag.Protected, !!(node.flags & ts.NodeFlags.Protected));
                    child.setFlag(ReflectionFlag.Public,    !!(node.flags & ts.NodeFlags.Public));
                    child.setFlag(ReflectionFlag.Optional,  !!(node['questionToken']));
                    child.setFlag(ReflectionFlag.Exported,  container.flags.isExported || !!(node.flags & ts.NodeFlags.Export));

                    container.children.push(child);
                    registerReflection(child, node);

                    if (isInherit && node.parent == inheritParent) {
                        if (!child.inheritedFrom) {
                            child.inheritedFrom = createReferenceType(node.symbol);
                            child.getAllSignatures().forEach((signature) => {
                                signature.inheritedFrom = createReferenceType(node.symbol);
                            });
                        }
                    }
                } else {
                    if (child.kind != kind) {
                        var weights = [ReflectionKind.Module, ReflectionKind.Enum, ReflectionKind.Class];
                        var kindWeight = weights.indexOf(kind);
                        var childKindWeight = weights.indexOf(child.kind);
                        if (kindWeight > childKindWeight) {
                            child.kind = kind;
                        }
                    }

                    if (isInherit && node.parent == inheritParent && inherited.indexOf(name) != -1) {
                        if (!child.overwrites) {
                            child.overwrites = createReferenceType(node.symbol);
                            child.getAllSignatures().forEach((signature) => {
                                signature.overwrites = createReferenceType(node.symbol);
                            });
                        }
                        return null;
                    }
                }

                event.reflection = child;
                event.node = node;
                dispatcher.dispatch(Converter.EVENT_CREATE_DECLARATION, event);

                return child;
            }


            function createReferenceType(symbol:ts.Symbol):ReferenceType {
                var name = checker.symbolToString(symbol);
                var id = getSymbolID(symbol);
                return new ReferenceType(name, id);
            }


            function createSignature(container:DeclarationReflection, node:ts.SignatureDeclaration, name:string, kind:ReflectionKind):SignatureReflection {
                var signature = new SignatureReflection(container, name, kind);
                withTypeParameters(signature, node.typeParameters, null, true, () => {
                    node.parameters.forEach((parameter:ts.ParameterDeclaration) => {
                        createParameter(signature, parameter);
                    });

                    registerReflection(signature, node);

                    if (kind == ReflectionKind.CallSignature) {
                        var type = checker.getTypeAtLocation(node);
                        checker.getSignaturesOfType(type, ts.SignatureKind.Call).forEach((tsSignature) => {
                            if (tsSignature.declaration == node) {
                                signature.type = extractType(signature, node.type, checker.getReturnTypeOfSignature(tsSignature));
                            }
                        });
                    }

                    if (!signature.type) {
                        if (node.type) {
                            signature.type = extractType(signature, node.type, checker.getTypeAtLocation(node.type));
                        } else {
                            signature.type = extractType(signature, node, checker.getTypeAtLocation(node));
                        }
                    }

                    if (container.inheritedFrom) {
                        signature.inheritedFrom = createReferenceType(node.symbol);
                    }

                    event.reflection = signature;
                    event.node = node;
                    dispatcher.dispatch(Converter.EVENT_CREATE_SIGNATURE, event);
                });

                return signature;
            }


            function createParameter(signature:SignatureReflection, node:ts.ParameterDeclaration) {
                var parameter = new ParameterReflection(signature, node.symbol.name, ReflectionKind.Parameter);
                parameter.type = extractType(parameter, node.type, checker.getTypeAtLocation(node));
                parameter.setFlag(ReflectionFlag.Optional, !!node.questionToken);
                parameter.setFlag(ReflectionFlag.Rest, !!node.dotDotDotToken);

                extractDefaultValue(node, parameter);
                parameter.setFlag(ReflectionFlag.DefaultValue, !!parameter.defaultValue);

                if (!signature.parameters) signature.parameters = [];
                signature.parameters.push(parameter);

                registerReflection(parameter, node);

                event.reflection = parameter;
                event.node = node;
                dispatcher.dispatch(Converter.EVENT_CREATE_PARAMETER, event);
            }


            function createTypeParameter(reflection:ITypeParameterContainer, typeParameter:TypeParameterType, node:ts.Node) {
                if (!reflection.typeParameters) reflection.typeParameters = [];
                var typeParameterReflection = new TypeParameterReflection(reflection, typeParameter);

                registerReflection(typeParameterReflection, node);
                reflection.typeParameters.push(typeParameterReflection);

                event.reflection = typeParameterReflection;
                event.node = node;
                dispatcher.dispatch(Converter.EVENT_CREATE_TYPE_PARAMETER, event);
            }


            function extractType(target:Reflection, node:ts.Node, type:ts.Type):Type {
                if (node && node['typeName'] && node['typeName'].text && type && (!type.symbol || (node['typeName'].text != type.symbol.name))) {
                    return new ReferenceType(node['typeName'].text, null, target.findReflectionByName(node['typeName'].text));
                } else if (type.flags & ts.TypeFlags.Intrinsic) {
                    return extractIntrinsicType(<ts.IntrinsicType>type);
                } else if (type.flags & ts.TypeFlags.Enum) {
                    return extractEnumType(type);
                } else if (type.flags & ts.TypeFlags.Tuple) {
                    return extractTupleType(target, <ts.TupleTypeNode>node, <ts.TupleType>type);
                } else if (type.flags & ts.TypeFlags.Union) {
                    return extractUnionType(target, <ts.UnionTypeNode>node, <ts.UnionType>type);
                } else if (type.flags & ts.TypeFlags.TypeParameter) {
                    return extractTypeParameterType(<ts.TypeReferenceNode>node, type);
                } else if (type.flags & ts.TypeFlags.StringLiteral) {
                    return extractStringLiteralType(<ts.StringLiteralType>type);
                } else if (type.flags & ts.TypeFlags.ObjectType) {
                    return extractObjectType(target, node, type);
                } else {
                    return extractUnknownType(type);
                }
            }


            function extractIntrinsicType(type:ts.IntrinsicType):Type {
                return new IntrinsicType(type.intrinsicName);
            }


            function extractEnumType(type:ts.Type):Type {
                return createReferenceType(type.symbol);
            }


            function extractTupleType(target:Reflection, node:ts.TupleTypeNode, type:ts.TupleType):Type {
                var elements = [];
                if (node.elementTypes) {
                    node.elementTypes.forEach((elementNode:ts.TypeNode) => {
                        elements.push(extractType(target, elementNode, checker.getTypeAtLocation(elementNode)));
                    });
                } else {
                    type.elementTypes.forEach((type:ts.Type) => {
                        elements.push(extractType(target, null, type));
                    });
                }

                return new TupleType(elements);
            }


            function extractUnionType(target:Reflection, node:ts.UnionTypeNode, type:ts.UnionType):Type {
                var types = [];
                if (node && node.types) {
                    node.types.forEach((typeNode:ts.TypeNode) => {
                        types.push(extractType(target, typeNode, checker.getTypeAtLocation(typeNode)));
                    });
                } else {
                    type.types.forEach((type:ts.Type) => {
                        types.push(extractType(target, null, type));
                    });
                }

                return new UnionType(types);
            }


            function extractTypeParameterType(node:ts.TypeReferenceNode, type:ts.Type):Type {
                if (node && node.typeName) {
                    var name = node.typeName['text'];
                    if (typeParameters[name]) {
                        return typeParameters[name];
                    } else {
                        var result = new TypeParameterType();
                        result.name = name;
                        return result;
                    }
                }
            }


            function extractStringLiteralType(type:ts.StringLiteralType):Type {
                return new StringLiteralType(type.text);
            }


            function extractObjectType(target:Reflection, node:ts.Node, type:ts.Type):Type {
                if (node && node['elementType']) {
                    var result = extractType(target, node['elementType'], checker.getTypeAtLocation(node['elementType']));
                    if (result) {
                        result.isArray = true;
                        return result;
                    } else {
                        return new IntrinsicType('object');
                    }
                } else if (type.symbol) {
                    if (type.flags & ts.TypeFlags.Anonymous) {
                        if (type.symbol.flags & ts.SymbolFlags['TypeLiteral']) {
                            var declaration = new DeclarationReflection();
                            declaration.kind = ReflectionKind.TypeLiteral;
                            declaration.name = '__type';
                            declaration.parent = target;

                            registerReflection(declaration, node);
                            event.reflection = declaration;
                            event.node = node;
                            dispatcher.dispatch(Converter.EVENT_CREATE_DECLARATION, event);

                            type.symbol.declarations.forEach((node) => {
                                visit(node, declaration);
                            });
                            return new ReflectionType(declaration);
                        } else {
                            return new IntrinsicType('object');
                        }
                    } else {
                        var referenceType = createReferenceType(type.symbol);

                        if (node && node['typeArguments']) {
                            referenceType.typeArguments = [];
                            node['typeArguments'].forEach((node:ts.Node) => {
                                referenceType.typeArguments.push(extractType(target, node, checker.getTypeAtLocation(node)));
                            });
                        } else if (type && type['typeArguments']) {
                            referenceType.typeArguments = [];
                            type['typeArguments'].forEach((type:ts.Type) => {
                                referenceType.typeArguments.push(extractType(target, null, type));
                            });
                        }

                        return referenceType;
                    }
                } else {
                    return new IntrinsicType('object');
                }
            }


            function extractUnknownType(type:ts.Type):Type {
                return new UnknownType(checker.typeToString(type));
            }


            function extractDefaultValue(node:ts.VariableDeclaration|ts.ParameterDeclaration|ts.EnumMember, reflection:IDefaultValueContainer) {
                if (!node.initializer) return;
                switch (node.initializer.kind) {
                    case ts.SyntaxKind.StringLiteral:
                        reflection.defaultValue = '"' + (<ts.LiteralExpression>node.initializer).text + '"';
                        break;
                    case ts.SyntaxKind.NumericLiteral:
                        reflection.defaultValue = (<ts.LiteralExpression>node.initializer).text;
                        break;
                    case ts.SyntaxKind.TrueKeyword:
                        reflection.defaultValue = 'true';
                        break;
                    case ts.SyntaxKind.FalseKeyword:
                        reflection.defaultValue = 'false';
                        break;
                    default:
                        var source = ts.getSourceFileOfNode(node);
                        reflection.defaultValue = source.text.substring(node.initializer.pos, node.initializer.end);
                        break;
                }
            }


            function extractTypeArguments(target:Reflection, typeArguments:ts.NodeArray<ts.TypeNode>):Type[] {
                var result:Type[] = [];

                if (typeArguments) {
                    typeArguments.forEach((node:ts.TypeNode) => {
                        result.push(extractType(target, node, checker.getTypeAtLocation(node)));
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
                            if (declaration.constraint) {
                                typeParameter.constraint = extractType(reflection, declaration.constraint, checker.getTypeAtLocation(declaration.constraint));
                            }
                            typeParameters[name] = typeParameter;
                            createTypeParameter(reflection, typeParameter, declaration);
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
                var wasInherit = isInherit;
                var oldInherited = inherited;
                var oldInheritParent = inheritParent;
                isInherit = true;
                inheritParent = node;
                inherited = [];
                if (target.children) target.children.forEach((child) => {
                    inherited.push(child.name);
                });

                visit(node, target, typeArguments);

                isInherit = wasInherit;
                inherited = oldInherited;
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
                    case ts.SyntaxKind.ClassDeclaration:
                        return visitClassDeclaration(<ts.ClassDeclaration>node, scope, typeArguments);
                    case ts.SyntaxKind.InterfaceDeclaration:
                        return visitInterfaceDeclaration(<ts.InterfaceDeclaration>node, scope, typeArguments);
                    case ts.SyntaxKind.ModuleDeclaration:
                        return visitModuleDeclaration(<ts.ModuleDeclaration>node, scope);
                    case ts.SyntaxKind.VariableStatement:
                        return visitVariableStatement(<ts.VariableStatement>node, scope);
                    case ts.SyntaxKind.Property:
                    case ts.SyntaxKind.PropertyAssignment:
                    case ts.SyntaxKind.VariableDeclaration:
                        return visitVariableDeclaration(<ts.VariableDeclaration>node, scope);
                    case ts.SyntaxKind.EnumDeclaration:
                        return visitEnumDeclaration(<ts.EnumDeclaration>node, scope);
                    case ts.SyntaxKind.EnumMember:
                        return visitEnumMember(<ts.EnumMember>node, scope);
                    case ts.SyntaxKind.Constructor:
                    case ts.SyntaxKind.ConstructSignature:
                        return visitConstructor(<ts.ConstructorDeclaration>node, scope);
                    case ts.SyntaxKind.Method:
                    case ts.SyntaxKind.FunctionDeclaration:
                        return visitFunctionDeclaration(<ts.MethodDeclaration>node, scope);
                    case ts.SyntaxKind.GetAccessor:
                        return visitGetAccessorDeclaration(<ts.SignatureDeclaration>node, scope);
                    case ts.SyntaxKind.SetAccessor:
                        return visitSetAccessorDeclaration(<ts.SignatureDeclaration>node, scope);
                    case ts.SyntaxKind.CallSignature:
                    case ts.SyntaxKind.FunctionType:
                        return visitCallSignatureDeclaration(<ts.SignatureDeclaration>node, <DeclarationReflection>scope);
                    case ts.SyntaxKind.IndexSignature:
                        return visitIndexSignatureDeclaration(<ts.SignatureDeclaration>node, <DeclarationReflection>scope);
                    case ts.SyntaxKind.Block:
                    case ts.SyntaxKind.ModuleBlock:
                        return visitBlock(<ts.Block>node, scope);
                    case ts.SyntaxKind.ObjectLiteralExpression:
                        return visitObjectLiteral(<ts.ObjectLiteralExpression>node, scope);
                    case ts.SyntaxKind.TypeLiteral:
                        return visitTypeLiteral(<ts.TypeLiteralNode>node, scope);
                    case ts.SyntaxKind.ExportAssignment:
                        return visitExportAssignment(<ts.ExportAssignment>node, scope);
                    case ts.SyntaxKind.TypeAliasDeclaration:
                        return visitTypeAliasDeclaration(<ts.TypeAliasDeclaration>node, scope);
                    default:
                        // console.log('Unhandeled: ' + node.kind);
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
            function visitBlock(node:ts.Block|ts.SourceFile, scope:ContainerReflection):Reflection {
                if (node.statements) {
                    var prefered = [ts.SyntaxKind.ClassDeclaration, ts.SyntaxKind.InterfaceDeclaration, ts.SyntaxKind.EnumDeclaration];
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
                isExternal = fileNames.indexOf(node.filename) == -1;
                if (externalPattern) {
                    isExternal = isExternal || externalPattern.match(node.filename);
                }

                if (isExternal && settings.excludeExternals) {
                    return scope;
                }

                if (ts.isDeclarationFile(node)) {
                    if (!settings.includeDeclarations || node.filename.substr(-8) == 'lib.d.ts') {
                        return scope;
                    }
                }

                event.node = node;
                event.reflection = project;
                dispatcher.dispatch(Converter.EVENT_FILE_BEGIN, event);

                if (settings.mode == SourceFileMode.Modules) {
                    scope = createDeclaration(scope, node, ReflectionKind.ExternalModule, node.filename);
                    visitBlock(node, scope);
                    scope.setFlag(ReflectionFlag.Exported);
                } else {
                    visitBlock(node, scope);
                }

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

                        if (node.heritageClauses) {
                            node.heritageClauses.forEach((clause:ts.HeritageClause) => {
                                if (!clause.types) return;
                                clause.types.forEach((typeNode:ts.TypeReferenceNode) => {
                                    var type = checker.getTypeAtLocation(typeNode);
                                    switch (clause.token) {
                                        case ts.SyntaxKind.ExtendsKeyword:
                                            if (!isInherit) {
                                                if (!reflection.extendedTypes) reflection.extendedTypes = [];
                                                reflection.extendedTypes.push(extractType(reflection, typeNode, type));
                                            }

                                            if (type && type.symbol) {
                                                type.symbol.declarations.forEach((declaration) => {
                                                    inherit(declaration, reflection, extractTypeArguments(reflection, typeNode.typeArguments));
                                                });
                                            }
                                            break;
                                        case ts.SyntaxKind.ImplementsKeyword:
                                            if (!reflection.implementedTypes) {
                                                reflection.implementedTypes = [];
                                            }

                                            reflection.implementedTypes.push(extractType(reflection, typeNode, type));
                                            break;
                                    }
                                });
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

                        if (node.heritageClauses) {
                            node.heritageClauses.forEach((clause:ts.HeritageClause) => {
                                if (!clause.types) return;
                                clause.types.forEach((typeNode:ts.TypeReferenceNode) => {
                                    var type = checker.getTypeAtLocation(typeNode);
                                    if (!isInherit) {
                                        if (!reflection.extendedTypes) reflection.extendedTypes = [];
                                        reflection.extendedTypes.push(extractType(reflection, typeNode, type));
                                    }

                                    if (type && type.symbol) {
                                        type.symbol.declarations.forEach((declaration) => {
                                            inherit(declaration, reflection, extractTypeArguments(reflection, typeNode.typeArguments));
                                        });
                                    }
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


            function isSimpleObjectLiteral(objectLiteral:ts.ObjectLiteralExpression):boolean {
                if (!objectLiteral.properties) return true;
                return objectLiteral.properties.length == 0;
            }

            /**
             * Analyze the given variable declaration node and create a suitable reflection.
             *
             * @param node   The variable declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitVariableDeclaration(node:ts.VariableDeclaration, scope:ContainerReflection):Reflection {
                var comment = CommentPlugin.getComment(node);
                if (comment && /\@resolve/.test(comment)) {
                    var resolveType = checker.getTypeAtLocation(node);
                    if (resolveType && resolveType.symbol) {
                        var resolved = visit(resolveType.symbol.declarations[0], scope);
                        if (resolved) {
                            resolved.name = node.symbol.name;
                        }
                        return resolved;
                    }
                }

                var kind = scope.kind & ReflectionKind.ClassOrInterface ? ReflectionKind.Property : ReflectionKind.Variable;
                var variable = createDeclaration(scope, node, kind);
                if (variable) {
                    if (node.initializer) {
                        switch (node.initializer.kind) {
                            case ts.SyntaxKind.ArrowFunction:
                            case ts.SyntaxKind.FunctionExpression:
                                variable.kind = scope.kind & ReflectionKind.ClassOrInterface ? ReflectionKind.Method : ReflectionKind.Function;
                                visitCallSignatureDeclaration(<ts.FunctionExpression>node.initializer, variable);
                                break;
                            case ts.SyntaxKind.ObjectLiteralExpression:
                                if (!isSimpleObjectLiteral(<ts.ObjectLiteralExpression>node.initializer)) {
                                    variable.kind = ReflectionKind.ObjectLiteral;
                                    variable.type = new IntrinsicType('object');
                                    visitObjectLiteral(<ts.ObjectLiteralExpression>node.initializer, variable);
                                }
                                break;
                            default:
                                extractDefaultValue(node, variable);
                        }
                    }

                    if (variable.kind == kind) {
                        variable.type = extractType(variable, node.type, checker.getTypeAtLocation(node));
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
                var method = createDeclaration(scope, node, ReflectionKind.Constructor, 'constructor');
                if (method) {
                    if (!hasBody || !method.signatures) {
                        var name = 'new ' + scope.name;
                        var signature = createSignature(method, node, name, ReflectionKind.ConstructorSignature);
                        signature.type = new ReferenceType(scope.name, -1, scope);
                        method.signatures = method.signatures || [];
                        method.signatures.push(signature);
                    } else {
                        event.node = node;
                        event.reflection = method;
                        dispatcher.dispatch(Converter.EVENT_FUNCTION_IMPLEMENTATION, event);
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
            function visitFunctionDeclaration(node:ts.FunctionDeclaration|ts.MethodDeclaration, scope:ContainerReflection):Reflection {
                var kind = scope.kind & ReflectionKind.ClassOrInterface ? ReflectionKind.Method : ReflectionKind.Function;
                var hasBody = !!node.body;
                var method = createDeclaration(scope, node, kind);

                if (method) {
                    if (!hasBody || !method.signatures) {
                        var signature = createSignature(method, node, method.name, ReflectionKind.CallSignature);
                        if (!method.signatures) method.signatures = [];
                        method.signatures.push(signature);
                    } else {
                        event.node = node;
                        event.reflection = method;
                        dispatcher.dispatch(Converter.EVENT_FUNCTION_IMPLEMENTATION, event);
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
            function visitCallSignatureDeclaration(node:ts.SignatureDeclaration|ts.FunctionExpression, scope:DeclarationReflection):Reflection {
                if (scope instanceof DeclarationReflection) {
                    var name = scope.kindOf(ReflectionKind.FunctionOrMethod) ? scope.name : '__call';
                    var signature = createSignature(<DeclarationReflection>scope, node, name, ReflectionKind.CallSignature);
                    if (!scope.signatures) scope.signatures = [];
                    scope.signatures.push(signature);
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
                    var signature = createSignature(accessor, node, '__get', ReflectionKind.GetSignature);
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
                    var signature = createSignature(accessor, node, '__set', ReflectionKind.SetSignature);
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
            function visitObjectLiteral(node:ts.ObjectLiteralExpression, scope:ContainerReflection):Reflection {
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
             * Analyze the given type alias declaration node and create a suitable reflection.
             *
             * @param node   The type alias declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitTypeAliasDeclaration(node:ts.TypeAliasDeclaration, scope:ContainerReflection):Reflection {
                var alias = createDeclaration(scope, node, ReflectionKind.TypeAlias);
                alias.type = extractType(alias, node.type, checker.getTypeAtLocation(node.type));
                if (alias.name == 'Callback') {
                    // console.log(alias);
                }
                return alias;
            }


            function visitExportAssignment(node:ts.ExportAssignment, scope:ContainerReflection):Reflection {
                var type = checker.getTypeAtLocation(node.exportName);
                if (type && type.symbol) {
                    type.symbol.declarations.forEach((declaration) => {
                        if (!declaration.symbol) return;
                        var id = project.symbolMapping[getSymbolID(declaration.symbol)];
                        if (!id) return;

                        var reflection = project.reflections[id];
                        if (reflection instanceof DeclarationReflection) {
                            (<DeclarationReflection>reflection).setFlag(ReflectionFlag.ExportAssignment, true);
                        }
                        markAsExported(reflection);
                    });
                }

                function markAsExported(reflection:Reflection) {
                    if (reflection instanceof DeclarationReflection) {
                        (<DeclarationReflection>reflection).setFlag(ReflectionFlag.Exported, true);
                    }

                    reflection.traverse(markAsExported);
                }

                return scope;
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
                return ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
            }

            function getSourceFile(filename:string, languageVersion:ts.ScriptTarget, onError?: (message: string) => void):ts.SourceFile {
                try {
                    var text = ts.sys.readFile(filename, options.charset);
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
                getDefaultLibFilename: () => Path.join(ts.getDirectoryPath(ts.normalizePath(td.tsPath)), 'bin', 'lib.d.ts'),
                writeFile: writeFile,
                getCurrentDirectory: () => currentDirectory || (currentDirectory = ts.sys.getCurrentDirectory()),
                useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
                getCanonicalFileName: getCanonicalFileName,
                getNewLine: () => ts.sys.newLine
            };
        }
    }
}
