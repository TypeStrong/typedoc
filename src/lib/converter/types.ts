import * as assert from "assert";
import * as ts from "typescript";
import {
    ArrayType,
    ConditionalType,
    DeclarationReflection,
    IndexedAccessType,
    InferredType,
    IntersectionType,
    IntrinsicType,
    NamedTupleMember,
    PredicateType,
    QueryType,
    ReferenceType,
    ReflectionKind,
    ReflectionType,
    LiteralType,
    TupleType,
    Type,
    TypeOperatorType,
    UnionType,
    UnknownType,
    MappedType,
} from "../models";
import { Context } from "./context";
import { ConverterEvents } from "./converter-events";
import { createSignature } from "./factories/signature";
import { convertSymbol } from "./symbols";

export interface TypeConverter<
    TNode extends ts.TypeNode = ts.TypeNode,
    TType extends ts.Type = ts.Type
> {
    kind: TNode["kind"][];
    // getTypeAtLocation is expensive, so don't pass the type here.
    convert(
        context: Context,
        node: TNode,
        contextNode: ts.Node | undefined
    ): Type;
    // We use typeToTypeNode to figure out what method to call in the first place,
    // so we have a non-type-checkable node here, necessary for some converters.
    convertType(
        context: Context,
        type: TType,
        node: TNode,
        contextNode: ts.Node | undefined
    ): Type;
}

const converters = new Map<ts.SyntaxKind, TypeConverter>();
export function loadConverters() {
    if (converters.size) return;

    for (const actor of [
        arrayConverter,
        conditionalConverter,
        exprWithTypeArgsConverter,
        indexedAccessConverter,
        inferredConverter,
        intersectionConverter,
        keywordConverter,
        parensConverter,
        predicateConverter,
        queryConverter,
        typeLiteralConverter,
        referenceConverter,
        namedTupleMemberConverter,
        mappedConverter,
        literalTypeConverter,
        thisConverter,
        tupleConverter,
        typeOperatorConverter,
        unionConverter,
    ]) {
        for (const key of actor.kind) {
            assert(!converters.has(key));
            converters.set(key, actor);
        }
    }
}

// This ought not be necessary, but we need some way to discover recursively
// typed symbols which do not have type nodes. See the `recursive` symbol in the variables test.
const seenTypeSymbols = new Set<ts.Symbol>();

export function convertType(
    context: Context,
    typeOrNode: ts.Type | ts.TypeNode | undefined,
    referenceTarget: ts.Node | undefined
) {
    if (!typeOrNode) {
        return new IntrinsicType("any");
    }

    loadConverters();
    if ("kind" in typeOrNode) {
        const converter = converters.get(typeOrNode.kind);
        if (converter) {
            return converter.convert(context, typeOrNode, referenceTarget);
        }
        context.logger.warn(
            `Missing type node converter for kind ${typeOrNode.kind} (${
                ts.SyntaxKind[typeOrNode.kind]
            })`
        );
        return new UnknownType(typeOrNode.getText());
    }

    // IgnoreErrors is important, without it, we can't assert that we will get a node.
    const node = context.checker.typeToTypeNode(
        typeOrNode,
        void 0,
        ts.NodeBuilderFlags.IgnoreErrors
    );
    assert(node); // According to the TS source of typeToString, this is a bug if it does not hold.

    const symbol = typeOrNode.getSymbol();
    if (symbol) {
        if (
            node.kind !== ts.SyntaxKind.TypeReference &&
            seenTypeSymbols.has(symbol)
        ) {
            const typeString = context.checker.typeToString(typeOrNode);
            context.logger.verbose(
                `Refusing to recurse when converting type: ${typeString}`
            );
            return new UnknownType(typeString);
        }
        seenTypeSymbols.add(symbol);
    }

    const converter = converters.get(node.kind);
    if (converter) {
        const result = converter.convertType(
            context,
            typeOrNode,
            node,
            referenceTarget
        );
        if (symbol) seenTypeSymbols.delete(symbol);
        return result;
    }

    context.logger.warn(
        `Missing type converter for type: ${context.checker.typeToString(
            typeOrNode
        )}`
    );
    return new UnknownType(context.checker.typeToString(typeOrNode));
}

