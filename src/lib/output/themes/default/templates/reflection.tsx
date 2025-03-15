import { classNames, getKindClass, hasTypeParameters } from "../../lib.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import type { PageEvent } from "../../../events.js";
import {
    type ContainerReflection,
    DeclarationReflection,
    ReflectionKind,
    type SignatureReflection,
} from "../../../../models/index.js";
import { i18n, JSX } from "#utils";

export function reflectionTemplate(context: DefaultThemeRenderContext, props: PageEvent<ContainerReflection>) {
    if (
        props.model.kindOf(ReflectionKind.TypeAlias | ReflectionKind.Variable) &&
        props.model instanceof DeclarationReflection &&
        props.model.type
    ) {
        return context.memberDeclaration(props.model);
    }

    if (
        props.model.kindOf(ReflectionKind.ExportContainer) &&
        (props.model.isDeclaration() || props.model.isProject())
    ) {
        return context.moduleReflection(props.model);
    }

    return (
        <>
            {props.model.hasComment() && (
                <section class="tsd-panel tsd-comment">
                    {context.commentSummary(props.model)}
                    {context.commentTags(props.model)}
                </section>
            )}

            {context.reflectionPreview(props.model)}

            {hasTypeParameters(props.model) && <>{context.typeParameters(props.model.typeParameters)}</>}
            {props.model instanceof DeclarationReflection && (
                <>
                    {context.hierarchy(props.model.typeHierarchy)}

                    {!!props.model.implementedTypes && (
                        <section class="tsd-panel">
                            <h4>{i18n.theme_implements()}</h4>
                            <ul class="tsd-hierarchy">
                                {props.model.implementedTypes.map((item) => <li>{context.type(item)}</li>)}
                            </ul>
                        </section>
                    )}
                    {!!props.model.implementedBy && (
                        <section class="tsd-panel">
                            <h4>{i18n.theme_implemented_by()}</h4>
                            <ul class="tsd-hierarchy">
                                {props.model.implementedBy.map((item) => <li>{context.type(item)}</li>)}
                            </ul>
                        </section>
                    )}
                    {!!props.model.signatures?.length && (
                        <section class="tsd-panel">{context.memberSignatures(props.model)}</section>
                    )}
                    {!!props.model.indexSignatures?.length && (
                        <section class="tsd-panel">
                            <h4 class="tsd-before-signature">{i18n.theme_indexable()}</h4>
                            <ul class="tsd-signatures">
                                {props.model.indexSignatures.map((index) => renderIndexSignature(context, index))}
                            </ul>
                        </section>
                    )}
                    {!props.model.signatures && context.memberSources(props.model)}
                </>
            )}
            {!!props.model.childrenIncludingDocuments?.length && context.index(props.model)}
            {context.members(props.model)}
        </>
    );
}

function renderIndexSignature(context: DefaultThemeRenderContext, index: SignatureReflection) {
    return (
        <li class={classNames({ "tsd-index-signature": true }, context.getReflectionClasses(index))}>
            <div class="tsd-signature">
                {index.flags.isReadonly && (
                    <>
                        <span class="tsd-signature-keyword">readonly</span>
                        {" "}
                    </>
                )}
                <span class="tsd-signature-symbol">[</span>
                {index.parameters!.map((item) => (
                    <>
                        <span class={getKindClass(item)}>{item.name}</span>: {context.type(item.type)}
                    </>
                ))}
                <span class="tsd-signature-symbol">]:</span> {context.type(index.type)}
            </div>
            {context.commentSummary(index)}
            {context.commentTags(index)}
            {context.typeDetailsIfUseful(index, index.type)}
        </li>
    );
}
