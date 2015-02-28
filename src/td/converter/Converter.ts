/// <reference path="../PluginHost.ts" />

module td
{
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
            var isDeclaration = false;
            var externalPattern = settings.externalPattern ? new Minimatch.Minimatch(settings.externalPattern) : null;
            var symbolID = -1024;

            return compile();


            function compile():IConverterResult {
                var errors = program.getDiagnostics();
                errors = errors.concat(checker.getDiagnostics());

                var converterEvent = new ConverterEvent(checker, project, settings);
                dispatcher.dispatch(Converter.EVENT_BEGIN, converterEvent);

                var context = new Context(checker, project);
                context.visit = visit;
                context.extractType = extractType;
                context.createTypeParameter = createTypeParameter;

                program.getSourceFiles().forEach((sourceFile) => {
                    visitSourceFile(context, sourceFile);
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


            function registerReflection(context:Context, reflection:Reflection, node:ts.Node) {
                project.reflections[reflection.id] = reflection;

                var id = getSymbolID(node.symbol);
                if (!context.isInherit && id && !project.symbolMapping[id]) {
                    project.symbolMapping[id] = reflection.id;
                }
            }


            function createDeclaration(context:Context, node:ts.Node, kind:ReflectionKind, name?:string):DeclarationReflection {
                var container = <ContainerReflection>context.getScope();
                if (!(container instanceof ContainerReflection)) {
                    throw new Error('Expected container reflection.');
                }

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
                if (context.isInherit && isPrivate) {
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
                    registerReflection(context, child, node);

                    if (context.isInherit && node.parent == context.inheritParent) {
                        if (!child.inheritedFrom) {
                            child.inheritedFrom = createReferenceType(node.symbol, true);
                            child.getAllSignatures().forEach((signature) => {
                                signature.inheritedFrom = createReferenceType(node.symbol, true);
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

                    if (context.isInherit && node.parent == context.inheritParent && context.inherited.indexOf(name) != -1) {
                        if (!child.overwrites) {
                            child.overwrites = createReferenceType(node.symbol, true);
                            child.getAllSignatures().forEach((signature) => {
                                signature.overwrites = createReferenceType(node.symbol, true);
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


            function createReferenceType(symbol:ts.Symbol, includeParent?:boolean):ReferenceType {
                var id = getSymbolID(symbol);
                var name = checker.symbolToString(symbol);
                if (includeParent && symbol.parent) {
                    name = [checker.symbolToString(symbol.parent), name].join('.');
                }

                return new ReferenceType(name, id);
            }


            function createSignature(context:Context, node:ts.SignatureDeclaration, name:string, kind:ReflectionKind):SignatureReflection {
                var container = <DeclarationReflection>context.getScope();
                var signature = new SignatureReflection(container, name, kind);

                context.withScope(signature, node.typeParameters, true, () => {
                    node.parameters.forEach((parameter:ts.ParameterDeclaration) => {
                        createParameter(context, parameter);
                    });

                    registerReflection(context, signature, node);

                    if (kind == ReflectionKind.CallSignature) {
                        var type = checker.getTypeAtLocation(node);
                        checker.getSignaturesOfType(type, ts.SignatureKind.Call).forEach((tsSignature) => {
                            if (tsSignature.declaration == node) {
                                signature.type = extractType(context, node.type, checker.getReturnTypeOfSignature(tsSignature));
                            }
                        });
                    }

                    if (!signature.type) {
                        if (node.type) {
                            signature.type = extractType(context, node.type, checker.getTypeAtLocation(node.type));
                        } else {
                            signature.type = extractType(context, node, checker.getTypeAtLocation(node));
                        }
                    }

                    if (container.inheritedFrom) {
                        signature.inheritedFrom = createReferenceType(node.symbol, true);
                    }

                    event.reflection = signature;
                    event.node = node;
                    dispatcher.dispatch(Converter.EVENT_CREATE_SIGNATURE, event);
                });

                return signature;
            }


            function createParameter(context:Context, node:ts.ParameterDeclaration) {
                var signature = <SignatureReflection>context.getScope();
                if (!(signature instanceof SignatureReflection)) {
                    throw new Error('Expected signature reflection.');
                }

                var parameter = new ParameterReflection(signature, node.symbol.name, ReflectionKind.Parameter);

                context.withScope(parameter, () => {
                    parameter.type = extractType(context, node.type, checker.getTypeAtLocation(node));
                    parameter.setFlag(ReflectionFlag.Optional, !!node.questionToken);
                    parameter.setFlag(ReflectionFlag.Rest, !!node.dotDotDotToken);

                    extractDefaultValue(node, parameter);
                    parameter.setFlag(ReflectionFlag.DefaultValue, !!parameter.defaultValue);

                    if (!signature.parameters) signature.parameters = [];
                    signature.parameters.push(parameter);

                    registerReflection(context, parameter, node);

                    event.reflection = parameter;
                    event.node = node;
                    dispatcher.dispatch(Converter.EVENT_CREATE_PARAMETER, event);
                });
            }


            function createTypeParameter(context:Context, declaration:ts.TypeParameterDeclaration):TypeParameterType {
                var typeParameter = new TypeParameterType();
                typeParameter.name = declaration.symbol.name;
                if (declaration.constraint) {
                    typeParameter.constraint = extractType(context, declaration.constraint, this.checker.getTypeAtLocation(declaration.constraint));
                }

                var reflection = <ITypeParameterContainer>context.getScope();
                if (!reflection.typeParameters) reflection.typeParameters = [];
                var typeParameterReflection = new TypeParameterReflection(reflection, typeParameter);

                registerReflection(context, typeParameterReflection, declaration);
                reflection.typeParameters.push(typeParameterReflection);

                event.reflection = typeParameterReflection;
                event.node = declaration;
                dispatcher.dispatch(Converter.EVENT_CREATE_TYPE_PARAMETER, event);

                return typeParameter;
            }


            function extractType(context:Context, node:ts.Node, type:ts.Type):Type {
                if (node && node['typeName'] && node['typeName'].text && type && (!type.symbol || (node['typeName'].text != type.symbol.name))) {
                    return new ReferenceType(node['typeName'].text, ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME);
                } else if (type.flags & ts.TypeFlags.Intrinsic) {
                    return extractIntrinsicType(<ts.IntrinsicType>type);
                } else if (type.flags & ts.TypeFlags.Enum) {
                    return extractEnumType(type);
                } else if (type.flags & ts.TypeFlags.Tuple) {
                    return extractTupleType(context, <ts.TupleTypeNode>node, <ts.TupleType>type);
                } else if (type.flags & ts.TypeFlags.Union) {
                    return extractUnionType(context, <ts.UnionTypeNode>node, <ts.UnionType>type);
                } else if (type.flags & ts.TypeFlags.TypeParameter) {
                    return extractTypeParameterType(context, <ts.TypeReferenceNode>node, type);
                } else if (type.flags & ts.TypeFlags.StringLiteral) {
                    return extractStringLiteralType(<ts.StringLiteralType>type);
                } else if (type.flags & ts.TypeFlags.ObjectType) {
                    return extractObjectType(context, node, type);
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


            function extractTupleType(context:Context, node:ts.TupleTypeNode, type:ts.TupleType):Type {
                var elements = [];
                if (node && node.elementTypes) {
                    node.elementTypes.forEach((elementNode:ts.TypeNode) => {
                        elements.push(extractType(context, elementNode, checker.getTypeAtLocation(elementNode)));
                    });
                } else if (type && type.elementTypes) {
                    type.elementTypes.forEach((type:ts.Type) => {
                        elements.push(extractType(context, null, type));
                    });
                }

                return new TupleType(elements);
            }


            function extractUnionType(context:Context, node:ts.UnionTypeNode, type:ts.UnionType):Type {
                var types = [];
                if (node && node.types) {
                    node.types.forEach((typeNode:ts.TypeNode) => {
                        types.push(extractType(context, typeNode, checker.getTypeAtLocation(typeNode)));
                    });
                } else if (type && type.types) {
                    type.types.forEach((type:ts.Type) => {
                        types.push(extractType(context, null, type));
                    });
                }

                return new UnionType(types);
            }


            function extractTypeParameterType(context:Context, node:ts.TypeReferenceNode, type:ts.Type):Type {
                if (node && node.typeName) {
                    var name = node.typeName['text'];
                    if (context.typeParameters && context.typeParameters[name]) {
                        return context.typeParameters[name];
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


            function extractObjectType(context:Context, node:ts.Node, type:ts.Type):Type {
                if (node && node['elementType']) {
                    var result = extractType(context, node['elementType'], checker.getTypeAtLocation(node['elementType']));
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
                            declaration.parent = context.getScope();

                            registerReflection(context, declaration, node);
                            event.reflection = declaration;
                            event.node = node;
                            dispatcher.dispatch(Converter.EVENT_CREATE_DECLARATION, event);
                            context.withScope(declaration, () => {
                                type.symbol.declarations.forEach((node) => {
                                    visit(context, node);
                                });
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
                                referenceType.typeArguments.push(extractType(context, node, checker.getTypeAtLocation(node)));
                            });
                        } else if (type && type['typeArguments']) {
                            referenceType.typeArguments = [];
                            type['typeArguments'].forEach((type:ts.Type) => {
                                referenceType.typeArguments.push(extractType(context, null, type));
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


            function extractDefaultValue(node:ts.VariableDeclaration, reflection:IDefaultValueContainer);
            function extractDefaultValue(node:ts.ParameterDeclaration, reflection:IDefaultValueContainer);
            function extractDefaultValue(node:ts.EnumMember, reflection:IDefaultValueContainer);
            function extractDefaultValue(node:{initializer?:ts.Expression}, reflection:IDefaultValueContainer) {
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
                        var source = ts.getSourceFileOfNode(<ts.Node>node);
                        reflection.defaultValue = source.text.substring(node.initializer.pos, node.initializer.end);
                        break;
                }
            }


            /**
             * Analyze the given node and create a suitable reflection.
             *
             * This function checks the kind of the node and delegates to the matching function implementation.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The compiler node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visit(context:Context, node:ts.Node):Reflection {
                switch (node.kind) {
                    case ts.SyntaxKind.ClassDeclaration:
                        return visitClassDeclaration(context, <ts.ClassDeclaration>node);
                    case ts.SyntaxKind.InterfaceDeclaration:
                        return visitInterfaceDeclaration(context, <ts.InterfaceDeclaration>node);
                    case ts.SyntaxKind.ModuleDeclaration:
                        return visitModuleDeclaration(context, <ts.ModuleDeclaration>node);
                    case ts.SyntaxKind.VariableStatement:
                        return visitVariableStatement(context, <ts.VariableStatement>node);
                    case ts.SyntaxKind.Property:
                    case ts.SyntaxKind.PropertyAssignment:
                    case ts.SyntaxKind.VariableDeclaration:
                        return visitVariableDeclaration(context, <ts.VariableDeclaration>node);
                    case ts.SyntaxKind.EnumDeclaration:
                        return visitEnumDeclaration(context, <ts.EnumDeclaration>node);
                    case ts.SyntaxKind.EnumMember:
                        return visitEnumMember(context, <ts.EnumMember>node);
                    case ts.SyntaxKind.Constructor:
                    case ts.SyntaxKind.ConstructSignature:
                        return visitConstructor(context, <ts.ConstructorDeclaration>node);
                    case ts.SyntaxKind.Method:
                    case ts.SyntaxKind.FunctionDeclaration:
                        return visitFunctionDeclaration(context, <ts.MethodDeclaration>node);
                    case ts.SyntaxKind.GetAccessor:
                        return visitGetAccessorDeclaration(context, <ts.SignatureDeclaration>node);
                    case ts.SyntaxKind.SetAccessor:
                        return visitSetAccessorDeclaration(context, <ts.SignatureDeclaration>node);
                    case ts.SyntaxKind.CallSignature:
                    case ts.SyntaxKind.FunctionType:
                        return visitCallSignatureDeclaration(context, <ts.SignatureDeclaration>node);
                    case ts.SyntaxKind.IndexSignature:
                        return visitIndexSignatureDeclaration(context, <ts.SignatureDeclaration>node);
                    case ts.SyntaxKind.Block:
                    case ts.SyntaxKind.ModuleBlock:
                        return visitBlock(context, <ts.Block>node);
                    case ts.SyntaxKind.ObjectLiteralExpression:
                        return visitObjectLiteral(context, <ts.ObjectLiteralExpression>node);
                    case ts.SyntaxKind.TypeLiteral:
                        return visitTypeLiteral(context, <ts.TypeLiteralNode>node);
                    case ts.SyntaxKind.ExportAssignment:
                        return visitExportAssignment(context, <ts.ExportAssignment>node);
                    case ts.SyntaxKind.TypeAliasDeclaration:
                        return visitTypeAliasDeclaration(context, <ts.TypeAliasDeclaration>node);
                    default:
                        // console.log('Unhandeled: ' + node.kind);
                        return null;
                }
            }


            /**
             * Analyze the given block node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The source file node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitBlock(context:Context, node:ts.SourceFile):Reflection;
            function visitBlock(context:Context, node:ts.Block):Reflection;
            function visitBlock(context:Context, node:{statements:ts.NodeArray<ts.ModuleElement>}):Reflection {
                if (node.statements) {
                    var prefered = [ts.SyntaxKind.ClassDeclaration, ts.SyntaxKind.InterfaceDeclaration, ts.SyntaxKind.EnumDeclaration];
                    var statements = [];
                    node.statements.forEach((statement) => {
                        if (prefered.indexOf(statement.kind) != -1) {
                            visit(context, statement);
                        } else {
                            statements.push(statement);
                        }
                    });

                    statements.forEach((statement) => {
                        visit(context, statement);
                    });
                }

                return context.getScope();
            }


            /**
             * Analyze the given source file node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The source file node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitSourceFile(context:Context, node:ts.SourceFile):Reflection {
                isExternal = fileNames.indexOf(node.filename) == -1;
                if (externalPattern) {
                    isExternal = isExternal || externalPattern.match(node.filename);
                }

                if (isExternal && settings.excludeExternals) {
                    return context.getScope();
                }

                isDeclaration = ts.isDeclarationFile(node);
                if (isDeclaration) {
                    if (!settings.includeDeclarations || node.filename.substr(-8) == 'lib.d.ts') {
                        return context.getScope();
                    }
                }

                event.node = node;
                event.reflection = project;
                dispatcher.dispatch(Converter.EVENT_FILE_BEGIN, event);

                if (settings.mode == SourceFileMode.Modules) {
                    var externalModule = createDeclaration(context, node, ReflectionKind.ExternalModule, node.filename);
                    context.withScope(externalModule, () => {
                        visitBlock(context, node);
                        externalModule.setFlag(ReflectionFlag.Exported);
                    });
                    return externalModule;
                } else {
                    visitBlock(context, node);
                    return context.getScope();
                }
            }


            /**
             * Analyze the given module node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The module node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitModuleDeclaration(context:Context, node:ts.ModuleDeclaration):Reflection {
                var parent = context.getScope();
                var reflection = createDeclaration(context, node, ReflectionKind.Module);

                context.withScope(reflection, () => {
                    var opt = settings.compilerOptions;
                    if (parent instanceof ProjectReflection && !isDeclaration &&
                        (!opt.module || opt.module == ts.ModuleKind.None)) {
                        reflection.setFlag(ReflectionFlag.Exported);
                    }

                    if (node.body) {
                        visit(context, node.body);
                    }
                });

                return reflection;
            }


            /**
             * Analyze the given class declaration node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The class declaration node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitClassDeclaration(context:Context, node:ts.ClassDeclaration):Reflection {
                var reflection;
                if (context.isInherit && context.inheritParent == node) {
                    reflection = context.getScope();
                } else {
                    reflection = createDeclaration(context, node, ReflectionKind.Class);
                }

                context.withScope(reflection, node.typeParameters, () => {
                    if (node.members) {
                        node.members.forEach((member) => {
                            visit(context, member);
                        });
                    }

                    var baseType = ts.getClassBaseTypeNode(node);
                    if (baseType) {
                        var type = checker.getTypeAtLocation(baseType);
                        if (!context.isInherit) {
                            if (!reflection.extendedTypes) reflection.extendedTypes = [];
                            reflection.extendedTypes.push(extractType(context, baseType, type));
                        }

                        if (type && type.symbol) {
                            type.symbol.declarations.forEach((declaration) => {
                                context.inherit(declaration, baseType.typeArguments);
                            });
                        }
                    }

                    var implementedTypes = ts.getClassImplementedTypeNodes(node);
                    if (implementedTypes) {
                        implementedTypes.forEach((implementedType) => {
                            var type = checker.getTypeAtLocation(baseType);
                            if (!reflection.implementedTypes) {
                                reflection.implementedTypes = [];
                            }

                            reflection.implementedTypes.push(extractType(context, implementedType, type));
                        });
                    }
                });

                return reflection;
            }


            /**
             * Analyze the given interface declaration node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The interface declaration node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitInterfaceDeclaration(context:Context, node:ts.InterfaceDeclaration):Reflection {
                var reflection;
                if (context.isInherit && context.inheritParent == node) {
                    reflection = context.getScope();
                } else {
                    reflection = createDeclaration(context, node, ReflectionKind.Interface);
                }

                context.withScope(reflection, node.typeParameters, () => {
                    if (node.members) {
                        node.members.forEach((member, isInherit) => {
                            visit(context, member);
                        });
                    }

                    var baseTypes = ts.getInterfaceBaseTypeNodes(node);
                    if (baseTypes) {
                        baseTypes.forEach((baseType) => {
                            var type = checker.getTypeAtLocation(baseType);
                            if (!context.isInherit) {
                                if (!reflection.extendedTypes) reflection.extendedTypes = [];
                                reflection.extendedTypes.push(extractType(context, baseType, type));
                            }

                            if (type && type.symbol) {
                                type.symbol.declarations.forEach((declaration) => {
                                    context.inherit(declaration, baseType.typeArguments);
                                });
                            }
                        });
                    }
                });

                return reflection;
            }


            /**
             * Analyze the given variable statement node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The variable statement node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitVariableStatement(context:Context, node:ts.VariableStatement):Reflection {
                if (node.declarations) {
                    node.declarations.forEach((variableDeclaration) => {
                        visitVariableDeclaration(context, variableDeclaration);
                    });
                }

                return context.getScope();
            }


            function isSimpleObjectLiteral(objectLiteral:ts.ObjectLiteralExpression):boolean {
                if (!objectLiteral.properties) return true;
                return objectLiteral.properties.length == 0;
            }


            /**
             * Analyze the given variable declaration node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The variable declaration node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitVariableDeclaration(context:Context, node:ts.VariableDeclaration):Reflection {
                var comment = CommentPlugin.getComment(node);
                if (comment && /\@resolve/.test(comment)) {
                    var resolveType = checker.getTypeAtLocation(node);
                    if (resolveType && resolveType.symbol) {
                        var resolved = visit(context, resolveType.symbol.declarations[0]);
                        if (resolved) {
                            resolved.name = node.symbol.name;
                        }
                        return resolved;
                    }
                }

                var scope = context.getScope();
                var kind = scope.kind & ReflectionKind.ClassOrInterface ? ReflectionKind.Property : ReflectionKind.Variable;
                var variable = createDeclaration(context, node, kind);
                context.withScope(variable, () => {
                    if (node.initializer) {
                        switch (node.initializer.kind) {
                            case ts.SyntaxKind.ArrowFunction:
                            case ts.SyntaxKind.FunctionExpression:
                                variable.kind = scope.kind & ReflectionKind.ClassOrInterface ? ReflectionKind.Method : ReflectionKind.Function;
                                visitCallSignatureDeclaration(context, <ts.FunctionExpression>node.initializer);
                                break;
                            case ts.SyntaxKind.ObjectLiteralExpression:
                                if (!isSimpleObjectLiteral(<ts.ObjectLiteralExpression>node.initializer)) {
                                    variable.kind = ReflectionKind.ObjectLiteral;
                                    variable.type = new IntrinsicType('object');
                                    visitObjectLiteral(context, <ts.ObjectLiteralExpression>node.initializer);
                                }
                                break;
                            default:
                                extractDefaultValue(node, variable);
                        }
                    }

                    if (variable.kind == kind) {
                        variable.type = extractType(context, node.type, checker.getTypeAtLocation(node));
                    }
                });

                return variable;
            }


            /**
             * Analyze the given enumeration declaration node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The enumeration declaration node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitEnumDeclaration(context:Context, node:ts.EnumDeclaration):Reflection {
                var enumeration = createDeclaration(context, node, ReflectionKind.Enum);

                context.withScope(enumeration, () => {
                    if (node.members) {
                        node.members.forEach((node) => {
                            visitEnumMember(context, node);
                        });
                    }
                });

                return enumeration;
            }


            /**
             * Analyze the given enumeration member node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The enumeration member node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitEnumMember(context:Context, node:ts.EnumMember):Reflection {
                var member = createDeclaration(context, node, ReflectionKind.EnumMember);
                if (member) {
                    extractDefaultValue(node, member);
                }

                return member;
            }


            /**
             * Analyze the given constructor declaration node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The constructor declaration node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitConstructor(context:Context, node:ts.ConstructorDeclaration):Reflection {
                var parent = context.getScope();
                var hasBody = !!node.body;
                var method = createDeclaration(context, node, ReflectionKind.Constructor, 'constructor');

                context.withScope(method, () => {
                    if (!hasBody || !method.signatures) {
                        var name = 'new ' + parent.name;
                        var signature = createSignature(context, node, name, ReflectionKind.ConstructorSignature);
                        signature.type = new ReferenceType(parent.name, ReferenceType.SYMBOL_ID_RESOLVED, parent);
                        method.signatures = method.signatures || [];
                        method.signatures.push(signature);
                    } else {
                        event.node = node;
                        event.reflection = method;
                        dispatcher.dispatch(Converter.EVENT_FUNCTION_IMPLEMENTATION, event);
                    }
                });

                return method;
            }


            /**
             * Analyze the given function declaration node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The function declaration node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitFunctionDeclaration(context:Context, node:ts.FunctionDeclaration):Reflection;
            function visitFunctionDeclaration(context:Context, node:ts.MethodDeclaration):Reflection;
            function visitFunctionDeclaration(context:Context, node:{body?:ts.Block}):Reflection {
                var scope = context.getScope();
                var kind = scope.kind & ReflectionKind.ClassOrInterface ? ReflectionKind.Method : ReflectionKind.Function;
                var hasBody = !!node.body;
                var method = createDeclaration(context, <ts.Node>node, kind);

                context.withScope(method, () => {
                    if (!hasBody || !method.signatures) {
                        var signature = createSignature(context, <ts.SignatureDeclaration>node, method.name, ReflectionKind.CallSignature);
                        if (!method.signatures) method.signatures = [];
                        method.signatures.push(signature);
                    } else {
                        event.node = <ts.Node>node;
                        event.reflection = method;
                        dispatcher.dispatch(Converter.EVENT_FUNCTION_IMPLEMENTATION, event);
                    }
                });

                return method;
            }


            /**
             * Analyze the given call signature declaration node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The signature declaration node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitCallSignatureDeclaration(context:Context, node:ts.SignatureDeclaration):Reflection;
            function visitCallSignatureDeclaration(context:Context, node:ts.FunctionExpression):Reflection;
            function visitCallSignatureDeclaration(context:Context, node:{}):Reflection {
                var scope = <DeclarationReflection>context.getScope();
                if (scope instanceof DeclarationReflection) {
                    var name = scope.kindOf(ReflectionKind.FunctionOrMethod) ? scope.name : '__call';
                    var signature = createSignature(context, <ts.SignatureDeclaration>node, name, ReflectionKind.CallSignature);
                    if (!scope.signatures) scope.signatures = [];
                    scope.signatures.push(signature);
                }

                return scope;
            }


            /**
             * Analyze the given index signature declaration node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The signature declaration node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitIndexSignatureDeclaration(context:Context, node:ts.SignatureDeclaration):Reflection {
                var scope = <DeclarationReflection>context.getScope();
                if (scope instanceof DeclarationReflection) {
                    scope.indexSignature = createSignature(context, node, '__index', ReflectionKind.IndexSignature);
                }

                return scope;
            }


            /**
             * Analyze the given getter declaration node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The signature declaration node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitGetAccessorDeclaration(context:Context, node:ts.SignatureDeclaration):Reflection {
                var accessor = createDeclaration(context, node, ReflectionKind.Accessor);
                context.withScope(accessor, () => {
                    accessor.getSignature = createSignature(context, node, '__get', ReflectionKind.GetSignature);
                });

                return accessor;
            }


            /**
             * Analyze the given setter declaration node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The signature declaration node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitSetAccessorDeclaration(context:Context, node:ts.SignatureDeclaration):Reflection {
                var accessor = createDeclaration(context, node, ReflectionKind.Accessor);
                context.withScope(accessor, () => {
                    accessor.setSignature = createSignature(context, node, '__set', ReflectionKind.SetSignature);
                });

                return accessor;
            }


            /**
             * Analyze the given object literal node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The object literal node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitObjectLiteral(context:Context, node:ts.ObjectLiteralExpression):Reflection {
                if (node.properties) {
                    node.properties.forEach((node) => {
                        visit(context, node);
                    });
                }

                return context.getScope();
            }


            /**
             * Analyze the given type literal node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The type literal node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitTypeLiteral(context:Context, node:ts.TypeLiteralNode):Reflection {
                if (node.members) {
                    node.members.forEach((node) => {
                        visit(context, node);
                    });
                }

                return context.getScope();
            }


            /**
             * Analyze the given type alias declaration node and create a suitable reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param node     The type alias declaration node that should be analyzed.
             * @return The resulting reflection or NULL.
             */
            function visitTypeAliasDeclaration(context:Context, node:ts.TypeAliasDeclaration):Reflection {
                var alias = createDeclaration(context, node, ReflectionKind.TypeAlias);
                context.withScope(alias, () => {
                    alias.type = extractType(context, node.type, checker.getTypeAtLocation(node.type));
                });

                return alias;
            }


            function visitExportAssignment(context:Context, node:ts.ExportAssignment):Reflection {
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

                return context.getScope();
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
