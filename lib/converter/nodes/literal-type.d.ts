import * as ts from "typescript";
import { Reflection } from "../../models/index";
import { Context } from "../context";
import { ConverterNodeComponent } from "../components";
export declare class TypeLiteralConverter extends ConverterNodeComponent<ts.TypeLiteralNode> {
    supports: ts.SyntaxKind[];
    convert(context: Context, node: ts.TypeLiteralNode): Reflection;
}