const arrayConverter: TypeConverter<ts.ArrayTypeNode, ts.TypeReference> = {
    kind: [ts.SyntaxKind.ArrayType],
    convert(context, node, target) {
        return new ArrayType(convertType(context, node.elementType, target));
    },
    convertType(context, type, target) {
        const params = context.checker.getTypeArguments(type);
        assert(params.length === 1);
        return new ArrayType(convertType(context, params[0], target));
    },
};

const conditionalConverter: TypeConverter<
    ts.ConditionalTypeNode,
    ts.ConditionalType
> = {
    kind: [ts.SyntaxKind.ConditionalType],
    convert(context, node, target) {
        return new ConditionalType(
            convertType(context, node.checkType, target),
            convertType(context, node.extendsType, target),
            convertType(context, node.trueType, target),
            convertType(context, node.falseType, target)
        );
    },
    convertType(context, type, target) {
        return new ConditionalType(
            convertType(context, type.checkType, target),
            convertType(context, type.extendsType, target),
            convertType(context, type.resolvedTrueType, target),
            convertType(context, type.resolvedFalseType, target)
        );
    },
};

const exprWithTypeArgsConverter: TypeConverter<
    ts.ExpressionWithTypeArguments,
    ts.Type
> = {
    kind: [ts.SyntaxKind.ExpressionWithTypeArguments],
    convert(context, node, target) {
        const targetSymbol = context.getSymbolAtLocation(node.expression);
        // Mixins... we might not have a symbol here.
        if (!targetSymbol) {
            return convertType(
                context,
                context.checker.getTypeAtLocation(node),
                target
            );
        }
        const parameters =
            node.typeArguments?.map((type) =>
                convertType(context, type, target)
            ) ?? [];
        const ref = new ReferenceType(
            targetSymbol.name,
            context.resolveAliasedSymbol(targetSymbol),
            context.project
        );
        ref.typeArguments = parameters;
        return ref;
    },
    convertType: requestBugReport,
};

const indexedAccessConverter: TypeConverter<
    ts.IndexedAccessTypeNode,
    ts.IndexedAccessType
> = {
    kind: [ts.SyntaxKind.IndexedAccessType],
    convert(context, node, target) {
        return new IndexedAccessType(
            convertType(context, node.objectType, target),
            convertType(context, node.indexType, target)
        );
    },
    convertType(context, type, target) {
        return new IndexedAccessType(
            convertType(context, type.objectType, target),
            convertType(context, type.indexType, target)
        );
    },
};

const inferredConverter: TypeConverter<ts.InferTypeNode> = {
    kind: [ts.SyntaxKind.InferType],
    convert(_context, node) {
        return new InferredType(node.typeParameter.getText());
    },
    convertType(_context, type) {
        return new InferredType(type.symbol.name);
    },
};

const intersectionConverter: TypeConverter<
    ts.IntersectionTypeNode,
    ts.IntersectionType
> = {
    kind: [ts.SyntaxKind.IntersectionType],
    convert(context, node, target) {
        return new IntersectionType(
            node.types.map((type) => convertType(context, type, target))
        );
    },
    convertType(context, type, target) {
        return new IntersectionType(
            type.types.map((type) => convertType(context, type, target))
        );
    },
};

const keywordNames = {
    [ts.SyntaxKind.AnyKeyword]: "any",
    [ts.SyntaxKind.BigIntKeyword]: "bigint",
    [ts.SyntaxKind.BooleanKeyword]: "boolean",
    [ts.SyntaxKind.NeverKeyword]: "never",
    [ts.SyntaxKind.NumberKeyword]: "number",
    [ts.SyntaxKind.ObjectKeyword]: "object",
    [ts.SyntaxKind.StringKeyword]: "string",
    [ts.SyntaxKind.SymbolKeyword]: "symbol",
    [ts.SyntaxKind.UndefinedKeyword]: "undefined",
    [ts.SyntaxKind.UnknownKeyword]: "unknown",
    [ts.SyntaxKind.VoidKeyword]: "void",
    [ts.SyntaxKind.IntrinsicKeyword]: "intrinsic",
};

