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
 * A handler that parses TypeDoc comments and attaches {@link Comment} instances to
 * the generated reflections.
 */
@Component({ name: "comment" })
export class CommentPlugin extends ConverterComponent {
    @BindOption("excludeTags")
    excludeTags!: `@${string}`[];

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

        if (comment.hasModifier("@event")) {
            if (reflection.kindOf(ReflectionKind.CallSignature)) {
                if (reflection.parent) {
                    reflection.parent.kind = ReflectionKind.Event;
                }
            }
            reflection.kind = ReflectionKind.Event;
            comment.removeModifier("@event");
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
        const excludeInternal =
            this.application.options.getValue("excludeInternal");
        const excludePrivate =
            this.application.options.getValue("excludePrivate");
        const excludeProtected =
            this.application.options.getValue("excludeProtected");

        const project = context.project;
        const reflections = Object.values(project.reflections);

        // Remove hidden reflections
        const hidden = reflections.filter((reflection) =>
            CommentPlugin.isHidden(
                reflection,
                excludeInternal,
                excludePrivate,
                excludeProtected
            )
        );
        hidden.forEach((reflection) => project.removeReflection(reflection));

        // remove functions with empty signatures after their signatures have been removed
        const [allRemoved, someRemoved] = partition(
            filterMap(hidden, (reflection) =>
                reflection.parent?.kindOf(
                    ReflectionKind.FunctionOrMethod | ReflectionKind.Constructor
                )
                    ? reflection.parent
                    : void 0
            ) as DeclarationReflection[],
            (method) => method.signatures?.length === 0
        );
        allRemoved.forEach((reflection) =>
            project.removeReflection(reflection)
        );
        someRemoved.forEach((reflection) => {
            reflection.sources = unique(
                reflection.signatures!.flatMap<SourceReference>(
                    (s) => s.sources ?? []
                )
            );
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
    private onResolve(_context: Context, reflection: Reflection) {
        if (reflection.comment) {
            reflection.label = extractLabelTag(reflection.comment);
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
    private static isHidden(
        reflection: Reflection,
        excludeInternal: boolean,
        excludePrivate: boolean,
        excludeProtected: boolean
    ) {
        const comment = reflection.comment;

        if (
            reflection.flags.hasFlag(ReflectionFlag.Private) &&
            excludePrivate
        ) {
            return true;
        }

        if (
            reflection.flags.hasFlag(ReflectionFlag.Protected) &&
            excludeProtected
        ) {
            return true;
        }

        if (!comment) {
            return false;
        }

        return (
            comment.hasModifier("@hidden") ||
            comment.hasModifier("@ignore") ||
            (comment.hasModifier("@internal") && excludeInternal)
        );
    }
}

// Moves tags like `@param foo.bar docs for bar` into the `bar` property of the `foo` parameter.
function moveNestedParamTags(comment: Comment, parameter: ParameterReflection) {
    if (parameter.type instanceof ReflectionType) {
        const tags = comment.blockTags.filter(
            (t) =>
                t.tag === "@param" && t.name?.startsWith(`${parameter.name}.`)
        );
        for (const tag of tags) {
            const path = tag.name!.split(".");
            path.shift();
            const child = parameter.type.declaration.getChildByName(path);
            if (child && !child.comment) {
                child.comment = new Comment(
                    Comment.cloneDisplayParts(tag.content)
                );
            }
        }
    }
}

function extractLabelTag(comment: Comment): string | undefined {
    const index = comment.summary.findIndex(
        (part) => part.kind === "inline-tag" && part.tag === "@label"
    );

    if (index !== -1) {
        return comment.summary.splice(index, 1)[0].text;
    }
}
