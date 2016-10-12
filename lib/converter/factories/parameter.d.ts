import * as ts from "typescript";
import { ParameterReflection } from "../../models/reflections/index";
import { Context } from "../context";
export declare function createParameter(context: Context, node: ts.ParameterDeclaration): ParameterReflection;