const keywordConverter: TypeConverter<ts.KeywordTypeNode> = {
    kind: [
        ts.SyntaxKind.AnyKeyword,
        ts.SyntaxKind.BigIntKeyword,
        ts.SyntaxKind.BooleanKeyword,
        ts.SyntaxKind.NeverKeyword,
        ts.SyntaxKind.NumberKeyword,
        ts.SyntaxKind.ObjectKeyword,
        ts.SyntaxKind.StringKeyword,
        ts.SyntaxKind.SymbolKeyword,
        ts.SyntaxKind.UndefinedKeyword,
        ts.SyntaxKind.UnknownKeyword,
        ts.SyntaxKind.VoidKeyword,
    ],
    convert(_context, node) {
        return new IntrinsicType(keywordNames[node.kind]);
    },
    convertType(_context, _type, node) {
        return new IntrinsicType(keywordNames[node.kind]);
    },
};

const parensConverter: TypeConverter<ts.ParenthesizedTypeNode> = {
    kind: [ts.SyntaxKind.ParenthesizedType],
    convert(context, node, target) {
        return convertType(context, node.type, target);
    },
    // TS strips these out too... shouldn't run into this.
    convertType: requestBugReport,
};

const predicateConverter: TypeConverter<ts.TypePredicateNode, ts.Type> = {
    kind: [ts.SyntaxKind.TypePredicate],
    convert(context, node, target) {
        const name = ts.isThisTypeNode(node.parameterName)
            ? "this"
            : node.parameterName.getText();
        const asserts = !!node.assertsModifier;
        const targetType = node.type
            ? convertType(context, node.type, target)
            : void 0;
        return new PredicateType(name, asserts, targetType);
    },
    // Never inferred by TS 4.0, could potentially change in a future TS version.
    convertType: requestBugReport,
};

// This is a horrible thing... we're going to want to split this into converters
// for different types at some point.
const typeLiteralConverter: TypeConverter<
    ts.TypeLiteralNode | ts.FunctionTypeNode
> = {
    kind: [ts.SyntaxKind.TypeLiteral, ts.SyntaxKind.FunctionType],
    convert(context, node) {
        const symbol = context.getSymbolAtLocation(node) ?? node.symbol;
        const type = context.getTypeAtLocation(node);
        if (!symbol || !type) {
            return new IntrinsicType("Object");
        }

        const reflection = new DeclarationReflection(
            "__type",
            ReflectionKind.TypeLiteral,
            context.scope
        );
        context.registerReflection(reflection, symbol);
        context.trigger(ConverterEvents.CREATE_DECLARATION, reflection, node);

        for (const prop of context.checker.getPropertiesOfType(type)) {
            convertSymbol(context.withScope(reflection), prop);
        }
        for (const signature of type.getCallSignatures()) {
            reflection.signatures ??= [];
            reflection.signatures.push(
                createSignature(
                    context.withScope(reflection),
                    ReflectionKind.CallSignature,
                    signature
                )
            );
        }

        return new ReflectionType(reflection);
    },
    convertType(context, type) {
        if (!type.symbol) {
            return new IntrinsicType("Object");
        }

        const reflection = new DeclarationReflection(
            "__type",
            ReflectionKind.TypeLiteral,
            context.scope
        );
        context.registerReflection(reflection, type.symbol);
        context.trigger(ConverterEvents.CREATE_DECLARATION, reflection);

        for (const prop of context.checker.getPropertiesOfType(type)) {
            convertSymbol(context.withScope(reflection), prop);
        }
        for (const signature of type.getCallSignatures()) {
            reflection.signatures ??= [];
            reflection.signatures.push(
                createSignature(
                    context.withScope(reflection),
                    ReflectionKind.CallSignature,
                    signature
                )
            );
        }

        return new ReflectionType(reflection);
    },
};

