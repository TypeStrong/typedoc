import * as ts from "typescript";
import { Reflection } from "../../models/index";
import { Context } from "../context";
import { ConverterNodeComponent } from "../components";
export declare class EnumConverter extends ConverterNodeComponent<ts.EnumDeclaration> {
    supports: ts.SyntaxKind[];
    convert(context: Context, node: ts.EnumDeclaration): Reflection;
    private convertMember(context, node);
}
