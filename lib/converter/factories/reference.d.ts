import * as ts from "typescript";
import { ReferenceType } from "../../models/types/index";
import { Context } from "../context";
export declare function createReferenceType(context: Context, symbol: ts.Symbol, includeParent?: boolean): ReferenceType;
