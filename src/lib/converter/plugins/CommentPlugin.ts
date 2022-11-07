import { Component, ConverterComponent } from "../components";
import { Converter } from "../converter";
import type { Context } from "../context";
import {
    Reflection,
    ReflectionFlag,
    ReflectionKind,
    TypeParameterReflection,
    DeclarationReflection,
    SignatureReflection,
    ParameterReflection,
    Comment,
    ReflectionType,
    SourceReference,
    TypeVisitor,
    CommentTag,
} from "../../models";
import {
    BindOption,
    filterMap,
    removeIfPresent,
    unique,
    partition,
} from "../../utils";

/**
 * These tags are not useful to display in the generated documentation.
 * They should be ignored when parsing comments. Any relevant type information
 * (for JS users) will be consumed by TypeScript and need not be preserved
 * in the comment.
 *
 * Note that param/arg/argument/return/returns are not present.
 * These tags will have their type information stripped when parsing, but still
 * provide useful information for documentation.
 */
const NEVER_RENDERED = [
    "@augments",
    "@callback",
    "@class",
    "@constructor",
    "@enum",
    "@extends",
    "@this",
    "@type",
    "@typedef",
] as const;

/**
 * Handles most behavior triggered by comments. `@group` and `@category` are handled by their respective plugins, but everything else is here.
 *
 * How it works today
 * ==================
 * During conversion:
 * - Handle visibility flags (`@private`, `@protected`. `@public`)
 * - Handle module renames (`@module`)
 * - Remove excluded tags & comment discovery tags (`@module`, `@packageDocumentation`)
 * - Copy comments for type parameters from the parent container (for classes/interfaces)
 *
 * Resolve begin:
 * - Remove hidden reflections
 *
 * Resolve:
 * - Apply `@label` tag
 * - Copy comments on signature containers to the signature if signatures don't already have a comment
 *   and then remove the comment on the container.
 * - Copy comments to parameters and type parameters (for signatures)
 * - Apply `@group` and `@category` tags
 *
 * Resolve end:
 * - Copy auto inherited comments from heritage clauses
 * - Handle `@inheritDoc`
 * - Resolve `@link` tags to point to target reflections
 *
 * How it should work
 * ==================
 * During conversion:
 * - Handle visibility flags (`@private`, `@protected`. `@public`)
 * - Handle module renames (`@module`)
 * - Remove excluded tags & comment discovery tags (`@module`, `@packageDocumentation`)
 *
 * Resolve begin (100):
 * - Copy auto inherited comments from heritage clauses
 * - Apply `@label` tag
 *
 * Resolve begin (75)
 * - Handle `@inheritDoc`
 *
 * Resolve begin (50)
 * - Copy comments on signature containers to the signature if signatures don't already have a comment
 *   and then remove the comment on the container.
 * - Copy comments for type parameters from the parent container (for classes/interfaces)
 *
 * Resolve begin (25)
 * - Remove hidden reflections
 *
 * Resolve:
 * - Copy comments to parameters and type parameters (for signatures)
 * - Apply `@group` and `@category` tags
 *
 * Resolve end:
 * - Resolve `@link` tags to point to target reflections
 *
 */
@Component({ name: "comment" })
export class CommentPlugin extends ConverterComponent {
    @BindOption("excludeTags")
    excludeTags!: `@${string}`[];

    @BindOption("excludeInternal")
    excludeInternal!: boolean;

    @BindOption("excludePrivate")
    excludePrivate!: boolean;

    @BindOption("excludeProtected")
    excludeProtected!: boolean;

    @BindOption("excludeNotDocumented")
    excludeNotDocumented!: boolean;

    /**
     * Create a new CommentPlugin instance.
     */
    override initialize() {
        this.listenTo(this.owner, {
            [Converter.EVENT_CREATE_DECLARATION]: this.onDeclaration,
            [Converter.EVENT_CREATE_SIGNATURE]: this.onDeclaration,
            [Converter.EVENT_CREATE_TYPE_PARAMETER]: this.onCreateTypeParameter,
            [Converter.EVENT_RESOLVE_BEGIN]: this.onBeginResolve,
            [Converter.EVENT_RESOLVE]: this.onResolve,
        });
    }

