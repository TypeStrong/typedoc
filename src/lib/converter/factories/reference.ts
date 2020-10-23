import * as ts from "typescript";

import {
    ReferenceType,
    ReferenceReflection,
    ContainerReflection,
    DeclarationReflection,
} from "../../models";
import { Context } from "../context";
import { Converter } from "../converter";

/**
 * Create a new reference type pointing to the given symbol.
 *
 * @param context  The context object describing the current state the converter is in.
 * @param symbol  The symbol the reference type should point to.
 * @param includeParent  Should the name of the parent be provided within the fallback name?
 * @returns A new reference type instance pointing to the given symbol.
 */
export function createReferenceType(
    context: Context,
    symbol: ts.Symbol | undefined,
    includeParent?: boolean
): ReferenceType | undefined {
    if (!symbol) {
        return;
    }

    const checker = context.checker;
    let name = checker.symbolToString(symbol);

    if (includeParent && symbol.parent) {
        name = checker.symbolToString(symbol.parent) + "." + name;
    }

    return new ReferenceType(name, symbol, context.project);
}

export function createReferenceOrDeclarationReflection(
    context: Context,
    source: ts.Symbol,
    target: ts.Symbol
): DeclarationReflection | undefined {
    if (!(context.scope instanceof ContainerReflection)) {
        throw new Error("Cannot add reference to a non-container");
    }

    // If any declaration is outside, the symbol should be considered outside. Some declarations may
    // be inside due to declaration merging.
    const declarations = target.getDeclarations();
    if (
        !declarations ||
        declarations.some((d) =>
            context.isOutsideDocumentation(d.getSourceFile().fileName)
        )
    ) {
        return;
    }

    let reflection: DeclarationReflection | undefined = undefined;
    if (context.project.getReflectionFromSymbol(target)) {
        reflection = new ReferenceReflection(
            source.name,
            target,
            context.scope
        );

        context.registerReflection(reflection, source);
        context.scope.children ??= [];
        context.scope.children.push(reflection);
        context.trigger(Converter.EVENT_CREATE_DECLARATION, reflection);
    } else if (target.getDeclarations()?.[0]) {
        const refl = context.converter.convertNode(
            context,
            target.declarations[0]
        );
        if (refl instanceof DeclarationReflection) {
            refl.name = source.name;
            reflection = refl;
        }
    }

    return reflection;
}
