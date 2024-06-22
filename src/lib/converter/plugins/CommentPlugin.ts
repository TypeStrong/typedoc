import { Component, ConverterComponent } from "../components";
import { Converter } from "../converter";
import type { Context } from "../context";
import {
    type Reflection,
    ReflectionFlag,
    ReflectionKind,
    type TypeParameterReflection,
    DeclarationReflection,
    SignatureReflection,
    type ParameterReflection,
    Comment,
    type SourceReference,
    type TypeVisitor,
    CommentTag,
    ReflectionType,
} from "../../models";
import {
    Option,
    filterMap,
    removeIfPresent,
    unique,
    partition,
    removeIf,
} from "../../utils";
import { CategoryPlugin } from "./CategoryPlugin";
import { setIntersection } from "../../utils/set";

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
    "@jsx",
] as const;

// We might make this user configurable at some point, but for now,
// this set is configured here.
const MUTUALLY_EXCLUSIVE_MODIFIERS = [
    new Set<`@${string}`>([
        "@alpha",
        "@beta",
        "@experimental",
        "@internal",
        "@public",
    ]),
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
    @Option("excludeTags")
    accessor excludeTags!: `@${string}`[];

    @Option("cascadedModifierTags")
    accessor cascadedModifierTags!: `@${string}`[];

    @Option("excludeInternal")
    accessor excludeInternal!: boolean;

    @Option("excludePrivate")
    accessor excludePrivate!: boolean;

    @Option("excludeProtected")
    accessor excludeProtected!: boolean;

    @Option("excludeNotDocumented")
    accessor excludeNotDocumented!: boolean;

    @Option("excludeCategories")
    accessor excludeCategories!: string[];

    @Option("defaultCategory")
    accessor defaultCategory!: string;

    private _excludeKinds: number | undefined;
    private get excludeNotDocumentedKinds(): number {
        this._excludeKinds ??= this.application.options
            .getValue("excludeNotDocumentedKinds")
            .reduce((a, b) => a | (ReflectionKind[b] as number), 0);
        return this._excludeKinds;
    }

    /**
     * Create a new CommentPlugin instance.
     */
    override initialize() {
        this.owner.on(
            Converter.EVENT_CREATE_DECLARATION,
            this.onDeclaration.bind(this),
        );
        this.owner.on(
            Converter.EVENT_CREATE_SIGNATURE,
            this.onDeclaration.bind(this),
        );
        this.owner.on(
            Converter.EVENT_CREATE_TYPE_PARAMETER,
            this.onCreateTypeParameter.bind(this),
        );
        this.owner.on(
            Converter.EVENT_RESOLVE_BEGIN,
            this.onBeginResolve.bind(this),
        );
        this.owner.on(Converter.EVENT_RESOLVE, this.onResolve.bind(this));
        this.owner.on(Converter.EVENT_END, () => {
            this._excludeKinds = undefined;
        });
    }

    /**
     * Apply all comment tag modifiers to the given reflection.
     *
     * @param reflection  The reflection the modifiers should be applied to.
     * @param comment  The comment that should be searched for modifiers.
     */
    private applyModifiers(reflection: Reflection, comment: Comment) {
        if (reflection.kindOf(ReflectionKind.SomeModule)) {
            comment.removeModifier("@namespace");
        }

        if (reflection.kindOf(ReflectionKind.Interface)) {
            comment.removeModifier("@interface");
        }

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
                new CommentTag("@group", [{ kind: "text", text: "Events" }]),
            );
            comment.removeModifier("@event");
            comment.removeModifier("@eventProperty");
        }

        if (
            reflection.kindOf(
                ReflectionKind.Project | ReflectionKind.SomeModule,
            )
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
        reflection: TypeParameterReflection,
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
                    "@param",
                );
            }
            if (!tag) {
                tag = comment.getIdentifiedTag(reflection.name, "@param");
            }
            if (tag) {
                reflection.comment = new Comment(tag.content);
                reflection.comment.sourcePath = comment.sourcePath;
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
        this.cascadeModifiers(reflection);

        const comment = reflection.comment;
        if (!comment) return;

        if (reflection.kindOf(ReflectionKind.SomeModule)) {
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
        if (context.project.comment) {
            this.applyModifiers(context.project, context.project.comment);
            this.removeExcludedTags(context.project.comment);
        }

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
                        : void 0,
                ) as DeclarationReflection[],
            ),
            (method) => method.getNonIndexSignatures().length === 0,
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
            if (
                reflection.comment.label &&
                !/[A-Z_][A-Z0-9_]/.test(reflection.comment.label)
            ) {
                context.logger.warn(
                    context.i18n.label_0_for_1_cannot_be_referenced(
                        reflection.comment.label,
                        reflection.getFriendlyFullName(),
                    ),
                );
            }

            for (const group of MUTUALLY_EXCLUSIVE_MODIFIERS) {
                const intersect = setIntersection(
                    group,
                    reflection.comment.modifierTags,
                );
                if (intersect.size > 1) {
                    const [a, b] = intersect;
                    context.logger.warn(
                        context.i18n.modifier_tag_0_is_mutually_exclusive_with_1_in_comment_for_2(
                            a,
                            b,
                            reflection.getFriendlyFullName(),
                        ),
                    );
                }
            }

            mergeSeeTags(reflection.comment);
            movePropertyTags(reflection.comment, reflection);

            // Unlike other modifiers, this one has to wait until resolution to be removed
            // as it needs to remain present so that it can be checked when `@hidden` tags are
            // being processed.
            if (reflection.kindOf(ReflectionKind.Class)) {
                reflection.comment.removeModifier("@hideconstructor");
            }
        }

        if (reflection instanceof DeclarationReflection && reflection.comment) {
            let sigs: SignatureReflection[];
            if (reflection.type instanceof ReflectionType) {
                sigs = reflection.type.declaration.getNonIndexSignatures();
            } else {
                sigs = reflection.getNonIndexSignatures();
            }

            // For variables and properties, the symbol might own the comment but we might also
            // have @param and @returns comments for an owned signature. Only do this if there is
            // exactly one signature as otherwise we have no hope of doing validation right.
            if (sigs.length === 1 && !sigs[0].comment) {
                this.moveSignatureParamComments(sigs[0], reflection.comment);
                const returnsTag = reflection.comment.getTag("@returns");
                if (returnsTag) {
                    sigs[0].comment = new Comment();
                    sigs[0].comment.sourcePath = reflection.comment.sourcePath;
                    sigs[0].comment.blockTags.push(returnsTag);
                    reflection.comment.removeTags("@returns");
                }
            }

            // Any cascaded tags will show up twice, once on this and once on our signatures
            // This is completely redundant, so remove them from the wrapping function.
            if (sigs.length) {
                for (const mod of this.cascadedModifierTags) {
                    reflection.comment.modifierTags.delete(mod);
                }
            }
        }

        if (reflection instanceof SignatureReflection) {
            this.moveSignatureParamComments(reflection);
        }
    }

    private moveSignatureParamComments(
        signature: SignatureReflection,
        comment = signature.comment,
    ) {
        if (!comment) return;

        signature.parameters?.forEach((parameter, index) => {
            if (parameter.name === "__namedParameters") {
                const commentParams = comment.blockTags.filter(
                    (tag) => tag.tag === "@param" && !tag.name?.includes("."),
                );
                if (
                    signature.parameters?.length === commentParams.length &&
                    commentParams[index].name
                ) {
                    parameter.name = commentParams[index].name!;
                }
            }

            const tag = comment.getIdentifiedTag(parameter.name, "@param");

            if (tag) {
                parameter.comment = new Comment(
                    Comment.cloneDisplayParts(tag.content),
                );
                parameter.comment.sourcePath = comment.sourcePath;
            }
        });

        for (const parameter of signature.typeParameters || []) {
            const tag =
                comment.getIdentifiedTag(parameter.name, "@typeParam") ||
                comment.getIdentifiedTag(parameter.name, "@template") ||
                comment.getIdentifiedTag(`<${parameter.name}>`, "@param");
            if (tag) {
                parameter.comment = new Comment(
                    Comment.cloneDisplayParts(tag.content),
                );
                parameter.comment.sourcePath = comment.sourcePath;
            }
        }

        this.validateParamTags(signature, comment, signature.parameters || []);

        comment.removeTags("@param");
        comment.removeTags("@typeParam");
        comment.removeTags("@template");
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

    private cascadeModifiers(reflection: Reflection) {
        const parentComment = reflection.parent?.comment;
        if (!parentComment) return;

        const childMods = reflection.comment?.modifierTags ?? new Set();

        for (const mod of this.cascadedModifierTags) {
            if (parentComment.hasModifier(mod)) {
                const exclusiveSet = MUTUALLY_EXCLUSIVE_MODIFIERS.find((tags) =>
                    tags.has(mod),
                );

                if (
                    !exclusiveSet ||
                    Array.from(exclusiveSet).every((tag) => !childMods.has(tag))
                ) {
                    reflection.comment ||= new Comment();
                    reflection.comment.modifierTags.add(mod);
                }
            }
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

        if (this.excludedByCategory(reflection)) {
            return true;
        }

        if (
            reflection.kindOf(
                ReflectionKind.ConstructorSignature |
                    ReflectionKind.Constructor,
            )
        ) {
            if (comment?.hasModifier("@hideconstructor")) return true;
            const cls = reflection.parent?.kindOf(ReflectionKind.Class)
                ? reflection.parent
                : reflection.parent?.parent?.kindOf(ReflectionKind.Class)
                  ? reflection.parent.parent
                  : undefined;
            if (cls?.comment?.hasModifier("@hideconstructor")) {
                return true;
            }
        }

        if (!comment) {
            // We haven't moved comments from the parent for signatures without a direct
            // comment, so don't exclude those due to not being documented.
            if (
                reflection.kindOf(
                    ReflectionKind.CallSignature |
                        ReflectionKind.ConstructorSignature,
                ) &&
                reflection.parent?.comment
            ) {
                return false;
            }

            if (this.excludeNotDocumented) {
                // Don't let excludeNotDocumented remove parameters.
                if (
                    !(reflection instanceof DeclarationReflection) &&
                    !(reflection instanceof SignatureReflection)
                ) {
                    return false;
                }

                if (!reflection.kindOf(this.excludeNotDocumentedKinds)) {
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

    private excludedByCategory(reflection: Reflection): boolean {
        const excludeCategories = this.excludeCategories;

        let target: DeclarationReflection | undefined;
        if (reflection instanceof DeclarationReflection) {
            target = reflection;
        } else if (reflection instanceof SignatureReflection) {
            target = reflection.parent;
        }

        if (!target || !excludeCategories.length) return false;

        const categories = CategoryPlugin.getCategories(target);
        if (categories.size === 0) {
            categories.add(this.defaultCategory);
        }

        return excludeCategories.some((cat) => categories.has(cat));
    }

    private validateParamTags(
        signature: SignatureReflection,
        comment: Comment,
        params: ParameterReflection[],
    ) {
        const paramTags = comment.blockTags.filter(
            (tag) => tag.tag === "@param",
        );

        removeIf(paramTags, (tag) =>
            params.some((param) => param.name === tag.name),
        );

        moveNestedParamTags(/* in-out */ paramTags, params, comment.sourcePath);

        if (paramTags.length) {
            for (const tag of paramTags) {
                this.application.logger.warn(
                    this.application.i18n.signature_0_has_unused_param_with_name_1(
                        signature.getFriendlyFullName(),
                        tag.name ?? "(missing)",
                    ),
                );
            }
        }
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
function moveNestedParamTags(
    /* in-out */ paramTags: CommentTag[],
    parameters: ParameterReflection[],
    sourcePath: string | undefined,
) {
    const used = new Set<number>();

    for (const param of parameters) {
        const visitor: Partial<TypeVisitor> = {
            reflection(target) {
                const tags = paramTags.filter((t) =>
                    t.name?.startsWith(`${param.name}.`),
                );

                for (const tag of tags) {
                    const path = tag.name!.split(".");
                    path.shift();
                    const child = target.declaration.getChildByName(path);

                    if (child && !child.comment) {
                        child.comment = new Comment(
                            Comment.cloneDisplayParts(tag.content),
                        );
                        child.comment.sourcePath = sourcePath;
                        used.add(paramTags.indexOf(tag));
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

        param.type?.visit(visitor);
    }

    const toRemove = Array.from(used)
        .sort((a, b) => a - b)
        .reverse();

    for (const index of toRemove) {
        paramTags.splice(index, 1);
    }
}

function movePropertyTags(comment: Comment, container: Reflection) {
    const propTags = comment.blockTags.filter(
        (tag) => tag.tag === "@prop" || tag.tag === "@property",
    );
    comment.removeTags("@prop");
    comment.removeTags("@property");

    for (const prop of propTags) {
        if (!prop.name) continue;

        const child = container.getChildByName(prop.name);
        if (child) {
            child.comment = new Comment(
                Comment.cloneDisplayParts(prop.content),
            );
            child.comment.sourcePath = comment.sourcePath;

            if (child instanceof DeclarationReflection && child.signatures) {
                for (const sig of child.signatures) {
                    sig.comment = new Comment(
                        Comment.cloneDisplayParts(prop.content),
                    );
                    sig.comment.sourcePath = comment.sourcePath;
                }
            }
        }
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
