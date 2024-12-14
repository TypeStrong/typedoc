import {
    type Reflection,
    ReflectionKind,
    type DeclarationReflection,
    type SignatureReflection,
    type CommentDisplayPart,
} from "../../../../models/index.js";
import type { ReferenceType, SomeType, TypeVisitor } from "../../../../models/types.js";
import { JSX } from "../../../../utils/index.js";
import { classNames, getKindClass } from "../../lib.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";

const isUsefulVisitor: Partial<TypeVisitor<boolean>> = {
    array(type) {
        return renderingTypeDetailsIsUseful(type.elementType);
    },
    intersection(type) {
        return type.types.some(renderingTypeDetailsIsUseful);
    },
    union(type) {
        return !!type.elementSummaries || type.types.some(renderingTypeDetailsIsUseful);
    },
    reflection(type) {
        return renderingChildIsUseful(type.declaration);
    },
    reference(type) {
        return shouldExpandReference(type);
    },
};

function renderingTypeDetailsIsUseful(type: SomeType) {
    return type.visit(isUsefulVisitor) ?? false;
}

export function typeDeclaration(context: DefaultThemeRenderContext, type: SomeType): JSX.Children {
    if (renderingTypeDetailsIsUseful(type)) {
        return (
            <div class="tsd-type-declaration">
                <h4>{context.i18n.theme_type_declaration()}</h4>
                {context.typeDetails(type, true)}
            </div>
        );
    }
    return null;
}

const expanded = new Set<Reflection>();
function shouldExpandReference(reference: ReferenceType) {
    const target = reference.reflection;
    if (reference.highlightedProperties) {
        return !target || expanded.has(target) === false;
    }

    if (!target?.kindOf(ReflectionKind.TypeAlias | ReflectionKind.Interface)) return false;
    if (!target.comment?.hasModifier("@expand")) return false;

    return expanded.has(target) === false;
}

export function typeDetails(context: DefaultThemeRenderContext, type: SomeType, renderAnchors: boolean): JSX.Children {
    return typeDetailsImpl(context, type, renderAnchors);
}

export function typeDetailsImpl(
    context: DefaultThemeRenderContext,
    type: SomeType,
    renderAnchors: boolean,
    highlighted?: Map<string, CommentDisplayPart[]>,
): JSX.Children {
    const result = type.visit<JSX.Children>({
        array(type) {
            return context.typeDetails(type.elementType, renderAnchors);
        },
        intersection(type) {
            return type.types.map((t) => context.typeDetails(t, renderAnchors));
        },
        union(type) {
            const result: JSX.Children = [];
            for (let i = 0; i < type.types.length; ++i) {
                result.push(
                    <li>
                        {context.type(type.types[i])}
                        {context.displayParts(type.elementSummaries?.[i])}
                        {context.typeDetailsIfUseful(type.types[i])}
                    </li>,
                );
            }
            return <ul>{result}</ul>;
        },
        reflection(type) {
            const declaration = type.declaration;
            if (highlighted) {
                return highlightedDeclarationDetails(context, declaration, renderAnchors, highlighted);
            }
            return declarationDetails(context, declaration, renderAnchors);
        },
        reference(reference) {
            if (shouldExpandReference(reference)) {
                const target = reference.reflection;
                if (!target?.isDeclaration()) {
                    return highlightedPropertyDetails(context, reference.highlightedProperties);
                }

                // Ensure we don't go into an infinite loop here
                expanded.add(target);
                const details = target.type
                    ? context.typeDetails(target.type, renderAnchors)
                    : declarationDetails(context, target, renderAnchors);
                expanded.delete(target);
                return details;
            }
        },
        // tuple??
    });

    if (!result && highlighted) {
        return highlightedPropertyDetails(context, highlighted);
    }

    return result;
}

export function typeDetailsIfUseful(context: DefaultThemeRenderContext, type: SomeType | undefined): JSX.Children {
    if (type && renderingTypeDetailsIsUseful(type)) {
        return context.typeDetails(type, false);
    }
}

function highlightedPropertyDetails(
    context: DefaultThemeRenderContext,
    highlighted?: Map<string, CommentDisplayPart[]>,
) {
    if (!highlighted?.size) return;

    return (
        <ul class="tsd-parameters">
            {Array.from(highlighted.entries(), ([name, parts]) => {
                return (
                    <li class="tsd-parameter">
                        <h5>
                            <span>{name}</span>
                        </h5>
                        {context.displayParts(parts)}
                    </li>
                );
            })}
        </ul>
    );
}

function highlightedDeclarationDetails(
    context: DefaultThemeRenderContext,
    declaration: DeclarationReflection,
    renderAnchors: boolean,
    highlightedProperties?: Map<string, CommentDisplayPart[]>,
) {
    return (
        <ul class="tsd-parameters">
            {declaration
                .getProperties()
                ?.map(
                    (child) =>
                        highlightedProperties?.has(child.name) &&
                        renderChild(context, child, renderAnchors, highlightedProperties.get(child.name)),
                )}
        </ul>
    );
}

function declarationDetails(
    context: DefaultThemeRenderContext,
    declaration: DeclarationReflection,
    renderAnchors: boolean,
): JSX.Children {
    return (
        <>
            {context.commentSummary(declaration)}
            <ul class="tsd-parameters">
                {declaration.signatures && (
                    <li class="tsd-parameter-signature">
                        <ul class={classNames({ "tsd-signatures": true }, context.getReflectionClasses(declaration))}>
                            {declaration.signatures.map((item) => (
                                <>
                                    <li class="tsd-signature" id={item.anchor}>
                                        {context.memberSignatureTitle(item, {
                                            hideName: true,
                                        })}
                                    </li>
                                    <li class="tsd-description">
                                        {context.memberSignatureBody(item, {
                                            hideSources: true,
                                        })}
                                    </li>
                                </>
                            ))}
                        </ul>
                    </li>
                )}
                {declaration.indexSignatures?.map((index) => renderIndexSignature(context, index))}
                {declaration.getProperties()?.map((child) => renderChild(context, child, renderAnchors))}
            </ul>
        </>
    );
}

