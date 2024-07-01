import {
    type Reflection,
    ReflectionKind,
    type DeclarationReflection,
    type SignatureReflection,
} from "../../../../models/index.js";
import type { ReferenceType, SomeType, TypeVisitor } from "../../../../models/types.js";
import { JSX, Raw } from "../../../../utils/index.js";
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
                {context.typeDetails(type)}
            </div>
        );
    }
    return null;
}

const expanded = new Set<Reflection>();
function shouldExpandReference(reference: ReferenceType) {
    const target = reference.reflection;
    if (!target?.kindOf(ReflectionKind.TypeAlias | ReflectionKind.Interface)) return false;
    if (!target.comment?.hasModifier("@expand")) return false;

    return expanded.has(target) === false;
}

export function typeDetails(context: DefaultThemeRenderContext, type: SomeType): JSX.Children {
    return type.visit<JSX.Children>({
        array(type) {
            return context.typeDetails(type.elementType);
        },
        intersection(type) {
            return type.types.map(context.typeDetails);
        },
        union(type) {
            const result: JSX.Children = [];
            for (let i = 0; i < type.types.length; ++i) {
                result.push(
                    <li>
                        {context.type(type.types[i])}
                        <Raw html={context.markdown(type.elementSummaries?.[i] ?? [])} />
                        {context.typeDetailsIfUseful(type.types[i])}
                    </li>,
                );
            }
            return <ul>{result}</ul>;
        },
        reflection(type) {
            const declaration = type.declaration;
            return declarationDetails(context, declaration);
        },
        reference(reference) {
            if (shouldExpandReference(reference)) {
                const target = reference.reflection as DeclarationReflection;

                // Ensure we don't go into an infinite loop here
                expanded.add(target);
                const details = target.type ? typeDetails(context, target.type) : declarationDetails(context, target);
                expanded.delete(target);
                return details;
            }
        },
        // tuple??
    });
}

export function typeDetailsIfUseful(context: DefaultThemeRenderContext, type: SomeType | undefined): JSX.Children {
    if (type && renderingTypeDetailsIsUseful(type)) {
        return context.typeDetails(type);
    }
}

function declarationDetails(context: DefaultThemeRenderContext, declaration: DeclarationReflection): JSX.Children {
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
                {declaration.children?.map((child) => renderChild(context, child))}
            </ul>
        </>
    );
}

function renderChild(context: DefaultThemeRenderContext, child: DeclarationReflection) {
    if (child.signatures) {
        return (
            <li class="tsd-parameter">
                <h5>
                    {!!child.flags.isRest && <span class="tsd-signature-symbol">...</span>}
                    <span class={getKindClass(child)}>{child.name}</span>
                    <span class="tsd-signature-symbol">{!!child.flags.isOptional && "?"}:</span>
                    function
                </h5>

                {context.memberSignatures(child)}
            </li>
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
                    <span class="tsd-signature-symbol">
                        {!!child.flags.isOptional && "?"}
                        {": "}
                    </span>
                    {context.type(child.type)}
                </h5>
                {context.commentSummary(child)}
                {context.commentTags(child)}
                {child.children?.some(renderingChildIsUseful) && (
                    <ul class="tsd-parameters">{child.children.map((c) => renderChild(context, c))}</ul>
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
                        <span class="tsd-signature-symbol">(): </span>
                        {context.type(child.getSignature.type)}
                    </h5>

                    {context.commentSummary(child.getSignature)}
                    {context.commentTags(child.getSignature)}
                </li>
            )}
            {child.setSignature && (
                <li class="tsd-parameter">
                    <h5>
                        {context.reflectionFlags(child.setSignature)}
                        <span class="tsd-signature-keyword">set </span>
                        <span class={getKindClass(child)}>{child.name}</span>
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

                    {context.commentSummary(child.setSignature)}
                    {context.commentTags(child.setSignature)}
                </li>
            )}
        </>
    );
}

function renderIndexSignature(context: DefaultThemeRenderContext, index: SignatureReflection) {
    return (
        <li class="tsd-parameter-index-signature">
            <h5>
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
    if (refl.hasComment()) return true;
    if (
        refl.children?.some((child) => {
            if (child.hasComment()) return true;
            if (child.type) {
                return renderingTypeDetailsIsUseful(child.type);
            }
        })
    ) {
        return true;
    }

    return refl.getAllSignatures().some((sig) => {
        return sig.hasComment() || sig.parameters?.some((p) => p.hasComment());
    });
}
