import {
    ContainerReflection,
    DeclarationReflection,
    makeRecursiveVisitor,
    ParameterReflection,
    ProjectReflection,
    Reflection,
    SignatureReflection,
    TypeParameterReflection,
    TypeVisitor,
} from "../models";
import type { Logger } from "../utils";
import * as ts from "typescript";
import { relative } from "path";

export function validateExports(
    project: ProjectReflection,
    logger: Logger,
    intentionallyNotExported: readonly string[]
) {
    const queue: Reflection[] = [];
    const context: { reflection: Reflection } = { reflection: project };
    const seenIntentional = new Set<string>();

    const visitor = makeTypeVisitor(
        logger,
        queue,
        new Set(intentionallyNotExported),
        seenIntentional,
        context
    );

    const add = (item: Reflection | Reflection[] | undefined) => {
        if (!item) return;

        if (item instanceof Reflection) {
            queue.push(item);
        } else {
            queue.push(...item);
        }
    };
    let current: Reflection | undefined = project;

    do {
        context.reflection = current;

        if (current instanceof ContainerReflection) {
            add(current.children);
        }

        if (current instanceof DeclarationReflection) {
            current.type?.visit(visitor);
            add(current.typeParameters);
            add(current.signatures);
            add(current.indexSignature);
            add(current.getSignature);
            add(current.setSignature);
            current.overwrites?.visit(visitor);
            // Do not check inheritedFrom, it doesn't always make sense to export a base type.
            current.implementationOf?.visit(visitor);
            // Do not check extendedTypes, it doesn't always make sense to export a base type.
            // do not validate extendedBy, guaranteed to all be in the documentation.
            current.implementedTypes?.forEach((type) => type.visit(visitor));
            // do not validate implementedBy, guaranteed to all be in the documentation.
        }

        if (current instanceof SignatureReflection) {
            add(current.parameters);
            add(current.typeParameters);
            current.type?.visit(visitor);
            current.overwrites?.visit(visitor);
            // Do not check inheritedFrom, it doesn't always make sense to export a base type.
            current.implementationOf?.visit(visitor);
        }

        if (current instanceof ParameterReflection) {
            current.type?.visit(visitor);
        }

        if (current instanceof TypeParameterReflection) {
            current.type?.visit(visitor);
            current.default?.visit(visitor);
        }
    } while ((current = queue.shift()));

    const intentional = new Set(intentionallyNotExported);
    for (const x of seenIntentional) {
        intentional.delete(x);
    }

    if (intentional.size) {
        logger.warn(
            "The following symbols were marked as intentionally not exported, but were either not referenced in the documentation, or were exported:\n\t" +
                Array.from(intentional).join("\n\t")
        );
    }
}

function makeTypeVisitor(
    logger: Logger,
    queue: Reflection[],
    intentional: Set<string>,
    seenIntentional: Set<string>,
    context: { reflection: Reflection }
): TypeVisitor {
    const warned = new Set<ts.Symbol>();

    return makeRecursiveVisitor({
        reference(type) {
            // If we don't have a symbol, then this was an intentionally broken reference.
            const symbol = type.getSymbol();
            if (!type.reflection && symbol) {
                if (intentional.has(symbol.name)) {
                    seenIntentional.add(symbol.name);
                }

                if (
                    (symbol.flags & ts.SymbolFlags.TypeParameter) === 0 &&
                    !intentional.has(symbol.name) &&
                    !warned.has(symbol) &&
                    !symbol.declarations?.some((d) =>
                        d.getSourceFile().fileName.includes("node_modules")
                    )
                ) {
                    warned.add(symbol);

                    const decl = symbol.declarations?.[0];
                    if (decl) {
                        const { line } = ts.getLineAndCharacterOfPosition(
                            decl.getSourceFile(),
                            decl.getStart()
                        );
                        const file = relative(
                            process.cwd(),
                            decl.getSourceFile().fileName
                        );

                        logger.warn(
                            `${
                                type.name
                            }, defined at ${file}:${line}, is referenced by ${context.reflection.getFullName()} but not included in the documentation.`
                        );
                    }
                }
            }
        },
        reflection(type) {
            queue.push(type.declaration);
        },
    });
}
