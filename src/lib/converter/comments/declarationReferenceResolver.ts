import { ok } from "assert";
import {
    ContainerReflection,
    DeclarationReflection,
    ReferenceReflection,
    type Reflection,
    ReflectionKind,
} from "../../models";
import { assertNever, filterMap } from "../../utils";
import type {
    ComponentPath,
    DeclarationReference,
    Meaning,
    MeaningKeyword,
} from "./declarationReference";

function resolveReferenceReflection(ref: Reflection): Reflection {
    if (ref instanceof ReferenceReflection) {
        return ref.getTargetReflectionDeep();
    }
    return ref;
}

export function resolveDeclarationReference(
    reflection: Reflection,
    ref: DeclarationReference,
): Reflection | undefined {
    let high: Reflection[] = [];
    let low: Reflection[] = [];

    if (ref.moduleSource) {
        high =
            reflection.project.children?.filter(
                (c) =>
                    c.kindOf(ReflectionKind.SomeModule) &&
                    c.name === ref.moduleSource,
            ) || [];
    } else if (ref.resolutionStart === "global") {
        high.push(reflection.project);
    } else {
        // Work around no-unnecessary-condition, should be unnecessary... want a trap if it ever becomes false.
        ok(
            ref.resolutionStart.startsWith("local") &&
                ref.resolutionStart.length === 5,
        );
        // TypeScript's behavior is to first try to resolve links via variable scope, and then
        // if the link still hasn't been found, check either siblings (if comment belongs to a member)
        // or otherwise children.
        let refl: Reflection | undefined = reflection;
        if (refl.kindOf(ReflectionKind.ExportContainer)) {
            high.push(refl);
        }
        while (refl.parent) {
            refl = refl.parent;
            if (refl.kindOf(ReflectionKind.ExportContainer)) {
                high.push(refl);
            } else {
                low.push(refl);
            }
        }

        if (reflection.kindOf(ReflectionKind.SomeMember)) {
            high.push(reflection.parent!);
        } else if (
            reflection.kindOf(ReflectionKind.SomeSignature) &&
            reflection.parent!.kindOf(ReflectionKind.SomeMember)
        ) {
            high.push(reflection.parent!.parent!);
        } else if (high[0] !== reflection) {
            if (reflection.parent instanceof ContainerReflection) {
                high.push(
                    ...(reflection.parent.childrenIncludingDocuments?.filter(
                        (c) => c.name === reflection.name,
                    ) || []),
                );
            } else {
                high.push(reflection);
            }
        }
    }

    if (ref.symbolReference) {
        for (const part of ref.symbolReference.path || []) {
            const high2 = high;
            high = [];
            const low2 = low;
            low = [];

            for (const refl of high2) {
                const resolved = resolveSymbolReferencePart(refl, part);
                high.push(...resolved.high.map(resolveReferenceReflection));
                low.push(...resolved.low.map(resolveReferenceReflection));
            }

            for (const refl of low2) {
                const resolved = resolveSymbolReferencePart(refl, part);
                low.push(...resolved.high.map(resolveReferenceReflection));
                low.push(...resolved.low.map(resolveReferenceReflection));
            }
        }

        if (ref.symbolReference.meaning) {
            high = filterMapByMeaning(high, ref.symbolReference.meaning);
            low = filterMapByMeaning(low, ref.symbolReference.meaning);
        }
    }

    return high[0] || low[0];
}

function filterMapByMeaning(
    reflections: Reflection[],
    meaning: Meaning,
): Reflection[] {
    return filterMap(reflections, (refl): Reflection | undefined => {
        const kwResolved = resolveKeyword(refl, meaning.keyword) || [];
        if (meaning.label) {
            return kwResolved.find((r) => r.comment?.label === meaning.label);
        }
        return kwResolved[meaning.index || 0];
    });
}

