import * as ts from "typescript";
import type { ProjectReflection } from "../models";
import type { Logger } from "../utils";
import { discoverAllReferenceTypes } from "../utils/reflections";

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
        has(symbol: ts.Symbol, typeName: string) {
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
                    typeName === name &&
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
    const intentional = makeIntentionallyExportedHelper(
        intentionallyNotExported,
        logger
    );
    const warned = new Set<ts.Symbol>();

    for (const { type, owner } of discoverAllReferenceTypes(project, true)) {
        // If we don't have a symbol, then this was an intentionally broken reference.
        const symbol = type.getSymbol();
        if (!type.reflection && symbol) {
            if (
                (symbol.flags & ts.SymbolFlags.TypeParameter) === 0 &&
                !intentional.has(symbol, type.qualifiedName) &&
                !warned.has(symbol)
            ) {
                warned.add(symbol);
                const decl = symbol.declarations![0];

                logger.warn(
                    `${
                        type.qualifiedName
                    } is referenced by ${owner.getFullName()} but not included in the documentation.`,
                    decl
                );
            }
        }
    }

    const unusedIntentional = intentional.getUnused();
    if (unusedIntentional.length) {
        logger.warn(
            "The following symbols were marked as intentionally not exported, but were either not referenced in the documentation, or were exported:\n\t" +
                unusedIntentional.join("\n\t")
        );
    }
}
