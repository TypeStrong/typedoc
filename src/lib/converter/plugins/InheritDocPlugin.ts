import {
    Comment,
    DeclarationReflection,
    type ProjectReflection,
    ReflectionKind,
    ReflectionType,
    SignatureReflection,
} from "../../models/index.js";
import { ConverterComponent } from "../components.js";
import type { Context } from "../context.js";
import type { Reflection } from "../../models/Reflection.js";
import { Option, type ValidationOptions } from "../../utils/index.js";
import { DefaultMap, i18n, parseDeclarationReference, zip } from "#utils";
import { resolveDeclarationReference } from "../comments/declarationReferenceResolver.js";
import { ApplicationEvents } from "../../application-events.js";
import { ConverterEvents } from "../converter-events.js";
import type { Converter } from "../converter.js";

/**
 * A plugin that handles `@inheritDoc` tags by copying documentation from another API item.
 * It is NOT responsible for handling bare JSDoc style `@inheritDoc` tags which do not specify
 * a target to inherit from. Those are handled by the ImplementsPlugin class.
 *
 * What gets copied:
 * - short text
 * - text
 * - `@remarks` block
 * - `@params` block
 * - `@typeParam` block
 * - `@return` block
 */
export class InheritDocPlugin extends ConverterComponent {
    @Option("validation")
    accessor validation!: ValidationOptions;

    // Key is depended on by Values
    private dependencies = new DefaultMap<Reflection, Reflection[]>(() => []);

    /**
     * Create a new InheritDocPlugin instance.
     */
    constructor(owner: Converter) {
        super(owner);
        this.owner.on(ConverterEvents.RESOLVE_END, (context: Context) => this.processInheritDoc(context.project));
        this.application.on(
            ApplicationEvents.REVIVE,
            this.processInheritDoc.bind(this),
        );
    }

    /**
     * Traverse through reflection descendant to check for `inheritDoc` tag.
     * If encountered, the parameter of the tag is used to determine a source reflection
     * that will provide actual comment.
     */
    private processInheritDoc(project: ProjectReflection) {
        for (const id in project.reflections) {
            const reflection = project.reflections[id];
            const source = extractInheritDocTagReference(reflection);
            if (!source) continue;

            const declRef = parseDeclarationReference(source, 0, source.length);
            if (!declRef || /\S/.test(source.substring(declRef[1]))) {
                this.application.logger.warn(
                    i18n.declaration_reference_in_inheritdoc_for_0_not_fully_parsed(
                        reflection.getFriendlyFullName(),
                    ),
                );
            }
            let sourceRefl = declRef && resolveDeclarationReference(reflection, declRef[0]);

            if (reflection instanceof SignatureReflection) {
                // Assumes that if there are overloads, they are declared in the same order as the parent.
                // TS doesn't check this, but if a user messes this up then they are almost
                // guaranteed to run into bugs where they can't call a method on a child class
                // but if they assign (without a type assertion) that child to a variable of the parent class
                // then they can call the method.
                if (sourceRefl instanceof DeclarationReflection) {
                    const index = reflection.parent
                        .getAllSignatures()
                        .indexOf(reflection);
                    sourceRefl = sourceRefl.getAllSignatures()[index] || sourceRefl;
                }
            }

            if (
                sourceRefl instanceof DeclarationReflection &&
                sourceRefl.kindOf(ReflectionKind.Accessor)
            ) {
                // Accessors, like functions, never have comments on their actual root reflection.
                // If the user didn't specify whether to inherit from the getter or setter, then implicitly
                // try to inherit from the getter, #1968.
                sourceRefl = sourceRefl.getSignature || sourceRefl.setSignature;
            }

            if (!sourceRefl) {
                if (this.validation.invalidLink) {
                    this.application.logger.warn(
                        i18n.failed_to_find_0_to_inherit_comment_from_in_1(
                            source,
                            reflection.getFriendlyFullName(),
                        ),
                    );
                }
                continue;
            }

            this.copyComment(sourceRefl, reflection);
        }

        this.createCircularDependencyWarnings();
        this.dependencies.clear();
    }

    private copyComment(source: Reflection, target: Reflection) {
        if (!target.comment) return;

        if (
            !source.comment &&
            source instanceof DeclarationReflection &&
            source.signatures
        ) {
            source = source.signatures[0];
        }

        if (
            !source.comment &&
            source instanceof DeclarationReflection &&
            source.type instanceof ReflectionType &&
            source.type.declaration.signatures
        ) {
            source = source.type.declaration.signatures[0];
        }

        if (!source.comment) {
            this.application.logger.warn(
                i18n.reflection_0_tried_to_copy_comment_from_1_but_source_had_no_comment(
                    target.getFullName(),
                    source.getFullName(),
                ),
            );
            return;
        }

        // If the source also has a @inheritDoc tag, we can't do anything yet.
        // We'll try again later, once we've resolved the source's @inheritDoc reference.
        if (extractInheritDocTagReference(source)) {
            this.dependencies.get(source).push(target);
            return;
        }

        target.comment.removeTags("@inheritDoc");
        target.comment.summary = Comment.cloneDisplayParts(
            source.comment.summary,
        );
        const remarks = source.comment.getTag("@remarks");
        if (remarks) {
            target.comment.blockTags.unshift(remarks.clone());
        }
        const returns = source.comment.getTag("@returns");
        if (returns) {
            target.comment.blockTags.push(returns.clone());
        }

        if (
            source instanceof SignatureReflection &&
            target instanceof SignatureReflection
        ) {
            copySummaries(source.parameters, target.parameters);
            copySummaries(source.typeParameters, target.typeParameters);
        } else if (
            source instanceof DeclarationReflection &&
            target instanceof DeclarationReflection
        ) {
            copySummaries(source.typeParameters, target.typeParameters);
        }

        // Now copy the comment for anyone who depends on me.
        const dependent = this.dependencies.get(target);
        this.dependencies.delete(target);
        for (const target2 of dependent) {
            this.copyComment(target, target2);
        }
    }

    private createCircularDependencyWarnings() {
        const unwarned = new Set(this.dependencies.keys());

        const generateWarning = (orig: Reflection) => {
            const parts = [orig.name];
            unwarned.delete(orig);
            let work = orig;

            do {
                work = this.dependencies.get(work)[0];
                unwarned.delete(work);
                parts.push(work.name);
            } while (!this.dependencies.get(work).includes(orig));
            parts.push(orig.name);

            this.application.logger.warn(
                i18n.inheritdoc_circular_inheritance_chain_0(
                    parts.reverse().join(" -> "),
                ),
            );
        };

        for (const orig of this.dependencies.keys()) {
            if (unwarned.has(orig)) {
                generateWarning(orig);
            }
        }
    }
}

function copySummaries(
    source: Reflection[] | undefined,
    target: Reflection[] | undefined,
) {
    for (const [s, t] of zip(source || [], target || [])) {
        t.comment = new Comment(s.comment?.summary);
        t.comment.sourcePath = s.comment?.sourcePath;
    }
}

function extractInheritDocTagReference(
    reflection: Reflection,
): string | undefined {
    const comment = reflection.comment;
    if (!comment) return;

    const blockTag = comment.blockTags.find((tag) => tag.tag === "@inheritDoc");

    if (blockTag) {
        return blockTag.name;
    }

    const inlineTag = comment.summary.find(
        (part) => part.kind === "inline-tag" && part.tag === "@inheritDoc",
    );

    if (inlineTag) {
        return inlineTag.text;
    }
}
