import * as ts from 'typescript';

import { ReferenceType, ReferenceReflection, ContainerReflection } from '../../models';
import { Context } from '../context';
import { ReferenceState } from '../../models/reflections/reference';
import { Converter } from '../converter';

/**
 * Create a new reference type pointing to the given symbol.
 *
 * @param context  The context object describing the current state the converter is in.
 * @param symbol  The symbol the reference type should point to.
 * @param includeParent  Should the name of the parent be provided within the fallback name?
 * @returns A new reference type instance pointing to the given symbol.
 */
export function createReferenceType(context: Context, symbol: ts.Symbol | undefined, includeParent?: boolean): ReferenceType | undefined {
    if (!symbol) {
        return;
    }

    const checker = context.checker;
    const id = context.getSymbolID(symbol)!;
    let name = checker.symbolToString(symbol);

    if (includeParent && symbol.parent) {
        name = checker.symbolToString(symbol.parent) + '.' + name;
    }

    return new ReferenceType(name, id);
}

export function createReferenceReflection(context: Context, source: ts.Symbol, target: ts.Symbol): ReferenceReflection {
    if (!(context.scope instanceof ContainerReflection)) {
        throw new Error('Cannot add reference to a non-container');
    }

    const reflection = new ReferenceReflection(source.name, [ReferenceState.Unresolved, context.getSymbolID(target)!], context.scope);
    if (!context.scope.children) {
        context.scope.children = [];
    }
    context.scope.children.push(reflection);
    context.registerReflection(reflection, undefined, source);
    context.trigger(Converter.EVENT_CREATE_DECLARATION, reflection);

    return reflection;
}