    /**
     * Apply all comment tag modifiers to the given reflection.
     *
     * @param reflection  The reflection the modifiers should be applied to.
     * @param comment  The comment that should be searched for modifiers.
     */
    private applyModifiers(reflection: Reflection, comment: Comment) {
        if (comment.hasModifier("@private")) {
            reflection.setFlag(ReflectionFlag.Private);
            if (reflection.kindOf(ReflectionKind.CallSignature)) {
                reflection.parent?.setFlag(ReflectionFlag.Private);
            }
            comment.removeModifier("@private");
        }

        if (comment.hasModifier("@protected")) {
            reflection.setFlag(ReflectionFlag.Protected);
            if (reflection.kindOf(ReflectionKind.CallSignature)) {
                reflection.parent?.setFlag(ReflectionFlag.Protected);
            }
            comment.removeModifier("@protected");
        }

        if (comment.hasModifier("@public")) {
            reflection.setFlag(ReflectionFlag.Public);
            if (reflection.kindOf(ReflectionKind.CallSignature)) {
                reflection.parent?.setFlag(ReflectionFlag.Public);
            }
            comment.removeModifier("@public");
        }

        if (comment.hasModifier("@readonly")) {
            const target = reflection.kindOf(ReflectionKind.GetSignature)
                ? reflection.parent!
                : reflection;
            target.setFlag(ReflectionFlag.Readonly);
            comment.removeModifier("@readonly");
        }

        if (
            comment.hasModifier("@event") ||
            comment.hasModifier("@eventProperty")
        ) {
            comment.blockTags.push(
                new CommentTag("@group", [{ kind: "text", text: "Events" }])
            );
            comment.removeModifier("@event");
            comment.removeModifier("@eventProperty");
        }

        if (
            reflection.kindOf(
                ReflectionKind.Module | ReflectionKind.Namespace
            ) ||
            reflection.kind === ReflectionKind.Project
        ) {
            comment.removeTags("@module");
            comment.removeModifier("@packageDocumentation");
        }
    }

    /**
     * Triggered when the converter has created a type parameter reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param reflection  The reflection that is currently processed.
     */
    private onCreateTypeParameter(
        _context: Context,
        reflection: TypeParameterReflection
    ) {
        const comment = reflection.parent?.comment;
        if (comment) {
            let tag = comment.getIdentifiedTag(reflection.name, "@typeParam");
            if (!tag) {
                tag = comment.getIdentifiedTag(reflection.name, "@template");
            }
            if (!tag) {
                tag = comment.getIdentifiedTag(
                    `<${reflection.name}>`,
                    "@param"
                );
            }
            if (!tag) {
                tag = comment.getIdentifiedTag(reflection.name, "@param");
            }
            if (tag) {
                reflection.comment = new Comment(tag.content);
                removeIfPresent(comment.blockTags, tag);
            }
        }
    }

    /**
     * Triggered when the converter has created a declaration or signature reflection.
     *
     * Invokes the comment parser.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param reflection  The reflection that is currently processed.
     * @param node  The node that is currently processed if available.
     */
    private onDeclaration(_context: Context, reflection: Reflection) {
        const comment = reflection.comment;
        if (!comment) return;

        if (reflection.kindOf(ReflectionKind.Module)) {
            const tag = comment.getTag("@module");
            if (tag) {
                // If no name is specified, this is a flag to mark a comment as a module comment
                // and should not result in a reflection rename.
                const newName = Comment.combineDisplayParts(tag.content).trim();
                if (newName.length && !newName.includes("\n")) {
                    reflection.name = newName;
                }
                removeIfPresent(comment.blockTags, tag);
            }
        }

        this.applyModifiers(reflection, comment);
        this.removeExcludedTags(comment);
    }

