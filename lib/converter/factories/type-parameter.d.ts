import * as ts from "typescript";
import { TypeParameterType } from "../../models/index";
import { Context } from "../context";
export declare function createTypeParameter(context: Context, node: ts.TypeParameterDeclaration): TypeParameterType;
