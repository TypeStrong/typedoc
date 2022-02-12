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
import { Logger, normalizePath } from "../utils";

function makeIntentionallyExportedHelper(
    intentional: readonly string[],
    logger: Logger
) {
    const used = new Set<number>();
    const processed: [string, string][] = intentional.map((v) => {
        const index = v.lastIndexOf(":");
        if (index === -1) {
            return ["", v];
        }
        return [v.substring(0, index), v.substring(index + 1)];
    });

    return {
        has(symbol: ts.Symbol) {
            // If it isn't declared anywhere, we can't produce a good error message about where
            // the non-exported symbol is, so even if it isn't ignored, pretend it is. In practice,
            // this will happen incredibly rarely, since symbols without declarations are very rare.
            // I know of only two instances:
            // 1. `undefined` in `globalThis`
            // 2. Properties on non-homomorphic mapped types, e.g. the symbol for "foo" on `Record<"foo", 1>`
            // There might be others, so still check this here rather than asserting, but print a debug log
            // so that we can possibly improve this in the future.
            if (!symbol.declarations?.length) {
                logger.verbose(
                    `The symbol ${symbol.name} has no declarations, implicitly allowing missing export.`
                );
                return true;
            }

            // Don't produce warnings for third-party symbols.
            if (
                symbol.declarations.some((d) =>
                    d.getSourceFile().fileName.includes("node_modules")
                )
            ) {
                return true;
            }

            for (const [index, [file, name]] of processed.entries()) {
                if (
                    symbol.name === name &&
                    symbol.declarations.some((d) =>
                        d.getSourceFile().fileName.endsWith(file)
                    )
                ) {
                    used.add(index);
                    return true;
                }
            }

            return false;
        },
        getUnused() {
            return intentional.filter((_, i) => !used.has(i));
        },
    };
}

export function validateExports(
    project: ProjectReflection,
    logger: Logger,
    intentionallyNotExported: readonly string[]
) {
    let current: Reflection | undefined = project;
    const queue: Reflection[] = [];
    const intentional = makeIntentionallyExportedHelper(
        intentionallyNotExported,
        logger
    );
    const warned = new Set<ts.Symbol>();

    const visitor = makeRecursiveVisitor({
        reference(type) {
            // If we don't have a symbol, then this was an intentionally broken reference.
            const symbol = type.getSymbol();
            if (!type.reflection && symbol) {
                if (
                    (symbol.flags & ts.SymbolFlags.TypeParameter) === 0 &&
                    !intentional.has(symbol) &&
                    !warned.has(symbol)
                ) {
                    warned.add(symbol);
                    const decl = symbol.declarations![0];
                    const { line } = ts.getLineAndCharacterOfPosition(
                        decl.getSourceFile(),
                        decl.getStart()
                    );
                    const file = normalizePath(
                        relative(process.cwd(), decl.getSourceFile().fileName)
                    );

                    logger.warn(
                        `${type.name}, defined at ${file}:${
                            line + 1
                        }, is referenced by ${current!.getFullName()} but not included in the documentation.`
                    );
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

    const unusedIntentional = intentional.getUnused();
    if (unusedIntentional.length) {
        logger.warn(
            "The following symbols were marked as intentionally not exported, but were either not referenced in the documentation, or were exported:\n\t" +
                unusedIntentional.join("\n\t")
        );
    }
}
