import {
    Comment,
    DeclarationReflection,
    IntrinsicType,
    Reflection,
    SignatureReflection,
    SomeType,
    UnionType,
} from "../../models";

export function removeUndefined(type: SomeType): SomeType {
    if (type instanceof UnionType) {
        const types = type.types.filter((t) => {
            if (t instanceof IntrinsicType) {
                return t.name !== "undefined";
            }
            return true;
        });
        if (types.length === 1) {
            return types[0];
        }
        type.types = types;
        return type;
    }
    return type;
}

/**
 * Copy the comment of the source reflection to the target reflection.
 * Performs the copy according to the specification at https://tsdoc.org/pages/tags/inheritdoc/.
 * Mostly.
 *
 * @param target - Reflection with comment containing `@inheritDoc` tag
 * @param source - Referenced reflection
 */
export function copyComment(target: Reflection, source: Reflection) {
    if (
        target.comment &&
        source.comment &&
        target.comment.getTag("@inheritDoc")
    ) {
        // GERRIT This seems wrong. Shouldn't be overwriting parameters or type parameters...
        if (
            target instanceof DeclarationReflection &&
            source instanceof DeclarationReflection
        ) {
            target.typeParameters = source.typeParameters;
        } else if (
            target instanceof SignatureReflection &&
            source instanceof SignatureReflection
        ) {
            target.parameters = source.parameters;
            target.typeParameters = source.typeParameters;
        }
        target.comment.summary = Comment.cloneDisplayParts(
            source.comment.summary
        );
        target.comment.removeTags("@remarks");
        target.comment.removeTags("@inheritDoc"); // Remove block level inheritDoc
        const remarks = source.comment.getTag("@remarks");
        if (remarks) {
            target.comment.blockTags.push(remarks.clone());
        }
    } else if (!target.comment && source.comment) {
        if (
            target instanceof DeclarationReflection &&
            source instanceof DeclarationReflection
        ) {
            target.typeParameters = source.typeParameters;
        }
        target.comment = source.comment.clone();
    }
}
