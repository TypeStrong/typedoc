import * as ts from "typescript";

import {Application} from "../application";
import {Component, AbstractComponent} from "../utils/component";
import {Reflection} from "../models/reflections/abstract";
import {Type} from "../models/types/abstract";
import {Context} from "./context";
import {Converter} from "./converter";


export {Component};


export abstract class ConverterComponent extends AbstractComponent<Converter> { }


export abstract class ConverterNodeComponent<T extends ts.Node> extends ConverterComponent
{
    /**
     * List of supported TypeScript syntax kinds.
     */
    supports:ts.SyntaxKind[];


    abstract convert(context:Context, node:T):Reflection;
}


export abstract class ConverterTypeComponent extends ConverterComponent
{
    /**
     * The priority this converter should be executed with.
     * A higher priority means the converter will be applied earlier.
     */
    priority:number = 0;
}


export interface ITypeConverter<T extends ts.Type, N extends ts.Node>
        extends ConverterTypeComponent, ITypeTypeConverter<T>, ITypeNodeConverter<T, N> {}


export interface ITypeTypeConverter<T extends ts.Type> extends ConverterTypeComponent
{
    /**
     * Test whether this converter can handle the given TypeScript type.
     */
    supportsType(context:Context, type:T):boolean;

    /**
     * Convert the given type to its type reflection.
     */
    convertType(context:Context, type:T):Type;
}


export interface ITypeNodeConverter<T extends ts.Type, N extends ts.Node> extends ConverterTypeComponent
{
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(context:Context, node:N, type:T):boolean;

    /**
     * Convert the given type node to its type reflection.
     */
    convertNode(context:Context, node:N, type:T):Type;
}
