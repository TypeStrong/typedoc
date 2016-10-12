import * as ts from "typescript";
import { Reflection } from "../../models/index";
import { Context } from "../context";
import { ConverterNodeComponent } from "../components";
export declare class ModuleConverter extends ConverterNodeComponent<ts.ModuleDeclaration> {
    supports: ts.SyntaxKind[];
    convert(context: Context, node: ts.ModuleDeclaration): Reflection;
}