const queryConverter: TypeConverter<ts.TypeQueryNode> = {
    kind: [ts.SyntaxKind.TypeQuery],
    convert(context, node) {
        const querySymbol = context.expectSymbolAtLocation(node.exprName);
        return new QueryType(
            new ReferenceType(
                node.exprName.getText(),
                context.resolveAliasedSymbol(querySymbol),
                context.project
            )
        );
    },
    convertType(context, type) {
        const symbol = type.getSymbol();
        assert(
            symbol,
            `Query type failed to get a symbol for: ${context.checker.typeToString(
                type
            )}. This is a bug.`
        );
        return new QueryType(
            new ReferenceType(
                symbol.name,
                context.resolveAliasedSymbol(symbol),
                context.project
            )
        );
    },
};

const referenceConverter: TypeConverter<
    ts.TypeReferenceNode,
    ts.TypeReference
> = {
    kind: [ts.SyntaxKind.TypeReference],
    convert(context, node, target) {
        const symbol = context.expectSymbolAtLocation(node.typeName);
        // We might need to resolve this type (e.g a parent class has a property with a generic type)
        // but we are in a child type, so the generic type should be resolved to a concrete one.
        if (target && symbol.flags & ts.SymbolFlags.TypeParameter) {
            const resolvedType = context.checker.getTypeOfSymbolAtLocation(
                symbol,
                target
            );
            if (!isErrorType(resolvedType) && !resolvedType.isTypeParameter()) {
                return convertType(context, resolvedType, target);
            }
        }

        const name = node.typeName.getText();

        const type = new ReferenceType(
            name,
            context.resolveAliasedSymbol(symbol),
            context.project
        );
        type.typeArguments = node.typeArguments?.map((type) =>
            convertType(context, type, target)
        );
        return type;
    },
    convertType(context, type, target) {
        const symbol = type.aliasSymbol ?? type.getSymbol();
        if (!symbol) {
            // If we get in here, the user is doing something bad. Probably using mixins.
            const broken = new UnknownType(context.checker.typeToString(type));
            context.logger.warn(`Bad reference type: ${broken.name}`);
            return broken;
        }

        const ref = new ReferenceType(
            symbol.name,
            context.resolveAliasedSymbol(symbol),
            context.project
        );
        ref.typeArguments = type.aliasTypeArguments?.map((ref) =>
            convertType(context, ref, target)
        );
        return ref;
    },
};

const namedTupleMemberConverter: TypeConverter<ts.NamedTupleMember> = {
    kind: [ts.SyntaxKind.NamedTupleMember],
    convert(context, node, target) {
        const innerType = convertType(context, node.type, target);
        return new NamedTupleMember(
            node.name.getText(),
            !!node.questionToken,
            innerType
        );
    },
    // This ought to be impossible.
    convertType: requestBugReport,
};

// { -readonly [K in string]-?: number}
//   ^ readonlyToken
//              ^ typeParameter
//                   ^^^^^^ typeParameter.constraint
//                          ^ questionToken
//                              ^^^^^^ type
const mappedConverter: TypeConverter<
    ts.MappedTypeNode,
    ts.Type & {
        // Beware! Internal TS API here.
        templateType: ts.Type;
        typeParameter: ts.TypeParameter;
        constraintType: ts.Type;
    }
> = {
    kind: [ts.SyntaxKind.MappedType],
    convert(context, node, target) {
        const optionalModifier = kindToModifier(node.questionToken?.kind);
        const templateType = convertType(context, node.type, target);

        return new MappedType(
            node.typeParameter.name.text,
            convertType(context, node.typeParameter.constraint, target),
            optionalModifier === "+"
                ? removeUndefined(templateType)
                : templateType,
            kindToModifier(node.readonlyToken?.kind),
            optionalModifier
        );
    },
    convertType(context, type, node, target) {
        // This can happen if a generic function does not have a return type annotated.
        const optionalModifier = kindToModifier(node.questionToken?.kind);
        const templateType = convertType(context, type.templateType, target);

        return new MappedType(
            type.typeParameter.symbol?.name,
            convertType(context, type.typeParameter.getConstraint(), target),
            optionalModifier === "+"
                ? removeUndefined(templateType)
                : templateType,
            kindToModifier(node.readonlyToken?.kind),
            optionalModifier
        );
    },
};

