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

    const visitor = makeTypeVisitor(
        logger,
        queue,
        new Set(intentionallyNotExported),
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
            current.inheritedFrom?.visit(visitor);
            current.implementationOf?.visit(visitor);
            current.extendedTypes?.forEach((type) => type.visit(visitor));
            // do not validate extendedBy, guaranteed to all be in the documentation.
            current.implementedTypes?.forEach((type) => type.visit(visitor));
            // do not validate implementedBy, guaranteed to all be in the documentation.
        }

        if (current instanceof SignatureReflection) {
            add(current.parameters);
            add(current.typeParameters);
            current.type?.visit(visitor);
            current.overwrites?.visit(visitor);
            current.inheritedFrom?.visit(visitor);
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
}

function makeTypeVisitor(
    logger: Logger,
    queue: Reflection[],
    intentional: Set<string>,
    context: { reflection: Reflection }
): TypeVisitor {
    const warned = new Set<ts.Symbol>();

    return makeRecursiveVisitor({
        reference(type) {
            // If we don't have a symbol, then this was an intentionally broken reference.
            const symbol = type.getSymbol();
            if (!type.reflection && symbol) {
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
