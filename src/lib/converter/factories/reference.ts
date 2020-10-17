import * as ts from "typescript";

import {
    ReferenceType,
    ReferenceReflection,
    ContainerReflection,
    DeclarationReflection,
    ReflectionKind,
} from "../../models";
import { Context } from "../context";
import { ReferenceState } from "../../models/reflections/reference";
import { Converter } from "../converter";
import { createDeclaration } from "./declaration";

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

    return new ReferenceType(
        name,
        context.checker.getFullyQualifiedName(symbol)
    );
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

    const targetFqn = context.checker.getFullyQualifiedName(target);
    let reflection: DeclarationReflection | undefined;
    if (context.project.getReflectionFromFQN(targetFqn)) {
        reflection = new ReferenceReflection(
            source.name,
            [
                ReferenceState.Unresolved,
                context.checker.getFullyQualifiedName(target),
            ],
            context.scope
        );

        // target === source happens when doing export * from ...
        // and the original symbol is not renamed and exported from the imported module.
        context.registerReflection(
            reflection,
            target === source ? undefined : source
        );
        context.scope.children ??= [];
        context.scope.children.push(reflection);
        context.trigger(Converter.EVENT_CREATE_DECLARATION, reflection);
    } else {
        reflection = createDeclaration(
            context,
            target.valueDeclaration,
            ReflectionKind.Variable,
            source.name
        );
    }

    return reflection;
}