const literalTypeConverter: TypeConverter<
    ts.LiteralTypeNode,
    ts.LiteralType
> = {
    kind: [ts.SyntaxKind.LiteralType],
    convert(context, node) {
        switch (node.literal.kind) {
            case ts.SyntaxKind.TrueKeyword:
            case ts.SyntaxKind.FalseKeyword:
                return new LiteralType(
                    node.literal.kind === ts.SyntaxKind.TrueKeyword
                );
            case ts.SyntaxKind.StringLiteral:
                return new LiteralType(node.literal.text);
            case ts.SyntaxKind.NumericLiteral:
                return new LiteralType(Number(node.literal.text));
            case ts.SyntaxKind.NullKeyword:
                return new LiteralType(null);
            case ts.SyntaxKind.PrefixUnaryExpression: {
                const operand = (node.literal as ts.PrefixUnaryExpression)
                    .operand;
                switch (operand.kind) {
                    case ts.SyntaxKind.NumericLiteral:
                        return new LiteralType(Number(node.literal.getText()));
                    case ts.SyntaxKind.BigIntLiteral:
                        return new LiteralType(
                            BigInt(node.literal.getText().replace("n", ""))
                        );
                    default:
                        return requestBugReport(context, node.literal);
                }
            }
            case ts.SyntaxKind.BigIntLiteral:
                return new LiteralType(
                    BigInt(node.literal.getText().replace("n", ""))
                );
        }

        return requestBugReport(context, node.literal);
    },
    convertType(context, type, node) {
        switch (node.literal.kind) {
            case ts.SyntaxKind.StringLiteral:
                return new LiteralType(node.literal.text);
            case ts.SyntaxKind.NumericLiteral:
                return new LiteralType(+node.literal.text);
            case ts.SyntaxKind.TrueKeyword:
            case ts.SyntaxKind.FalseKeyword:
                return new LiteralType(
                    node.literal.kind === ts.SyntaxKind.TrueKeyword
                );
            case ts.SyntaxKind.NullKeyword:
                return new LiteralType(null);
        }

        if (typeof type.value === "object") {
            return new LiteralType(
                BigInt(
                    `${type.value.negative ? "-" : ""}${type.value.base10Value}`
                )
            );
        }

        return requestBugReport(context, type);
    },
};

const thisConverter: TypeConverter<ts.ThisTypeNode> = {
    kind: [ts.SyntaxKind.ThisType],
    convert() {
        return new IntrinsicType("this");
    },
    convertType() {
        return new IntrinsicType("this");
    },
};

const tupleConverter: TypeConverter<ts.TupleTypeNode, ts.TupleType> = {
    kind: [ts.SyntaxKind.TupleType],
    convert(context, node, target) {
        // TS 3.9 support
        const elementTypes = node.elements ?? (node as any).elementTypes;
        const elements = elementTypes.map((node) =>
            convertType(context, node, target)
        );
        return new TupleType(elements);
    },
    convertType(context, type, node, target) {
        let elements = type.typeArguments?.map((type) =>
            convertType(context, type, target)
        );

        if (node.elements.every(ts.isNamedTupleMember)) {
            const namedMembers = node.elements as readonly ts.NamedTupleMember[];
            elements = elements?.map(
                (el, i) =>
                    new NamedTupleMember(
                        namedMembers[i].name.text,
                        !!namedMembers[i].questionToken,
                        removeUndefined(el)
                    )
            );
        }

        return new TupleType(elements ?? []);
    },
};