function resolveKeyword(
    refl: Reflection,
    kw: MeaningKeyword | undefined,
): Reflection[] | undefined {
    switch (kw) {
        case undefined:
            return refl instanceof DeclarationReflection && refl.signatures
                ? refl.signatures
                : [refl];
        case "class":
            if (refl.kindOf(ReflectionKind.Class)) return [refl];
            break;
        case "interface":
            if (refl.kindOf(ReflectionKind.Interface)) return [refl];
            break;
        case "type":
            if (refl.kindOf(ReflectionKind.SomeType)) return [refl];
            break;
        case "enum":
            if (refl.kindOf(ReflectionKind.Enum)) return [refl];
            break;
        case "namespace":
            if (refl.kindOf(ReflectionKind.SomeModule)) return [refl];
            break;
        case "function":
            if (refl.kindOf(ReflectionKind.FunctionOrMethod)) {
                return (refl as DeclarationReflection).signatures;
            }
            break;
        case "var":
            if (refl.kindOf(ReflectionKind.Variable)) return [refl];
            break;

        case "new":
        case "constructor":
            if (
                refl.kindOf(
                    ReflectionKind.ClassOrInterface |
                        ReflectionKind.TypeLiteral,
                )
            ) {
                const ctor = (refl as ContainerReflection).children?.find((c) =>
                    c.kindOf(ReflectionKind.Constructor),
                );
                return (ctor as DeclarationReflection).signatures;
            }
            break;

        case "member":
            if (refl.kindOf(ReflectionKind.SomeMember)) return [refl];
            break;
        case "event":
            // Never resolve. Nobody should use this.
            // It's required by the grammar, but is not documented by TypeDoc
            // nor by the comments in the grammar.
            break;
        case "call":
            return (refl as DeclarationReflection).signatures;

        case "index":
            if ((refl as DeclarationReflection).indexSignatures) {
                return (refl as DeclarationReflection).indexSignatures;
            }
            break;

        case "complex":
            if (refl.kindOf(ReflectionKind.SomeType)) return [refl];
            break;

        case "getter":
            if ((refl as DeclarationReflection).getSignature) {
                return [(refl as DeclarationReflection).getSignature!];
            }
            break;

        case "setter":
            if ((refl as DeclarationReflection).setSignature) {
                return [(refl as DeclarationReflection).setSignature!];
            }
            break;

        default:
            assertNever(kw);
    }
}

function resolveSymbolReferencePart(
    refl: Reflection,
    path: ComponentPath,
): { high: Reflection[]; low: Reflection[] } {
    let high: Reflection[] = [];
    let low: Reflection[] = [];

    if (
        !(refl instanceof ContainerReflection) ||
        !refl.childrenIncludingDocuments
    ) {
        return { high, low };
    }

    switch (path.navigation) {
        // Grammar says resolve via "exports"... as always, reality is more complicated.
        // Check exports first, but also allow this as a general purpose "some child" operator
        // so that resolution doesn't behave very poorly with projects using JSDoc style resolution.
        // Also is more consistent with how TypeScript resolves link tags.
        case ".":
            high = refl.childrenIncludingDocuments.filter(
                (r) =>
                    r.name === path.path &&
                    (r.kindOf(ReflectionKind.SomeExport) || r.flags.isStatic),
            );
            low = refl.childrenIncludingDocuments.filter(
                (r) =>
                    r.name === path.path &&
                    (!r.kindOf(ReflectionKind.SomeExport) || !r.flags.isStatic),
            );
            break;

        // Resolve via "members", interface children, class instance properties/accessors/methods,
        // enum members, type literal properties
        case "#":
            high =
                refl.children?.filter((r) => {
                    return (
                        r.name === path.path &&
                        r.kindOf(ReflectionKind.SomeMember) &&
                        !r.flags.isStatic
                    );
                }) || [];
            break;

        // Resolve via "locals"... treat this as a stricter `.` which only supports traversing
        // module/namespace exports since TypeDoc doesn't support documenting locals.
        case "~":
            if (
                refl.kindOf(ReflectionKind.SomeModule | ReflectionKind.Project)
            ) {
                high = refl.children?.filter((r) => r.name === path.path) || [];
            }
            break;
    }

    return { high, low };
}