function renderChild(
    context: DefaultThemeRenderContext,
    child: DeclarationReflection,
    renderAnchors: boolean,
    highlight?: CommentDisplayPart[],
) {
    if (child.signatures) {
        return (
            <li class="tsd-parameter">
                <h5>
                    {!!child.flags.isRest && <span class="tsd-signature-symbol">...</span>}
                    <span class={getKindClass(child)}>{child.name}</span>
                    {child.anchor && <a id={child.anchor} class="tsd-anchor"></a>}
                    <span class="tsd-signature-symbol">{!!child.flags.isOptional && "?"}:</span>
                    function
                </h5>

                {context.memberSignatures(child)}
            </li>
        );
    }

    function highlightOrComment(refl: Reflection) {
        if (highlight) {
            return context.displayParts(highlight);
        }
        return (
            <>
                {context.commentSummary(refl)}
                {context.commentTags(refl)}
            </>
        );
    }

    // standard type
    if (child.type) {
        return (
            <li class="tsd-parameter">
                <h5>
                    {context.reflectionFlags(child)}
                    {!!child.flags.isRest && <span class="tsd-signature-symbol">...</span>}
                    <span class={getKindClass(child)}>{child.name}</span>
                    {child.anchor && <a id={child.anchor} class="tsd-anchor"></a>}
                    <span class="tsd-signature-symbol">
                        {!!child.flags.isOptional && "?"}
                        {": "}
                    </span>
                    {context.type(child.type)}
                </h5>
                {highlightOrComment(child)}
                {child.getProperties().some(renderingChildIsUseful) && (
                    <ul class="tsd-parameters">
                        {child.getProperties().map((c) => renderChild(context, c, renderAnchors))}
                    </ul>
                )}
            </li>
        );
    }

    // getter/setter
    return (
        <>
            {child.getSignature && (
                <li class="tsd-parameter">
                    <h5>
                        {context.reflectionFlags(child.getSignature)}
                        <span class="tsd-signature-keyword">get </span>
                        <span class={getKindClass(child)}>{child.name}</span>
                        {child.anchor && <a id={child.anchor} class="tsd-anchor"></a>}
                        <span class="tsd-signature-symbol">(): </span>
                        {context.type(child.getSignature.type)}
                    </h5>

                    {highlightOrComment(child.getSignature)}
                </li>
            )}
            {child.setSignature && (
                <li class="tsd-parameter">
                    <h5>
                        {context.reflectionFlags(child.setSignature)}
                        <span class="tsd-signature-keyword">set </span>
                        <span class={getKindClass(child)}>{child.name}</span>
                        {!child.getSignature && child.anchor && <a id={child.anchor} class="tsd-anchor"></a>}
                        <span class="tsd-signature-symbol">(</span>
                        {child.setSignature.parameters?.map((item) => (
                            <>
                                {item.name}
                                <span class="tsd-signature-symbol">: </span>
                                {context.type(item.type)}
                            </>
                        ))}
                        <span class="tsd-signature-symbol">): </span>
                        {context.type(child.setSignature.type)}
                    </h5>

                    {highlightOrComment(child.setSignature)}
                </li>
            )}
        </>
    );
}

function renderIndexSignature(context: DefaultThemeRenderContext, index: SignatureReflection) {
    return (
        <li class="tsd-parameter-index-signature">
            <h5>
                {index.flags.isReadonly && <span class="tsd-signature-keyword">readonly </span>}
                <span class="tsd-signature-symbol">[</span>
                {index.parameters!.map((item) => (
                    <>
                        <span class={getKindClass(item)}>{item.name}</span>
                        {": "}
                        {context.type(item.type)}
                    </>
                ))}
                <span class="tsd-signature-symbol">{"]: "}</span>
                {context.type(index.type)}
            </h5>
            {context.commentSummary(index)}
            {context.commentTags(index)}
            {context.typeDeclaration(index.type!)}
        </li>
    );
}

function renderingChildIsUseful(refl: DeclarationReflection) {
    // Object types directly under a variable/type alias will always be considered useful.
    // This probably isn't ideal, but it is an easy thing to check when assigning URLs
    // in the default theme, so we'll make the assumption that those properties ought to always
    // be rendered.
    // This should be kept in sync with the DefaultTheme.applyAnchorUrl function.
    if (
        refl.kindOf(ReflectionKind.TypeLiteral) &&
        refl.parent?.kindOf(ReflectionKind.SomeExport) &&
        (refl.parent as DeclarationReflection).type?.type === "reflection"
    ) {
        return true;
    }

    if (renderingThisChildIsUseful(refl)) {
        return true;
    }

    return refl.getProperties().some(renderingThisChildIsUseful);
}

function renderingThisChildIsUseful(refl: DeclarationReflection) {
    if (refl.hasComment()) return true;

    const declaration = refl.type?.type === "reflection" ? refl.type.declaration : refl;
    if (declaration.hasComment()) return true;

    return declaration.getAllSignatures().some((sig) => {
        return sig.hasComment() || sig.parameters?.some((p) => p.hasComment());
    });
}
