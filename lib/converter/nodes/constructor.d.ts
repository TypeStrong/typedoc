import * as ts from "typescript";
import { Reflection } from "../../models/index";
import { Context } from "../context";
import { ConverterNodeComponent } from "../components";
export declare class ConstructorConverter extends ConverterNodeComponent<ts.ConstructorDeclaration> {
    supports: ts.SyntaxKind[];
    convert(context: Context, node: ts.ConstructorDeclaration): Reflection;
    private addParameterProperty(context, parameter, comment);
}
