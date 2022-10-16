import type { ProjectReflection, ReferenceType } from "../models";
import type { Logger } from "../utils";
import { nicePath } from "../utils/paths";
import { discoverAllReferenceTypes } from "../utils/reflections";

function makeIntentionallyExportedHelper(
    project: ProjectReflection,
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
        has(type: ReferenceType, typeName: string) {
            // If it isn't declared anywhere, we can't produce a good error message about where
            // the non-exported symbol is, so even if it isn't ignored, pretend it is. In practice,
            // this will happen incredibly rarely, since symbols without declarations are very rare.
            // I know of only two instances:
            // 1. `undefined` in `globalThis`
            // 2. Properties on non-homomorphic mapped types, e.g. the symbol for "foo" on `Record<"foo", 1>`
            // There might be others, so still check this here rather than asserting, but print a debug log
            // so that we can possibly improve this in the future.
            if (!type.package) {
                logger.verbose(
                    `The type ${type.qualifiedName} has no declarations, implicitly allowing missing export.`
                );
                return true;
            }

            // Don't produce warnings for third-party symbols.
            if (type.package !== project.packageName) {
                return true;
            }

            for (const [index, [file, name]] of processed.entries()) {
                if (typeName === name && type.sourceFileName?.endsWith(file)) {
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
        project,
        intentionallyNotExported,
        logger
    );
    const warned = new Set<string>();

    for (const { type, owner } of discoverAllReferenceTypes(project, true)) {
        const uniqueId = `${type.sourceFileName}\0${type.qualifiedName}`;

        if (
            !type.reflection &&
            !type.externalUrl &&
            !type.isIntentionallyBroken() &&
            !intentional.has(type, type.qualifiedName) &&
            !warned.has(uniqueId)
        ) {
            warned.add(uniqueId);

            logger.warn(
                `${type.qualifiedName}, defined in ${nicePath(
                    type.sourceFileName!
                )}, is referenced by ${owner.getFullName()} but not included in the documentation.`
            );
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
