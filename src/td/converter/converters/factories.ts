module td
{

    export function createDeclaration(context:Context, node:ts.Node, kind:ReflectionKind, name?:string):DeclarationReflection {
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
            child.setFlag(ReflectionFlag.External,  context.isExternal);
            child.setFlag(ReflectionFlag.Private,   isPrivate);
            child.setFlag(ReflectionFlag.Protected, !!(node.flags & ts.NodeFlags.Protected));
            child.setFlag(ReflectionFlag.Public,    !!(node.flags & ts.NodeFlags.Public));
            child.setFlag(ReflectionFlag.Optional,  !!(node['questionToken']));
            child.setFlag(ReflectionFlag.Exported,  container.flags.isExported || !!(node.flags & ts.NodeFlags.Export));

            container.children.push(child);
            context.registerReflection(child, node);

            if (context.isInherit && node.parent == context.inheritParent) {
                if (!child.inheritedFrom) {
                    child.inheritedFrom = createReferenceType(context, node.symbol, true);
                    child.getAllSignatures().forEach((signature) => {
                        signature.inheritedFrom = createReferenceType(context, node.symbol, true);
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
                    child.overwrites = createReferenceType(context, node.symbol, true);
                    child.getAllSignatures().forEach((signature) => {
                        signature.overwrites = createReferenceType(context, node.symbol, true);
                    });
                }
                return null;
            }
        }

        context.trigger(Converter.EVENT_CREATE_DECLARATION, child, node);

        return child;
    }


    export function createReferenceType(context:Context, symbol:ts.Symbol, includeParent?:boolean):ReferenceType {
        var id = context.getSymbolID(symbol);
        var checker = context.getTypeChecker();
        var name = checker.symbolToString(symbol);
        if (includeParent && symbol.parent) {
            name = [checker.symbolToString(symbol.parent), name].join('.');
        }

        return new ReferenceType(name, id);
    }


    export function createSignature(context:Context, node:ts.SignatureDeclaration, name:string, kind:ReflectionKind):SignatureReflection {
        var container = <DeclarationReflection>context.getScope();
        var signature = new SignatureReflection(container, name, kind);

        context.withScope(signature, node.typeParameters, true, () => {
            node.parameters.forEach((parameter:ts.ParameterDeclaration) => {
                createParameter(context, parameter);
            });

            context.registerReflection(signature, node);

            var checker = context.getTypeChecker();
            if (kind == ReflectionKind.CallSignature) {
                var type = checker.getTypeAtLocation(node);
                checker.getSignaturesOfType(type, ts.SignatureKind.Call).forEach((tsSignature) => {
                    if (tsSignature.declaration == node) {
                        signature.type = convertType(context, node.type, checker.getReturnTypeOfSignature(tsSignature));
                    }
                });
            }

            if (!signature.type) {
                if (node.type) {
                    signature.type = convertType(context, node.type, checker.getTypeAtLocation(node.type));
                } else {
                    signature.type = convertType(context, node, checker.getTypeAtLocation(node));
                }
            }

            if (container.inheritedFrom) {
                signature.inheritedFrom = createReferenceType(context, node.symbol, true);
            }

            context.trigger(Converter.EVENT_CREATE_SIGNATURE, signature, node);
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
            parameter.type = convertType(context, node.type, context.getTypeAtLocation(node));
            parameter.setFlag(ReflectionFlag.Optional, !!node.questionToken);
            parameter.setFlag(ReflectionFlag.Rest, !!node.dotDotDotToken);

            extractDefaultValue(node, parameter);
            parameter.setFlag(ReflectionFlag.DefaultValue, !!parameter.defaultValue);

            if (!signature.parameters) signature.parameters = [];
            signature.parameters.push(parameter);

            context.registerReflection(parameter, node);
            context.trigger(Converter.EVENT_CREATE_PARAMETER, parameter, node);
        });
    }


    export function createTypeParameter(context:Context, declaration:ts.TypeParameterDeclaration):TypeParameterType {
        var typeParameter = new TypeParameterType();
        typeParameter.name = declaration.symbol.name;
        if (declaration.constraint) {
            typeParameter.constraint = convertType(context, declaration.constraint, context.getTypeAtLocation(declaration.constraint));
        }

        var reflection = <ITypeParameterContainer>context.getScope();
        if (!reflection.typeParameters) reflection.typeParameters = [];
        var typeParameterReflection = new TypeParameterReflection(reflection, typeParameter);

        context.registerReflection(typeParameterReflection, declaration);
        reflection.typeParameters.push(typeParameterReflection);

        context.trigger(Converter.EVENT_CREATE_TYPE_PARAMETER, typeParameterReflection, declaration);

        return typeParameter;
    }
}