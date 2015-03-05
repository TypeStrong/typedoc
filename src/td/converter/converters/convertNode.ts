module td
{
    export function getDefaultValue(node:ts.VariableDeclaration):string;
    export function getDefaultValue(node:ts.ParameterDeclaration):string;
    export function getDefaultValue(node:ts.EnumMember):string;

    /**
     * Return the default value of the given node.
     *
     * @param node  The TypeScript node whose default value should be extracted.
     * @returns The default value as a string.
     */
    export function getDefaultValue(node:{initializer?:ts.Expression}):string {
        if (!node.initializer) return;
        switch (node.initializer.kind) {
            case ts.SyntaxKind.StringLiteral:
                return '"' + (<ts.LiteralExpression>node.initializer).text + '"';
                break;
            case ts.SyntaxKind.NumericLiteral:
                return (<ts.LiteralExpression>node.initializer).text;
                break;
            case ts.SyntaxKind.TrueKeyword:
                return 'true';
                break;
            case ts.SyntaxKind.FalseKeyword:
                return 'false';
                break;
            default:
                var source = ts.getSourceFileOfNode(<ts.Node>node);
                return source.text.substring(node.initializer.pos, node.initializer.end);
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
    export function visit(context:Context, node:ts.Node):Reflection {
        switch (node.kind) {
            case ts.SyntaxKind.SourceFile:
                return visitSourceFile(context, <ts.SourceFile>node);
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
        var result = context.getScope();
        context.withSourceFile(node, () => {
            if (context.settings.mode == SourceFileMode.Modules) {
                result = createDeclaration(context, node, ReflectionKind.ExternalModule, node.filename);
                context.withScope(result, () => {
                    visitBlock(context, node);
                    result.setFlag(ReflectionFlag.Exported);
                });
            } else {
                visitBlock(context, node);
            }
        });

        return result;
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
            var opt = context.compilerOptions;
            if (parent instanceof ProjectReflection && !context.isDeclaration &&
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
                var type = context.getTypeAtLocation(baseType);
                if (!context.isInherit) {
                    if (!reflection.extendedTypes) reflection.extendedTypes = [];
                    reflection.extendedTypes.push(convertType(context, baseType, type));
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
                    if (!reflection.implementedTypes) {
                        reflection.implementedTypes = [];
                    }

                    reflection.implementedTypes.push(convertType(context, implementedType));
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
                    var type = context.getTypeAtLocation(baseType);
                    if (!context.isInherit) {
                        if (!reflection.extendedTypes) reflection.extendedTypes = [];
                        reflection.extendedTypes.push(convertType(context, baseType, type));
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
            var resolveType = context.getTypeAtLocation(node);
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
                        variable.defaultValue = getDefaultValue(node);
                }
            }

            if (variable.kind == kind) {
                variable.type = convertType(context, node.type, context.getTypeAtLocation(node));
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
            member.defaultValue = getDefaultValue(node);
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
                context.trigger(Converter.EVENT_FUNCTION_IMPLEMENTATION, method, node);
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
                context.trigger(Converter.EVENT_FUNCTION_IMPLEMENTATION, method, <ts.Node>node);
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
            alias.type = convertType(context, node.type, context.getTypeAtLocation(node.type));
        });

        return alias;
    }


    function visitExportAssignment(context:Context, node:ts.ExportAssignment):Reflection {
        var type = context.getTypeAtLocation(node.exportName);
        if (type && type.symbol) {
            var project = context.getProject();
            type.symbol.declarations.forEach((declaration) => {
                if (!declaration.symbol) return;
                var id = project.symbolMapping[context.getSymbolID(declaration.symbol)];
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