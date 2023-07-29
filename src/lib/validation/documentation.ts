import {
    DeclarationReflection,
    ProjectReflection,
    Reflection,
    ReflectionKind,
    ReflectionType,
} from "../models";
import type { Logger } from "../utils";
import { removeFlag } from "../utils/enum";
import { nicePath } from "../utils/paths";

export function validateDocumentation(
    project: ProjectReflection,
    logger: Logger,
    requiredToBeDocumented: readonly ReflectionKind.KindString[],
): void {
    let kinds = requiredToBeDocumented.reduce(
        (prev, cur) => prev | ReflectionKind[cur],
        0,
    );

    // Functions, Constructors, and Accessors never have comments directly on them.
    // If they are required to be documented, what's really required is that their
    // contained signatures have a comment.
    if (kinds & ReflectionKind.FunctionOrMethod) {
        kinds |= ReflectionKind.CallSignature;
        kinds = removeFlag(kinds, ReflectionKind.FunctionOrMethod);
    }
    if (kinds & ReflectionKind.Constructor) {
        kinds |= ReflectionKind.ConstructorSignature;
        kinds = removeFlag(kinds, ReflectionKind.Constructor);
    }
    if (kinds & ReflectionKind.Accessor) {
        kinds |= ReflectionKind.GetSignature | ReflectionKind.SetSignature;
        kinds = removeFlag(kinds, ReflectionKind.Accessor);
    }

    const toProcess = project.getReflectionsByKind(kinds);
    const seen = new Set<Reflection>();

    outer: while (toProcess.length) {
        const ref = toProcess.shift()!;
        if (seen.has(ref)) continue;
        seen.add(ref);

        // If there is a parameter inside another parameter, this is probably a callback function.
        // TypeDoc doesn't support adding comments with @param to nested parameters, so it seems
        // silly to warn about these.
        if (ref.kindOf(ReflectionKind.Parameter)) {
            let r: Reflection | undefined = ref.parent;
            while (r) {
                if (r.kindOf(ReflectionKind.Parameter)) {
                    continue outer;
                }
                r = r.parent;
            }
        }

        if (ref instanceof DeclarationReflection) {
            const signatures =
                ref.type instanceof ReflectionType
                    ? ref.type.declaration.getNonIndexSignatures()
                    : ref.getNonIndexSignatures();

            if (signatures.length) {
                // We maybe used to have a comment, but the comment plugin has removed it.
                // See CommentPlugin.onResolve. We've been asked to validate this reflection,
                // (it's probably a type alias) so we should validate that signatures all have
                // comments, but we shouldn't produce a warning here.
                toProcess.push(...signatures);
                continue;
            }
        }

        const symbolId = project.getSymbolIdFromReflection(ref);

        if (!ref.hasComment() && symbolId) {
            if (symbolId.fileName.includes("node_modules")) {
                continue;
            }

            logger.warn(
                `${ref.getFriendlyFullName()}, defined in ${nicePath(
                    symbolId.fileName,
                )}, does not have any documentation.`,
            );
        }
    }
}
