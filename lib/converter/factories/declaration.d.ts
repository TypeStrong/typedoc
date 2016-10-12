import * as ts from "typescript";
import { ReflectionKind, DeclarationReflection } from "../../models/index";
import { Context } from "../context";
export declare function createDeclaration(context: Context, node: ts.Node, kind: ReflectionKind, name?: string): DeclarationReflection;
