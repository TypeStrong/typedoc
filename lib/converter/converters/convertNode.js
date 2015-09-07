var Converter_1 = require("../Converter");
var Reflection_1 = require("../../models/Reflection");
var DeclarationReflection_1 = require("../../models/reflections/DeclarationReflection");
var ProjectReflection_1 = require("../../models/reflections/ProjectReflection");
var IntrinsicType_1 = require("../../models/types/IntrinsicType");
var convertType_1 = require("./convertType");
var factories_1 = require("./factories");
var CommentPlugin_1 = require("../plugins/CommentPlugin");
var convertType_2 = require("./convertType");
var factories_2 = require("./factories");
var ReferenceType_1 = require("../../models/types/ReferenceType");
var Converter_2 = require("../Converter");
function getDefaultValue(node) {
    if (!node.initializer)
        return;
    switch (node.initializer.kind) {
        case 8:
            return '"' + node.initializer.text + '"';
            break;
        case 7:
            return node.initializer.text;
            break;
        case 95:
            return 'true';
            break;
        case 80:
            return 'false';
            break;
        default:
            var source = ts.getSourceFileOfNode(node);
            return source.text.substring(node.initializer.pos, node.initializer.end);
            break;
    }
}
exports.getDefaultValue = getDefaultValue;
function visit(context, node) {
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
            context.getLogger().verbose('Visiting \x1b[34m%s\x1b[0m\n    in %s (%s:%s)', context.checker.getFullyQualifiedName(node.symbol), file.fileName, pos.line.toString(), pos.character.toString());
        }
        else {
            context.getLogger().verbose('Visiting node of kind %s in %s (%s:%s)', node.kind.toString(), file.fileName, pos.line.toString(), pos.character.toString());
        }
    }
    var result;
    switch (node.kind) {
        case 228:
            result = visitSourceFile(context, node);
            break;
        case 175:
        case 202:
            result = visitClassDeclaration(context, node);
            break;
        case 203:
            result = visitInterfaceDeclaration(context, node);
            break;
        case 206:
            result = visitModuleDeclaration(context, node);
            break;
        case 181:
            result = visitVariableStatement(context, node);
            break;
        case 132:
        case 133:
        case 225:
        case 226:
        case 199:
        case 153:
            result = visitVariableDeclaration(context, node);
            break;
        case 205:
            result = visitEnumDeclaration(context, node);
            break;
        case 227:
            result = visitEnumMember(context, node);
            break;
        case 136:
        case 140:
            result = visitConstructor(context, node);
            break;
        case 134:
        case 135:
        case 201:
            result = visitFunctionDeclaration(context, node);
            break;
        case 137:
            result = visitGetAccessorDeclaration(context, node);
            break;
        case 138:
            result = visitSetAccessorDeclaration(context, node);
            break;
        case 139:
        case 143:
            result = visitCallSignatureDeclaration(context, node);
            break;
        case 141:
            result = visitIndexSignatureDeclaration(context, node);
            break;
        case 180:
        case 207:
            result = visitBlock(context, node);
            break;
        case 155:
            result = visitObjectLiteral(context, node);
            break;
        case 146:
            result = visitTypeLiteral(context, node);
            break;
        case 215:
            result = visitExportAssignment(context, node);
            break;
        case 204:
            result = visitTypeAliasDeclaration(context, node);
            break;
    }
    context.visitStack = oldVisitStack;
    return result;
}
exports.visit = visit;
function visitBlock(context, node) {
    if (node.statements) {
        var prefered = [202, 203, 205];
        var statements = [];
        node.statements.forEach(function (statement) {
            if (prefered.indexOf(statement.kind) != -1) {
                visit(context, statement);
            }
            else {
                statements.push(statement);
            }
        });
        statements.forEach(function (statement) {
            visit(context, statement);
        });
    }
    return context.scope;
}
function visitSourceFile(context, node) {
    var result = context.scope;
    var options = context.getOptions();
    context.withSourceFile(node, function () {
        if (options.mode == Converter_1.SourceFileMode.Modules) {
            result = factories_1.createDeclaration(context, node, Reflection_1.ReflectionKind.ExternalModule, node.fileName);
            context.withScope(result, function () {
                visitBlock(context, node);
                result.setFlag(Reflection_1.ReflectionFlag.Exported);
            });
        }
        else {
            visitBlock(context, node);
        }
    });
    return result;
}
function visitModuleDeclaration(context, node) {
    var parent = context.scope;
    var reflection = factories_1.createDeclaration(context, node, Reflection_1.ReflectionKind.Module);
    context.withScope(reflection, function () {
        var opt = context.getCompilerOptions();
        if (parent instanceof ProjectReflection_1.ProjectReflection && !context.isDeclaration &&
            (!opt.module || opt.module == 0)) {
            reflection.setFlag(Reflection_1.ReflectionFlag.Exported);
        }
        if (node.body) {
            visit(context, node.body);
        }
    });
    return reflection;
}
function visitClassDeclaration(context, node) {
    var reflection;
    if (context.isInherit && context.inheritParent == node) {
        reflection = context.scope;
    }
    else {
        reflection = factories_1.createDeclaration(context, node, Reflection_1.ReflectionKind.Class);
    }
    context.withScope(reflection, node.typeParameters, function () {
        if (node.members) {
            node.members.forEach(function (member) {
                visit(context, member);
            });
        }
        var baseType = ts.getClassExtendsHeritageClauseElement(node);
        if (baseType) {
            var type = context.getTypeAtLocation(baseType);
            if (!context.isInherit) {
                if (!reflection.extendedTypes)
                    reflection.extendedTypes = [];
                reflection.extendedTypes.push(convertType_1.convertType(context, baseType, type));
            }
            if (type && type.symbol) {
                type.symbol.declarations.forEach(function (declaration) {
                    context.inherit(declaration, baseType.typeArguments);
                });
            }
        }
        var implementedTypes = ts.getClassImplementsHeritageClauseElements(node);
        if (implementedTypes) {
            implementedTypes.forEach(function (implementedType) {
                if (!reflection.implementedTypes) {
                    reflection.implementedTypes = [];
                }
                reflection.implementedTypes.push(convertType_1.convertType(context, implementedType));
            });
        }
    });
    return reflection;
}
function visitInterfaceDeclaration(context, node) {
    var reflection;
    if (context.isInherit && context.inheritParent == node) {
        reflection = context.scope;
    }
    else {
        reflection = factories_1.createDeclaration(context, node, Reflection_1.ReflectionKind.Interface);
    }
    context.withScope(reflection, node.typeParameters, function () {
        if (node.members) {
            node.members.forEach(function (member, isInherit) {
                visit(context, member);
            });
        }
        var baseTypes = ts.getInterfaceBaseTypeNodes(node);
        if (baseTypes) {
            baseTypes.forEach(function (baseType) {
                var type = context.getTypeAtLocation(baseType);
                if (!context.isInherit) {
                    if (!reflection.extendedTypes)
                        reflection.extendedTypes = [];
                    reflection.extendedTypes.push(convertType_1.convertType(context, baseType, type));
                }
                if (type && type.symbol) {
                    type.symbol.declarations.forEach(function (declaration) {
                        context.inherit(declaration, baseType.typeArguments);
                    });
                }
            });
        }
    });
    return reflection;
}
function visitVariableStatement(context, node) {
    if (node.declarationList && node.declarationList.declarations) {
        node.declarationList.declarations.forEach(function (variableDeclaration) {
            if (ts.isBindingPattern(variableDeclaration.name)) {
                visitBindingPattern(context, variableDeclaration.name);
            }
            else {
                visitVariableDeclaration(context, variableDeclaration);
            }
        });
    }
    return context.scope;
}
function isSimpleObjectLiteral(objectLiteral) {
    if (!objectLiteral.properties)
        return true;
    return objectLiteral.properties.length == 0;
}
function visitVariableDeclaration(context, node) {
    var comment = CommentPlugin_1.CommentPlugin.getComment(node);
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
        }
        else {
            return null;
        }
    }
    var scope = context.scope;
    var kind = scope.kind & Reflection_1.ReflectionKind.ClassOrInterface ? Reflection_1.ReflectionKind.Property : Reflection_1.ReflectionKind.Variable;
    var variable = factories_1.createDeclaration(context, node, kind, name);
    context.withScope(variable, function () {
        if (node.initializer) {
            switch (node.initializer.kind) {
                case 164:
                case 163:
                    variable.kind = scope.kind & Reflection_1.ReflectionKind.ClassOrInterface ? Reflection_1.ReflectionKind.Method : Reflection_1.ReflectionKind.Function;
                    visitCallSignatureDeclaration(context, node.initializer);
                    break;
                case 155:
                    if (!isSimpleObjectLiteral(node.initializer)) {
                        variable.kind = Reflection_1.ReflectionKind.ObjectLiteral;
                        variable.type = new IntrinsicType_1.IntrinsicType('object');
                        visitObjectLiteral(context, node.initializer);
                    }
                    break;
                default:
                    variable.defaultValue = getDefaultValue(node);
            }
        }
        if (variable.kind == kind || variable.kind == Reflection_1.ReflectionKind.Event) {
            if (isBindingPattern) {
                variable.type = convertType_2.convertDestructuringType(context, node.name);
            }
            else {
                variable.type = convertType_1.convertType(context, node.type, context.getTypeAtLocation(node));
            }
        }
    });
    return variable;
}
function visitBindingPattern(context, node) {
    node.elements.forEach(function (element) {
        visitVariableDeclaration(context, element);
        if (ts.isBindingPattern(element.name)) {
            visitBindingPattern(context, element.name);
        }
    });
}
function visitEnumDeclaration(context, node) {
    var enumeration = factories_1.createDeclaration(context, node, Reflection_1.ReflectionKind.Enum);
    context.withScope(enumeration, function () {
        if (node.members) {
            node.members.forEach(function (node) {
                visitEnumMember(context, node);
            });
        }
    });
    return enumeration;
}
function visitEnumMember(context, node) {
    var member = factories_1.createDeclaration(context, node, Reflection_1.ReflectionKind.EnumMember);
    if (member) {
        member.defaultValue = getDefaultValue(node);
    }
    return member;
}
function visitConstructorModifiers(context, node) {
    node.parameters.forEach(function (param) {
        var visibility = param.flags & (16 | 64 | 32);
        if (!visibility)
            return;
        var property = factories_1.createDeclaration(context, param, Reflection_1.ReflectionKind.Property);
        if (!property)
            return;
        property.setFlag(Reflection_1.ReflectionFlag.Static, false);
        property.type = convertType_1.convertType(context, param.type, context.getTypeAtLocation(param));
        var sourceComment = CommentPlugin_1.CommentPlugin.getComment(node);
        if (sourceComment) {
            var constructorComment = CommentPlugin_1.CommentPlugin.parseComment(sourceComment);
            if (constructorComment) {
                var tag = constructorComment.getTag('param', property.name);
                if (tag && tag.text) {
                    property.comment = CommentPlugin_1.CommentPlugin.parseComment(tag.text);
                }
            }
        }
    });
}
function visitConstructor(context, node) {
    var parent = context.scope;
    var hasBody = !!node.body;
    var method = factories_1.createDeclaration(context, node, Reflection_1.ReflectionKind.Constructor, 'constructor');
    visitConstructorModifiers(context, node);
    context.withScope(method, function () {
        if (!hasBody || !method.signatures) {
            var name = 'new ' + parent.name;
            var signature = factories_2.createSignature(context, node, name, Reflection_1.ReflectionKind.ConstructorSignature);
            signature.type = new ReferenceType_1.ReferenceType(parent.name, ReferenceType_1.ReferenceType.SYMBOL_ID_RESOLVED, parent);
            method.signatures = method.signatures || [];
            method.signatures.push(signature);
        }
        else {
            context.trigger(Converter_2.Converter.EVENT_FUNCTION_IMPLEMENTATION, method, node);
        }
    });
    return method;
}
function visitFunctionDeclaration(context, node) {
    var scope = context.scope;
    var kind = scope.kind & Reflection_1.ReflectionKind.ClassOrInterface ? Reflection_1.ReflectionKind.Method : Reflection_1.ReflectionKind.Function;
    var hasBody = !!node.body;
    var method = factories_1.createDeclaration(context, node, kind);
    context.withScope(method, function () {
        if (!hasBody || !method.signatures) {
            var signature = factories_2.createSignature(context, node, method.name, Reflection_1.ReflectionKind.CallSignature);
            if (!method.signatures)
                method.signatures = [];
            method.signatures.push(signature);
        }
        else {
            context.trigger(Converter_2.Converter.EVENT_FUNCTION_IMPLEMENTATION, method, node);
        }
    });
    return method;
}
function visitCallSignatureDeclaration(context, node) {
    var scope = context.scope;
    if (scope instanceof DeclarationReflection_1.DeclarationReflection) {
        var name = scope.kindOf(Reflection_1.ReflectionKind.FunctionOrMethod) ? scope.name : '__call';
        var signature = factories_2.createSignature(context, node, name, Reflection_1.ReflectionKind.CallSignature);
        if (!scope.signatures)
            scope.signatures = [];
        scope.signatures.push(signature);
    }
    return scope;
}
function visitIndexSignatureDeclaration(context, node) {
    var scope = context.scope;
    if (scope instanceof DeclarationReflection_1.DeclarationReflection) {
        scope.indexSignature = factories_2.createSignature(context, node, '__index', Reflection_1.ReflectionKind.IndexSignature);
    }
    return scope;
}
function visitGetAccessorDeclaration(context, node) {
    var accessor = factories_1.createDeclaration(context, node, Reflection_1.ReflectionKind.Accessor);
    context.withScope(accessor, function () {
        accessor.getSignature = factories_2.createSignature(context, node, '__get', Reflection_1.ReflectionKind.GetSignature);
    });
    return accessor;
}
function visitSetAccessorDeclaration(context, node) {
    var accessor = factories_1.createDeclaration(context, node, Reflection_1.ReflectionKind.Accessor);
    context.withScope(accessor, function () {
        accessor.setSignature = factories_2.createSignature(context, node, '__set', Reflection_1.ReflectionKind.SetSignature);
    });
    return accessor;
}
function visitObjectLiteral(context, node) {
    if (node.properties) {
        node.properties.forEach(function (node) {
            visit(context, node);
        });
    }
    return context.scope;
}
function visitTypeLiteral(context, node) {
    if (node.members) {
        node.members.forEach(function (node) {
            visit(context, node);
        });
    }
    return context.scope;
}
function visitTypeAliasDeclaration(context, node) {
    var alias = factories_1.createDeclaration(context, node, Reflection_1.ReflectionKind.TypeAlias);
    context.withScope(alias, function () {
        alias.type = convertType_1.convertType(context, node.type, context.getTypeAtLocation(node.type));
    });
    return alias;
}
function visitExportAssignment(context, node) {
    if (!node.isExportEquals) {
        return context.scope;
    }
    var type = context.getTypeAtLocation(node.expression);
    if (type && type.symbol) {
        var project = context.project;
        type.symbol.declarations.forEach(function (declaration) {
            if (!declaration.symbol)
                return;
            var id = project.symbolMapping[context.getSymbolID(declaration.symbol)];
            if (!id)
                return;
            var reflection = project.reflections[id];
            if (reflection instanceof DeclarationReflection_1.DeclarationReflection) {
                reflection.setFlag(Reflection_1.ReflectionFlag.ExportAssignment, true);
            }
            markAsExported(reflection);
        });
    }
    function markAsExported(reflection) {
        if (reflection instanceof DeclarationReflection_1.DeclarationReflection) {
            reflection.setFlag(Reflection_1.ReflectionFlag.Exported, true);
        }
        reflection.traverse(markAsExported);
    }
    return context.scope;
}
