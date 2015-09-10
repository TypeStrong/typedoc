import * as ts from "typescript";

import {ReferenceType} from "../../models/types/index";
import {Context} from "../context";


/**
 * Create a new reference type pointing to the given symbol.
 *
 * @param context  The context object describing the current state the converter is in.
 * @param symbol  The symbol the reference type should point to.
 * @param includeParent  Should the name of the parent be provided within the fallback name?
 * @returns A new reference type instance pointing to the given symbol.
 */
export function createReferenceType(context:Context, symbol:ts.Symbol, includeParent?:boolean):ReferenceType {
    var checker = context.checker;
    var id      = context.getSymbolID(symbol);
    var name    = checker.symbolToString(symbol);

    if (includeParent && symbol.parent) {
        name = checker.symbolToString(symbol.parent) + '.' + name;
    }

    return new ReferenceType(name, id);
}
