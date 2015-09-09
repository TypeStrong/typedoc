import * as ts from "typescript";

import {Type} from "../../models/Type";
import {Context} from "../Context";
import * as types from "./types/index"


export interface TypeConverter<T extends ts.Type, N extends ts.Node>
        extends TypeTypeConverter<T>, TypeNodeConverter<T, N> {}


export interface TypeTypeConverter<T extends ts.Type>
{
    /**
     * The priority this converter should be executed with.
     * A higher priority means the converter will be applied earlier.
     */
    priority?:number;

    /**
     * Test whether this converter can handle the given TypeScript type.
     */
    supportsType(context:Context, type:T):boolean;

    /**
     * Convert the given type to its type reflection.
     */
    convertType(context:Context, type:T):Type;
}


export interface TypeNodeConverter<T extends ts.Type, N extends ts.Node>
{
    /**
     * The priority this converter should be executed.
     * A higher priority means the converter will be applied earlier.
     */
    priority?:number;

    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(context:Context, node:N, type:T):boolean;

    /**
     * Convert the given type node to its type reflection.
     */
    convertNode(context:Context, node:N, type:T):Type;
}


var nodeConverters:TypeNodeConverter<ts.Type, ts.Node>[];

var typeConverters:TypeTypeConverter<ts.Type>[];


/**
 * Instantiates all type converters.
 */
function loadConverters()
{
    nodeConverters = [];
    typeConverters = [];

    for (var typeName in types) {
        var converterClass = types[typeName];
        var converter = new converterClass();

        if (converter.supportsNode && converter.convertNode) {
            nodeConverters.push(converter);
        }

        if (converter.supportsType && converter.convertType) {
            typeConverters.push(converter);
        }
    }

    nodeConverters.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    typeConverters.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}


/**
 * Convert the given TypeScript type into its TypeDoc type reflection.
 *
 * @param context  The context object describing the current state the converter is in.
 * @param node  The node whose type should be reflected.
 * @param type  The type of the node if already known.
 * @returns The TypeDoc type reflection representing the given node and type.
 */
export function convertType(context:Context, node?:ts.Node, type?:ts.Type):Type {
    // Run all node based type conversions
    if (node) {
        type = type || context.getTypeAtLocation(node);

        for (let converter of nodeConverters) {
            if (converter.supportsNode(context, node, type)) {
                return converter.convertNode(context, node, type);
            }
        }
    }

    // Run all type based type conversions
    if (type) {
        for (let converter of typeConverters) {
            if (converter.supportsType(context, type)) {
                return converter.convertType(context, type);
            }
        }
    }
}


/**
 * Instantiate the type converters.
 */
loadConverters();



/**
 * Convert the given TypeScript type into its TypeDoc type reflection.
 *
 * @param context  The context object describing the current state the converter is in.
 * @param node  The node whose type should be reflected.
 * @param type  The type of the node if already known.
 * @returns The TypeDoc type reflection representing the given node and type.
export function convertTypeLegacy(context:Context, node?:ts.Node, type?:ts.Type):Type {
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
*/
