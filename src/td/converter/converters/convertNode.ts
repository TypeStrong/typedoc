module td.converter
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
    export function visit(context:Context, node:ts.Node):models.Reflection {
        if (context.visitStack.indexOf(node) != -1) {
            return null;
        }

        var oldVisitStack = context.visitStack;
        context.visitStack = oldVisitStack.slice();
        context.visitStack.push(node);

        if (context.getOptions().verbose) {
            var file = ts.getSourceFileOfNode(node);
            var pos = ts.getLineAndCharacterOfPosition(file, node.pos);
            if (node.symbol) {
                context.getLogger().verbose(
                    'Visiting \x1b[34m%s\x1b[0m\n    in %s (%s:%s)',
                    context.checker.getFullyQualifiedName(node.symbol),
                    file.fileName, pos.line.toString(), pos.character.toString()
                );
            } else {
                context.getLogger().verbose(
                    'Visiting node of kind %s in %s (%s:%s)',
                    node.kind.toString(),
                    file.fileName, pos.line.toString(), pos.character.toString()
                );
            }
        }

        var result:models.Reflection;
        switch (node.kind) {
            case ts.SyntaxKind.SourceFile:
                result = visitSourceFile(context, <ts.SourceFile>node);
                break;

            case ts.SyntaxKind.ClassExpression:
            case ts.SyntaxKind.ClassDeclaration:
                result = visitClassDeclaration(context, <ts.ClassDeclaration>node);
                break;

            case ts.SyntaxKind.InterfaceDeclaration:
                result = visitInterfaceDeclaration(context, <ts.InterfaceDeclaration>node);
                break;

            case ts.SyntaxKind.ModuleDeclaration:
                result = visitModuleDeclaration(context, <ts.ModuleDeclaration>node);
                break;

            case ts.SyntaxKind.VariableStatement:
                result = visitVariableStatement(context, <ts.VariableStatement>node);
                break;

            case ts.SyntaxKind.PropertySignature:
            case ts.SyntaxKind.PropertyDeclaration:
            case ts.SyntaxKind.PropertyAssignment:
            case ts.SyntaxKind.ShorthandPropertyAssignment:
            case ts.SyntaxKind.VariableDeclaration:
            case ts.SyntaxKind.BindingElement:
                result = visitVariableDeclaration(context, <ts.VariableDeclaration>node);
                break;

            case ts.SyntaxKind.EnumDeclaration:
                result = visitEnumDeclaration(context, <ts.EnumDeclaration>node);
                break;

            case ts.SyntaxKind.EnumMember:
                result = visitEnumMember(context, <ts.EnumMember>node);
                break;

            case ts.SyntaxKind.Constructor:
            case ts.SyntaxKind.ConstructSignature:
                result = visitConstructor(context, <ts.ConstructorDeclaration>node);
                break;

            case ts.SyntaxKind.MethodSignature:
            case ts.SyntaxKind.MethodDeclaration:
            case ts.SyntaxKind.FunctionDeclaration:
                result = visitFunctionDeclaration(context, <ts.MethodDeclaration>node);
                break;

            case ts.SyntaxKind.GetAccessor:
                result = visitGetAccessorDeclaration(context, <ts.SignatureDeclaration>node);
                break;

            case ts.SyntaxKind.SetAccessor:
                result = visitSetAccessorDeclaration(context, <ts.SignatureDeclaration>node);
                break;

            case ts.SyntaxKind.CallSignature:
            case ts.SyntaxKind.FunctionType:
                result = visitCallSignatureDeclaration(context, <ts.SignatureDeclaration>node);
                break;

            case ts.SyntaxKind.IndexSignature:
                result = visitIndexSignatureDeclaration(context, <ts.SignatureDeclaration>node);
                break;

            case ts.SyntaxKind.Block:
            case ts.SyntaxKind.ModuleBlock:
                result = visitBlock(context, <ts.Block>node);
                break;

            case ts.SyntaxKind.ObjectLiteralExpression:
                result = visitObjectLiteral(context, <ts.ObjectLiteralExpression>node);
                break;

            case ts.SyntaxKind.TypeLiteral:
                result = visitTypeLiteral(context, <ts.TypeLiteralNode>node);
                break;

            case ts.SyntaxKind.ExportAssignment:
                result = visitExportAssignment(context, <ts.ExportAssignment>node);
                break;

            case ts.SyntaxKind.TypeAliasDeclaration:
                result = visitTypeAliasDeclaration(context, <ts.TypeAliasDeclaration>node);
                break;
        }

        context.visitStack = oldVisitStack;
        return result;
    }


    /**
     * Analyze the given block node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The source file node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    function visitBlock(context:Context, node:ts.SourceFile):models.Reflection;
    function visitBlock(context:Context, node:ts.Block):models.Reflection;
    function visitBlock(context:Context, node:{statements:ts.NodeArray<ts.ModuleElement>}):models.Reflection {
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

        return context.scope;
    }


    /**
     * Analyze the given source file node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The source file node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    function visitSourceFile(context:Context, node:ts.SourceFile):models.Reflection {
        var result = context.scope;
        var options = context.getOptions();
        context.withSourceFile(node, () => {
            if (options.mode == SourceFileMode.Modules) {
                result = createDeclaration(context, node, models.ReflectionKind.ExternalModule, node.fileName);
                context.withScope(result, () => {
                    visitBlock(context, node);
                    result.setFlag(models.ReflectionFlag.Exported);
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
    function visitModuleDeclaration(context:Context, node:ts.ModuleDeclaration):models.Reflection {
        var parent = context.scope;
        var reflection = createDeclaration(context, node, models.ReflectionKind.Module);

        context.withScope(reflection, () => {
            var opt = context.getCompilerOptions();
            if (parent instanceof models.ProjectReflection && !context.isDeclaration &&
                (!opt.module || opt.module == ts.ModuleKind.None)) {
                reflection.setFlag(models.ReflectionFlag.Exported);
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
    function visitClassDeclaration(context:Context, node:ts.ClassDeclaration):models.Reflection {
        var reflection;
        if (context.isInherit && context.inheritParent == node) {
            reflection = context.scope;
        } else {
            reflection = createDeclaration(context, node, models.ReflectionKind.Class);
        }

        context.withScope(reflection, node.typeParameters, () => {
            if (node.members) {
                node.members.forEach((member) => {
                    visit(context, member);
                });
            }

            var baseType = ts.getClassExtendsHeritageClauseElement(node);
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

            var implementedTypes = ts.getClassImplementsHeritageClauseElements(node);
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
    function visitInterfaceDeclaration(context:Context, node:ts.InterfaceDeclaration):models.Reflection {
        var reflection;
        if (context.isInherit && context.inheritParent == node) {
            reflection = context.scope;
        } else {
            reflection = createDeclaration(context, node, models.ReflectionKind.Interface);
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
    function visitVariableStatement(context:Context, node:ts.VariableStatement):models.Reflection {
        if (node.declarationList && node.declarationList.declarations) {
            node.declarationList.declarations.forEach((variableDeclaration) => {
                if (ts.isBindingPattern(variableDeclaration.name)) {
                    visitBindingPattern(context, <ts.BindingPattern>variableDeclaration.name);
                } else {
                    visitVariableDeclaration(context, variableDeclaration);
                }
            });
        }

        return context.scope;
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
    function visitVariableDeclaration(context:Context, node:ts.VariableDeclaration):models.Reflection {
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

        var name, isBindingPattern;
        if (ts.isBindingPattern(node.name)) {
            if (node['propertyName']) {
                name = ts.declarationNameToString(node['propertyName']);
                isBindingPattern = true;
            } else {
                return null;
            }
        }

        var scope = context.scope;
        var kind = scope.kind & models.ReflectionKind.ClassOrInterface ? models.ReflectionKind.Property : models.ReflectionKind.Variable;
        var variable = createDeclaration(context, node, kind, name);
        context.withScope(variable, () => {
            if (node.initializer) {
                switch (node.initializer.kind) {
                    case ts.SyntaxKind.ArrowFunction:
                    case ts.SyntaxKind.FunctionExpression:
                        variable.kind = scope.kind & models.ReflectionKind.ClassOrInterface ? models.ReflectionKind.Method : models.ReflectionKind.Function;
                        visitCallSignatureDeclaration(context, <ts.FunctionExpression>node.initializer);
                        break;
                    case ts.SyntaxKind.ObjectLiteralExpression:
                        if (!isSimpleObjectLiteral(<ts.ObjectLiteralExpression>node.initializer)) {
                            variable.kind = models.ReflectionKind.ObjectLiteral;
                            variable.type = new models.IntrinsicType('object');
                            visitObjectLiteral(context, <ts.ObjectLiteralExpression>node.initializer);
                        }
                        break;
                    default:
                        variable.defaultValue = getDefaultValue(node);
                }
            }

            if (variable.kind == kind || variable.kind == models.ReflectionKind.Event) {
                if (isBindingPattern) {
                    variable.type = convertDestructuringType(context, <ts.BindingPattern>node.name);
                } else {
                    variable.type = convertType(context, node.type, context.getTypeAtLocation(node));
                }
            }
        });

        return variable;
    }


    /**
     * Traverse the elements of the given binding pattern and create the corresponding variable reflections.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The binding pattern node that should be analyzed.
     */
    function visitBindingPattern(context:Context, node:ts.BindingPattern) {
        node.elements.forEach((element:ts.BindingElement) => {
            visitVariableDeclaration(context, <any>element);
            if (ts.isBindingPattern(element.name)) {
                visitBindingPattern(context, <ts.BindingPattern>element.name);
            }
        });
    }


    /**
     * Analyze the given enumeration declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The enumeration declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    function visitEnumDeclaration(context:Context, node:ts.EnumDeclaration):models.Reflection {
        var enumeration = createDeclaration(context, node, models.ReflectionKind.Enum);

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
    function visitEnumMember(context:Context, node:ts.EnumMember):models.Reflection {
        var member = createDeclaration(context, node, models.ReflectionKind.EnumMember);
        if (member) {
            member.defaultValue = getDefaultValue(node);
        }

        return member;
    }


    /**
     * Analyze parameters in given constructor declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The constructor declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    function visitConstructorModifiers(context:Context, node:ts.ConstructorDeclaration) {
        node.parameters.forEach(param => {
            var visibility = param.flags & (ts.NodeFlags.Public | ts.NodeFlags.Protected | ts.NodeFlags.Private);
            if (!visibility) return;

            var property = createDeclaration(context, param, models.ReflectionKind.Property);
            if (!property) return;

            property.setFlag(models.ReflectionFlag.Static, false);
            property.type = convertType(context, param.type, context.getTypeAtLocation(param));

            var sourceComment = CommentPlugin.getComment(node);
            if (sourceComment) {
                var constructorComment = CommentPlugin.parseComment(sourceComment);
                if (constructorComment) {
                    var tag = constructorComment.getTag('param', property.name);
                    if (tag && tag.text) {
                        property.comment = CommentPlugin.parseComment(tag.text);
                    }
                }
            }
        });
    }


    /**
     * Analyze the given constructor declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The constructor declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    function visitConstructor(context:Context, node:ts.ConstructorDeclaration):models.Reflection {
        var parent = context.scope;
        var hasBody = !!node.body;
        var method = createDeclaration(context, node, models.ReflectionKind.Constructor, 'constructor');

        visitConstructorModifiers(context, node);
        context.withScope(method, () => {
            if (!hasBody || !method.signatures) {
                var name = 'new ' + parent.name;
                var signature = createSignature(context, node, name, models.ReflectionKind.ConstructorSignature);
                signature.type = new models.ReferenceType(parent.name, models.ReferenceType.SYMBOL_ID_RESOLVED, parent);
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
    function visitFunctionDeclaration(context:Context, node:ts.FunctionDeclaration):models.Reflection;
    function visitFunctionDeclaration(context:Context, node:ts.MethodDeclaration):models.Reflection;
    function visitFunctionDeclaration(context:Context, node:{body?:ts.Block}):models.Reflection {
        var scope = context.scope;
        var kind = scope.kind & models.ReflectionKind.ClassOrInterface ? models.ReflectionKind.Method : models.ReflectionKind.Function;
        var hasBody = !!node.body;
        var method = createDeclaration(context, <ts.Node>node, kind);

        context.withScope(method, () => {
            if (!hasBody || !method.signatures) {
                var signature = createSignature(context, <ts.SignatureDeclaration>node, method.name, models.ReflectionKind.CallSignature);
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
    function visitCallSignatureDeclaration(context:Context, node:ts.SignatureDeclaration):models.Reflection;
    function visitCallSignatureDeclaration(context:Context, node:ts.FunctionExpression):models.Reflection;
    function visitCallSignatureDeclaration(context:Context, node:{}):models.Reflection {
        var scope = <models.DeclarationReflection>context.scope;
        if (scope instanceof models.DeclarationReflection) {
            var name = scope.kindOf(models.ReflectionKind.FunctionOrMethod) ? scope.name : '__call';
            var signature = createSignature(context, <ts.SignatureDeclaration>node, name, models.ReflectionKind.CallSignature);
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
    function visitIndexSignatureDeclaration(context:Context, node:ts.SignatureDeclaration):models.Reflection {
        var scope = <models.DeclarationReflection>context.scope;
        if (scope instanceof models.DeclarationReflection) {
            scope.indexSignature = createSignature(context, node, '__index', models.ReflectionKind.IndexSignature);
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
    function visitGetAccessorDeclaration(context:Context, node:ts.SignatureDeclaration):models.Reflection {
        var accessor = createDeclaration(context, node, models.ReflectionKind.Accessor);
        context.withScope(accessor, () => {
            accessor.getSignature = createSignature(context, node, '__get', models.ReflectionKind.GetSignature);
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
    function visitSetAccessorDeclaration(context:Context, node:ts.SignatureDeclaration):models.Reflection {
        var accessor = createDeclaration(context, node, models.ReflectionKind.Accessor);
        context.withScope(accessor, () => {
            accessor.setSignature = createSignature(context, node, '__set', models.ReflectionKind.SetSignature);
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
    function visitObjectLiteral(context:Context, node:ts.ObjectLiteralExpression):models.Reflection {
        if (node.properties) {
            node.properties.forEach((node) => {
                visit(context, node);
            });
        }

        return context.scope;
    }


    /**
     * Analyze the given type literal node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The type literal node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    function visitTypeLiteral(context:Context, node:ts.TypeLiteralNode):models.Reflection {
        if (node.members) {
            node.members.forEach((node) => {
                visit(context, node);
            });
        }

        return context.scope;
    }


    /**
     * Analyze the given type alias declaration node and create a suitable reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node     The type alias declaration node that should be analyzed.
     * @return The resulting reflection or NULL.
     */
    function visitTypeAliasDeclaration(context:Context, node:ts.TypeAliasDeclaration):models.Reflection {
        var alias = createDeclaration(context, node, models.ReflectionKind.TypeAlias);
        context.withScope(alias, () => {
            alias.type = convertType(context, node.type, context.getTypeAtLocation(node.type));
        });

        return alias;
    }


    function visitExportAssignment(context:Context, node:ts.ExportAssignment):models.Reflection {
        if (!node.isExportEquals) {
            return context.scope;
        }

        var type = context.getTypeAtLocation(node.expression);
        if (type && type.symbol) {
            var project = context.project;
            type.symbol.declarations.forEach((declaration) => {
                if (!declaration.symbol) return;
                var id = project.symbolMapping[context.getSymbolID(declaration.symbol)];
                if (!id) return;

                var reflection = project.reflections[id];
                if (reflection instanceof models.DeclarationReflection) {
                    (<models.DeclarationReflection>reflection).setFlag(models.ReflectionFlag.ExportAssignment, true);
                }
                markAsExported(reflection);
            });
        }

        function markAsExported(reflection:models.Reflection) {
            if (reflection instanceof models.DeclarationReflection) {
                (<models.DeclarationReflection>reflection).setFlag(models.ReflectionFlag.Exported, true);
            }

            reflection.traverse(markAsExported);
        }

        return context.scope;
    }
}