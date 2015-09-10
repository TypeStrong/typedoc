import * as ts from "typescript";

import {Type} from "../models/types/abstract";
import {Context} from "./context";


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
function loadConverters(converterClasses:{})
{
    nodeConverters = [];
    typeConverters = [];

    for (var converterName in converterClasses) {
        var converterClass = converterClasses[converterName];
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
loadConverters(require("./types/index"));