const supportedOperatorNames = {
    [ts.SyntaxKind.KeyOfKeyword]: "keyof",
    [ts.SyntaxKind.UniqueKeyword]: "unique",
    [ts.SyntaxKind.ReadonlyKeyword]: "readonly",
} as const;

const typeOperatorConverter: TypeConverter<ts.TypeOperatorNode> = {
    kind: [ts.SyntaxKind.TypeOperator],
    convert(context, node, target) {
        return new TypeOperatorType(
            convertType(context, node.type, target),
            supportedOperatorNames[node.operator]
        );
    },
    convertType(context, type, node, target) {
        // readonly is only valid on array and tuple literal types.
        if (node.operator === ts.SyntaxKind.ReadonlyKeyword) {
            assert(isObjectType(type));
            const args = context.checker
                .getTypeArguments(type as ts.TypeReference)
                .map((type) => convertType(context, type, target));
            const inner =
                type.objectFlags & ts.ObjectFlags.Tuple
                    ? new TupleType(args)
                    : new ArrayType(args[0]);

            return new TypeOperatorType(inner, "readonly");
        }

        // keyof will only show up with generic functions, otherwise it gets eagerly
        // resolved to a union of strings.
        if (node.operator === ts.SyntaxKind.KeyOfKeyword) {
            // There's probably an interface for this somewhere... I couldn't find it.
            const targetType = (type as ts.Type & { type: ts.Type }).type;
            return new TypeOperatorType(
                convertType(context, targetType, target),
                "keyof"
            );
        }

        // TS drops `unique` in `unique symbol` everywhere. If someone used it, we ought
        // to have a type node. This shouldn't ever happen.
        return requestBugReport(context, type);
    },
};

const unionConverter: TypeConverter<ts.UnionTypeNode, ts.UnionType> = {
    kind: [ts.SyntaxKind.UnionType],
    convert(context, node, target) {
        return new UnionType(
            node.types.map((type) => convertType(context, type, target))
        );
    },
    convertType(context, type, target) {
        return new UnionType(
            type.types.map((type) => convertType(context, type, target))
        );
    },
};

function requestBugReport(context: Context, nodeOrType: ts.Node | ts.Type) {
    if ("kind" in nodeOrType) {
        const kindName = ts.SyntaxKind[nodeOrType.kind];
        const { line, character } = ts.getLineAndCharacterOfPosition(
            nodeOrType.getSourceFile(),
            nodeOrType.pos
        );
        context.logger.warn(
            `Failed to convert type node with kind: ${kindName} and text ${nodeOrType.getText()}. Please report a bug.\n\t` +
                `${nodeOrType.getSourceFile().fileName}:${
                    line + 1
                }:${character}`
        );
        return new UnknownType(nodeOrType.getText());
    } else {
        const typeString = context.checker.typeToString(nodeOrType);
        context.logger.warn(
            `Failed to convert type: ${typeString}. Please report a bug.`
        );
        return new UnknownType(typeString);
    }
}

function isObjectType(type: ts.Type): type is ts.ObjectType {
    return typeof (type as any).objectFlags === "number";
}

function kindToModifier(
    kind:
        | ts.SyntaxKind.PlusToken
        | ts.SyntaxKind.MinusToken
        | ts.SyntaxKind.ReadonlyKeyword
        | ts.SyntaxKind.QuestionToken
        | undefined
): "+" | "-" | undefined {
    switch (kind) {
        case ts.SyntaxKind.ReadonlyKeyword:
        case ts.SyntaxKind.QuestionToken:
        case ts.SyntaxKind.PlusToken:
            return "+";
        case ts.SyntaxKind.MinusToken:
            return "-";
        default:
            return undefined;
    }
}

function removeUndefined(type: Type) {
    if (type instanceof UnionType) {
        const types = type.types.filter(
            (t) => !t.equals(new IntrinsicType("undefined"))
        );
        if (types.length === 1) {
            return types[0];
        }
        type.types = types;
        return type;
    }
    return type;
}

function isErrorType(type: ts.Type) {
    return (type as any).intrinsicName === "error";
}