    /**
     * Triggered when the converter begins resolving a project.
     *
     * @param context  The context object describing the current state the converter is in.
     */
    private onBeginResolve(context: Context) {
        const project = context.project;
        const reflections = Object.values(project.reflections);

        // Remove hidden reflections
        const hidden = new Set<Reflection>();
        for (const ref of reflections) {
            if (ref.kindOf(ReflectionKind.Accessor) && ref.flags.isReadonly) {
                const decl = ref as DeclarationReflection;
                if (decl.setSignature) {
                    hidden.add(decl.setSignature);
                }
                // Clear flag set by @readonly since it shouldn't be rendered.
                ref.setFlag(ReflectionFlag.Readonly, false);
            }

            if (this.isHidden(ref)) {
                hidden.add(ref);
            }
        }
        hidden.forEach((reflection) => project.removeReflection(reflection));

        // remove functions with empty signatures after their signatures have been removed
        const [allRemoved, someRemoved] = partition(
            unique(
                filterMap(hidden, (reflection) =>
                    reflection.parent?.kindOf(ReflectionKind.SignatureContainer)
                        ? reflection.parent
                        : void 0
                ) as DeclarationReflection[]
            ),
            (method) => method.getNonIndexSignatures().length === 0
        );
        allRemoved.forEach((reflection) => {
            project.removeReflection(reflection);
        });
        someRemoved.forEach((reflection) => {
            reflection.sources = reflection
                .getNonIndexSignatures()
                .flatMap<SourceReference>((s) => s.sources ?? []);
        });
    }

    /**
     * Triggered when the converter resolves a reflection.
     *
     * Cleans up comment tags related to signatures like `@param` or `@returns`
     * and moves their data to the corresponding parameter reflections.
     *
     * This hook also copies over the comment of function implementations to their
     * signatures.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param reflection  The reflection that is currently resolved.
     */
    private onResolve(context: Context, reflection: Reflection) {
        if (reflection.comment) {
            reflection.label = extractLabelTag(reflection.comment);
            if (reflection.label && !/[A-Z_][A-Z0-9_]/.test(reflection.label)) {
                context.logger.warn(
                    `The label "${
                        reflection.label
                    }" for ${reflection.getFriendlyFullName()} cannot be referenced with a declaration reference. ` +
                        `Labels may only contain A-Z, 0-9, and _, and may not start with a number.`
                );
            }

            mergeSeeTags(reflection.comment);
        }

        if (!(reflection instanceof DeclarationReflection)) {
            return;
        }

        if (reflection.type instanceof ReflectionType) {
            this.moveCommentToSignatures(
                reflection,
                reflection.type.declaration.getNonIndexSignatures()
            );
        } else {
            this.moveCommentToSignatures(
                reflection,
                reflection.getNonIndexSignatures()
            );
        }
    }

    private moveCommentToSignatures(
        reflection: DeclarationReflection,
        signatures: SignatureReflection[]
    ) {
        if (!signatures.length) {
            return;
        }

        const comment = reflection.comment;

        // Since this reflection has signatures, remove the comment from the parent
        // reflection. This is important so that in type aliases we don't end up with
        // a comment rendered twice.
        delete reflection.comment;

        for (const signature of signatures) {
            const childComment = (signature.comment ||= comment?.clone());
            if (!childComment) continue;

            signature.parameters?.forEach((parameter, index) => {
                if (parameter.name === "__namedParameters") {
                    const commentParams = childComment.blockTags.filter(
                        (tag) =>
                            tag.tag === "@param" && !tag.name?.includes(".")
                    );
                    if (
                        signature.parameters?.length === commentParams.length &&
                        commentParams[index].name
                    ) {
                        parameter.name = commentParams[index].name!;
                    }
                }

                moveNestedParamTags(childComment, parameter);
                const tag = childComment.getIdentifiedTag(
                    parameter.name,
                    "@param"
                );

                if (tag) {
                    parameter.comment = new Comment(
                        Comment.cloneDisplayParts(tag.content)
                    );
                }
            });

            for (const parameter of signature.typeParameters || []) {
                const tag =
                    childComment.getIdentifiedTag(
                        parameter.name,
                        "@typeParam"
                    ) ||
                    childComment.getIdentifiedTag(
                        parameter.name,
                        "@template"
                    ) ||
                    childComment.getIdentifiedTag(
                        `<${parameter.name}>`,
                        "@param"
                    );
                if (tag) {
                    parameter.comment = new Comment(
                        Comment.cloneDisplayParts(tag.content)
                    );
                }
            }

            childComment?.removeTags("@param");
            childComment?.removeTags("@typeParam");
            childComment?.removeTags("@template");
        }
    }

