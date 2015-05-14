module td.converter
{
    /**
     * Convert the given TypeScript type into its TypeDoc type reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The node whose type should be reflected.
     * @param type  The type of the node if already known.
     * @returns The TypeDoc type reflection representing the given node and type.
     */
    export function convertType(context:Context, node?:ts.Node, type?:ts.Type):models.Type {
        if (node) {
            type = type || context.getTypeAtLocation(node);

            // Test for type aliases as early as possible
            if (isTypeAlias(context, <ts.TypeReferenceNode>node, type)) {
                return convertTypeAliasNode(<ts.TypeReferenceNode>node);
            }

            // Node based type conversions by node kind
            switch (node.kind) {
                case ts.SyntaxKind.StringLiteral:
                    return convertStringLiteralExpression(<ts.StringLiteral>node);
                case ts.SyntaxKind.ArrayType:
                    return convertArrayTypeNode(context, <ts.ArrayTypeNode>node);
                case ts.SyntaxKind.TupleType:
                    return convertTupleTypeNode(context, <ts.TupleTypeNode>node);
                case ts.SyntaxKind.UnionType:
                    return convertUnionTypeNode(context, <ts.UnionTypeNode>node);
            }

            // Node based type conversions by type flags
            if (type) {
                if (type.flags & ts.TypeFlags.TypeParameter) {
                    return convertTypeParameterNode(context, <ts.TypeReferenceNode>node);
                } else if (type.flags & ts.TypeFlags.ObjectType) {
                    return convertTypeReferenceNode(context, <ts.TypeReferenceNode>node, <ts.TypeReference>type);
                }
            }
        }

        // Type conversions by type flags
        if (type) {
            if (type.flags & ts.TypeFlags.Intrinsic) {
                return convertIntrinsicType(<ts.IntrinsicType>type);
            } else if (type.flags & ts.TypeFlags.StringLiteral) {
                return convertStringLiteralType(<ts.StringLiteralType>type);
            } else if (type.flags & ts.TypeFlags.Enum) {
                return convertEnumType(context, type);
            } else if (type.flags & ts.TypeFlags.Tuple) {
                return convertTupleType(context, <ts.TupleType>type);
            } else if (type.flags & ts.TypeFlags.Union) {
                return convertUnionType(context, <ts.UnionType>type);
            }  else if (type.flags & ts.TypeFlags.ObjectType) {
                return convertTypeReferenceType(context, <ts.TypeReference>type);
            } else {
                return convertUnknownType(context, type);
            }
        }
    }


    /**
     * Test whether the given node and type definitions represent a type alias.
     *
     * The compiler resolves type aliases pretty early and there is no field telling us
     * whether the given node was a type alias or not. So we have to compare the type name of the
     * node with the type name of the type symbol.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The node that should be tested.
     * @param type  The type of the node that should be tested.
     * @returns TRUE when the given node and type look like a type alias, otherwise FALSE.
     */
    function isTypeAlias(context:Context, node:ts.TypeReferenceNode, type:ts.Type):boolean {
        if (!type || !node || !node.typeName) return false;
        if (!type.symbol) return true;

        var checker = context.checker;
        var symbolName = checker.getFullyQualifiedName(type.symbol).split('.');
        if (!symbolName.length) return false;
        if (symbolName[0].substr(0, 1) == '"') symbolName.shift();

        var nodeName = ts.getTextOfNode(node.typeName).split('.');
        if (!nodeName.length) return false;

        var common = Math.min(symbolName.length, nodeName.length);
        symbolName = symbolName.slice(-common);
        nodeName = nodeName.slice(-common);

        return nodeName.join('.') != symbolName.join('.');
    }


    /**
     * Create a type literal reflection.
     *
     * This is a utility function used by [[convertTypeReferenceNode]] and
     * [[convertTypeReferenceType]] when encountering an object or type literal.
     *
     * A type literal is explicitly set:
     * ```
     * var someValue:{a:string; b:number;};
     * ```
     *
     * An object literal types are usually reflected by the TypeScript compiler:
     * ```
     * function someFunction() { return {a:'Test', b:1024}; }
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param symbol  The symbol describing the type literal.
     * @param node  If known the node which produced the type literal. Type literals that are
     *   implicitly generated by TypeScript won't have a corresponding node.
     * @returns A type reflection representing the given type literal.
     */
    function convertTypeLiteral(context:Context, symbol:ts.Symbol, node?:ts.Node):models.ReflectionType {
        var declaration = new models.DeclarationReflection();
        declaration.kind = models.ReflectionKind.TypeLiteral;
        declaration.name = '__type';
        declaration.parent = context.scope;

        context.registerReflection(declaration, null, symbol);
        context.trigger(Converter.EVENT_CREATE_DECLARATION, declaration, node);
        context.withScope(declaration, () => {
            symbol.declarations.forEach((node) => {
                visit(context, node);
            });
        });

        return new models.ReflectionType(declaration);
    }




    /**
     * Node based type conversions
     */


    /**
     * Create a reflection for the given type alias node.
     *
     * This is a node based converter with no type equivalent.
     *
     * Use [[isTypeAlias]] beforehand to test whether a given type/node combination is
     * pointing to a type alias.
     *
     * ```
     * type MyNumber = number;
     * var someValue:MyNumber;
     * ```
     *
     * @param node  The node whose type should be reflected.
     * @returns  A type reference pointing to the type alias definition.
     */
    function convertTypeAliasNode(node:ts.TypeReferenceNode):models.ReferenceType {
        var name = ts.getTextOfNode(node.typeName);
        return new models.ReferenceType(name, models.ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME);
    }


    /**
     * Convert the given string literal expression node to its type reflection.
     *
     * This is a node based converter, see [[convertStringLiteralType]] for the type equivalent.
     *
     * ```
     * createElement(tagName:"a"):HTMLAnchorElement;
     * ```
     *
     * @param node  The string literal node that should be converted.
     * @returns The type reflection representing the given string literal node.
     */
    function convertStringLiteralExpression(node:ts.StringLiteral):models.StringLiteralType {
        return new models.StringLiteralType(node.text);
    }


    /**
     * Convert the given array type node to its type reflection.
     *
     * This is a node based converter with no type equivalent.
     *
     * ```
     * var someValue:number[];
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The array type node that should be converted.
     * @returns The type reflection representing the given array type node.
     */
    function convertArrayTypeNode(context:Context, node:ts.ArrayTypeNode):models.Type {
        var result = convertType(context, node.elementType);
        if (result) {
            result.isArray = true;
        } else {
            result = new models.IntrinsicType('Array');
        }

        return result;
    }


    /**
     * Convert the given tuple type node to its type reflection.
     *
     * This is a node based converter, see [[convertTupleType]] for the type equivalent.
     *
     * ```
     * var someValue:[string,number];
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The tuple type node that should be converted.
     * @returns The type reflection representing the given tuple type node.
     */
    function convertTupleTypeNode(context:Context, node:ts.TupleTypeNode):models.TupleType {
        var elements;
        if (node.elementTypes) {
            elements = node.elementTypes.map((n) => convertType(context, n));
        } else {
            elements = [];
        }

        return new models.TupleType(elements);
    }


    /**
     * Convert the given union type node to its type reflection.
     *
     * This is a node based converter, see [[convertUnionType]] for the type equivalent.
     *
     * ```
     * var someValue:string|number;
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The union type node that should be converted.
     * @returns The type reflection representing the given union type node.
     */
    function convertUnionTypeNode(context:Context, node:ts.UnionTypeNode):models.UnionType {
        var types = [];
        if (node.types) {
            types = node.types.map((n) => convertType(context, n));
        } else {
            types = [];
        }

        return new models.UnionType(types);
    }


    /**
     * Interpret the given type reference node as a type parameter and convert it to its type reflection.
     *
     * This is a node based converter with no type equivalent.
     *
     * ```
     * class SomeClass<T> {
     *   public someValue:T;
     * }
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The type reference node representing a type parameter.
     * @returns The type reflection representing the given type parameter.
     */
    function convertTypeParameterNode(context:Context, node:ts.TypeReferenceNode):models.Type {
        if (node.typeName) {
            var result, name = ts.getTextOfNode(node.typeName);
            if (context.typeParameters && context.typeParameters[name]) {
                result = context.typeParameters[name].clone();
            } else {
                result = new models.TypeParameterType();
                result.name = name;
            }

            return result;
        }
    }


    /**
     * Convert the type reference node to its type reflection.
     *
     * This is a node based converter, see [[convertTypeReferenceType]] for the type equivalent.
     *
     * ```
     * class SomeClass { }
     * var someValue:SomeClass;
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The type reference node that should be converted.
     * @param type  The type of the type reference node.
     * @returns The type reflection representing the given reference node.
     */
    function convertTypeReferenceNode(context:Context, node:ts.TypeReferenceNode, type:ts.TypeReference):models.Type {
        if (!type.symbol) {
            return new models.IntrinsicType('Object');
        } else if (type.symbol.flags & ts.SymbolFlags.TypeLiteral || type.symbol.flags & ts.SymbolFlags.ObjectLiteral) {
            return convertTypeLiteral(context, type.symbol, node);
        }

        var result = createReferenceType(context, type.symbol);
        if (node.typeArguments) {
            result.typeArguments = node.typeArguments.map((n) => convertType(context, n));
        }

        return result;
    }




    /**
     * Type based type conversions
     */


    /**
     * Convert the given intrinsic type to its type reflection.
     * 
     * This is a type based converter with no node based equivalent.
     *
     * ```
     * var someValue:string;
     * ```
     *
     * @param type  The intrinsic type that should be converted.
     * @returns The type reflection representing the given intrinsic type.
     */
    function convertIntrinsicType(type:ts.IntrinsicType):models.IntrinsicType {
        return new models.IntrinsicType(type.intrinsicName);
    }


    /**
     * Convert the given string literal type to its type reflection.
     *
     * This is a type based converter, see [[convertStringLiteralExpression]] for the node equivalent.
     *
     * ```
     * createElement(tagName:"a"):HTMLAnchorElement;
     * ```
     *
     * @param type  The intrinsic type that should be converted.
     * @returns The type reflection representing the given string literal type.
     */
    function convertStringLiteralType(type:ts.StringLiteralType):models.StringLiteralType {
        return new models.StringLiteralType(type.text);
    }


    /**
     * Convert the given type to its type reflection.
     *
     * This is a type based converter with no node based equivalent.
     * 
     * If no other converter is able to reflect a type, this converter will produce a
     * reflection by utilising ts.typeToString() to generate a string representation of the
     * given type.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param type  The type that should be converted.
     * @returns The type reflection representing the given type.
     */
    function convertUnknownType(context:Context, type:ts.Type):models.Type {
        var name = context.checker.typeToString(type);
        return new models.UnknownType(name);
    }


    /**
     * Convert the given enumeration type to its type reflection.
     *
     * This is a type based converter with no node based equivalent.
     * 
     * ```
     * enum MyEnum { One, Two, Three }
     * var someValue:MyEnum;
     * ```
     * 
     * @param context  The context object describing the current state the converter is in.
     * @param type  The enumeration type that should be converted.
     * @returns The type reflection representing the given enumeration type.
     */
    function convertEnumType(context:Context, type:ts.Type):models.Type {
        return createReferenceType(context, type.symbol);
    }


    /**
     * Convert the given tuple type to its type reflection.
     *
     * This is a type based converter, see [[convertTupleTypeNode]] for the node equivalent.
     *
     * ```
     * var someValue:[string,number];
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param type  The tuple type that should be converted.
     * @returns The type reflection representing the given tuple type.
     */
    function convertTupleType(context:Context, type:ts.TupleType):models.TupleType {
        var elements;
        if (type.elementTypes) {
            elements = type.elementTypes.map((t) => convertType(context, null, t));
        } else {
            elements = [];
        }

        return new models.TupleType(elements);
    }


    /**
     * Convert the given union type to its type reflection.
     *
     * This is a type based converter, see [[convertUnionTypeNode]] for the node equivalent.
     *
     * ```
     * var someValue:string|number;
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param type  The union type that should be converted.
     * @returns The type reflection representing the given union type.
     */
    function convertUnionType(context:Context, type:ts.UnionType):models.UnionType {
        var types;
        if (type && type.types) {
            types = type.types.map((t) => convertType(context, null, t));
        } else {
            types = [];
        }

        return new models.UnionType(types);
    }


    /**
     * Convert the given type reference to its type reflection.
     *
     * This is a type based converter, see [[convertTypeReference]] for the node equivalent.
     *
     * ```
     * class SomeClass { }
     * var someValue:SomeClass;
     * ```
     *
     * @param context  The context object describing the current state the converter is in.
     * @param type  The type reference that should be converted.
     * @returns The type reflection representing the given type reference.
     */
    function convertTypeReferenceType(context:Context, type:ts.TypeReference):models.Type {
        if (!type.symbol) {
            return new models.IntrinsicType('Object');
        } else if (type.symbol.flags & ts.SymbolFlags.TypeLiteral || type.symbol.flags & ts.SymbolFlags.ObjectLiteral) {
            return convertTypeLiteral(context, type.symbol);
        }

        var result = createReferenceType(context, type.symbol);
        if (type.typeArguments) {
            result.typeArguments = type.typeArguments.map((t) => convertType(context, null, t));
        }

        return result;
    }


    /**
     * Convert the given binding pattern to its type reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The binding pattern that should be converted.
     * @returns The type reflection representing the given binding pattern.
     */
    export function convertDestructuringType(context:Context, node:ts.BindingPattern):models.Type {
        if (node.kind == ts.SyntaxKind.ArrayBindingPattern) {
            var types = [];
            node.elements.forEach((element) => {
                types.push(convertType(context, element));
            });
            return new models.TupleType(types);
        } else {
            var declaration = new models.DeclarationReflection();
            declaration.kind = models.ReflectionKind.TypeLiteral;
            declaration.name = '__type';
            declaration.parent = context.scope;

            context.registerReflection(declaration, null);
            context.trigger(Converter.EVENT_CREATE_DECLARATION, declaration, node);
            context.withScope(declaration, () => {
                node.elements.forEach((element) => {
                    visit(context, element);
                });
            });

            return new models.ReflectionType(declaration);
        }
    }
}