import * as ts from 'typescript';

import { ReferenceType, ReferenceReflection, ContainerReflection, ReflectionFlag } from '../../models';
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
    let name = checker.symbolToString(symbol);

    if (includeParent && symbol.parent) {
        name = checker.symbolToString(symbol.parent) + '.' + name;
    }

    const FQN = context.getFullyQualifiedName(symbol);
    context.saveRemainingSymbolReflection(FQN, symbol);

    return new ReferenceType(name, FQN);
}

export function createReferenceReflection(context: Context, source: ts.Symbol, target: ts.Symbol): ReferenceReflection | undefined {
    if (!(context.scope instanceof ContainerReflection)) {
        throw new Error('Cannot add reference to a non-container');
    }

    // If any declaration is outside, the symbol should be considered outside. Some declarations may
    // be inside due to declaration merging.
    if (target.declarations.some(d => context.isOutsideDocumentation(d.getSourceFile().fileName))) {
        return;
    }

    const reflection = new ReferenceReflection(source.name, [ReferenceState.Unresolved, context.getFullyQualifiedName(target)], context.scope);
    reflection.flags.setFlag(ReflectionFlag.Exported, true); // References are exported by necessity
    if (!context.scope.children) {
        context.scope.children = [];
    }
    context.scope.children.push(reflection);
    context.registerReflection(reflection, source);
    context.trigger(Converter.EVENT_CREATE_DECLARATION, reflection);

    return reflection;
}