    private removeExcludedTags(comment: Comment) {
        for (const tag of NEVER_RENDERED) {
            comment.removeTags(tag);
            comment.removeModifier(tag);
        }
        for (const tag of this.excludeTags) {
            comment.removeTags(tag);
            comment.removeModifier(tag);
        }
    }

    /**
     * Determines whether or not a reflection has been hidden
     *
     * @param reflection Reflection to check if hidden
     */
    private isHidden(reflection: Reflection): boolean {
        const comment = reflection.comment;

        if (
            reflection.flags.hasFlag(ReflectionFlag.Private) &&
            this.excludePrivate
        ) {
            return true;
        }

        if (
            reflection.flags.hasFlag(ReflectionFlag.Protected) &&
            this.excludeProtected
        ) {
            return true;
        }

        if (!comment) {
            if (this.excludeNotDocumented) {
                // Don't let excludeNotDocumented remove parameters.
                if (
                    !(reflection instanceof DeclarationReflection) &&
                    !(reflection instanceof SignatureReflection)
                ) {
                    return false;
                }

                // excludeNotDocumented should hide a module only if it has no visible children
                if (reflection.kindOf(ReflectionKind.SomeModule)) {
                    if (!(reflection as DeclarationReflection).children) {
                        return true;
                    }
                    return (
                        reflection as DeclarationReflection
                    ).children!.every((child) => this.isHidden(child));
                }

                // enum members should all be included if the parent enum is documented
                if (reflection.kind === ReflectionKind.EnumMember) {
                    return false;
                }

                // signature containers should only be hidden if all their signatures are hidden
                if (reflection.kindOf(ReflectionKind.SignatureContainer)) {
                    return (reflection as DeclarationReflection)
                        .getAllSignatures()
                        .every((child) => this.isHidden(child));
                }

                // excludeNotDocumented should never hide parts of "type" reflections
                return inTypeLiteral(reflection) === false;
            }
            return false;
        }

        const isHidden =
            comment.hasModifier("@hidden") ||
            comment.hasModifier("@ignore") ||
            (comment.hasModifier("@internal") && this.excludeInternal);

        if (
            isHidden &&
            reflection.kindOf(ReflectionKind.ContainsCallSignatures)
        ) {
            return (reflection as DeclarationReflection)
                .getNonIndexSignatures()
                .every((sig) => {
                    return !sig.comment || this.isHidden(sig);
                });
        }

        return isHidden;
    }
}

function inTypeLiteral(refl: Reflection | undefined) {
    while (refl) {
        if (refl.kind === ReflectionKind.TypeLiteral) {
            return true;
        }
        refl = refl.parent;
    }
    return false;
}

// Moves tags like `@param foo.bar docs for bar` into the `bar` property of the `foo` parameter.
function moveNestedParamTags(comment: Comment, parameter: ParameterReflection) {
    const visitor: Partial<TypeVisitor> = {
        reflection(target) {
            const tags = comment.blockTags.filter(
                (t) =>
                    t.tag === "@param" &&
                    t.name?.startsWith(`${parameter.name}.`)
            );

            for (const tag of tags) {
                const path = tag.name!.split(".");
                path.shift();
                const child = target.declaration.getChildByName(path);

                if (child && !child.comment) {
                    child.comment = new Comment(
                        Comment.cloneDisplayParts(tag.content)
                    );
                }
            }
        },
        // #1876, also do this for unions/intersections.
        union(u) {
            u.types.forEach((t) => t.visit(visitor));
        },
        intersection(i) {
            i.types.forEach((t) => t.visit(visitor));
        },
    };

    parameter.type?.visit(visitor);
}

function extractLabelTag(comment: Comment): string | undefined {
    const index = comment.summary.findIndex(
        (part) => part.kind === "inline-tag" && part.tag === "@label"
    );

    if (index !== -1) {
        return comment.summary.splice(index, 1)[0].text;
    }
}
function mergeSeeTags(comment: Comment) {
    const see = comment.getTags("@see");

    if (see.length < 2) return;

    const index = comment.blockTags.indexOf(see[0]);
    comment.removeTags("@see");

    see[0].content = see.flatMap((part) => [
        { kind: "text", text: " - " },
        ...part.content,
        { kind: "text", text: "\n" },
    ]);

    comment.blockTags.splice(index, 0, see[0]);
}
