import { relative } from "path";
import * as ts from "typescript";
import {
    ContainerReflection,
    DeclarationReflection,
    makeRecursiveVisitor,
    ParameterReflection,
    ProjectReflection,
    Reflection,
    SignatureReflection,
    TypeParameterReflection,
} from "../models";
import type { Logger } from "../utils";

export function validateExports(
    project: ProjectReflection,
    logger: Logger,
    intentionallyNotExported: readonly string[]
) {
    let current: Reflection | undefined = project;
    const queue: Reflection[] = [];
    const intentional = new Set(intentionallyNotExported);
    const seenIntentional = new Set<string>();
    const warned = new Set<ts.Symbol>();

    const visitor = makeRecursiveVisitor({
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
                            }, defined at ${file}:${line}, is referenced by ${current!.getFullName()} but not included in the documentation.`
                        );
                    }
                }
            }
        },
        reflection(type) {
            queue.push(type.declaration);
        },
    });

    const add = (item: Reflection | Reflection[] | undefined) => {
        if (!item) return;

        if (item instanceof Reflection) {
            queue.push(item);
        } else {
            queue.push(...item);
        }
    };

    do {
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
            // Do not validate implementationOf will always be defined or intentionally broken.
            // Do not check extendedTypes, it doesn't always make sense to export a base type.
            // Do not validate extendedBy, guaranteed to all be in the documentation.
            current.implementedTypes?.forEach((type) => type.visit(visitor));
            // Do not validate implementedBy, guaranteed to all be in the documentation.
        }

        if (current instanceof SignatureReflection) {
            add(current.parameters);
            add(current.typeParameters);
            current.type?.visit(visitor);
            current.overwrites?.visit(visitor);
            // Do not check inheritedFrom, it doesn't always make sense to export a base type.
            // Do not validate implementationOf will always be defined or intentionally broken.
        }

        if (current instanceof ParameterReflection) {
            current.type?.visit(visitor);
        }

        if (current instanceof TypeParameterReflection) {
            current.type?.visit(visitor);
            current.default?.visit(visitor);
        }
    } while ((current = queue.shift()));

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
