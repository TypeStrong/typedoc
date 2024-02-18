import { classNames, hasTypeParameters } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import type { PageEvent } from "../../../events";
import { ContainerReflection, DeclarationReflection, ReflectionKind, ReflectionType } from "../../../../models";
import { JSX, Raw } from "../../../../utils";

export function reflectionTemplate(context: DefaultThemeRenderContext, props: PageEvent<ContainerReflection>) {
    if (
        props.model.kindOf(ReflectionKind.TypeAlias | ReflectionKind.Variable) &&
        props.model instanceof DeclarationReflection
    ) {
        return context.memberDeclaration(props.model);
    }

    return (
        <>
            {props.model.hasComment() && (
                <section class="tsd-panel tsd-comment">
                    {context.commentSummary(props.model)}
                    {context.commentTags(props.model)}
                </section>
            )}
            {props.model instanceof DeclarationReflection &&
                props.model.kind === ReflectionKind.Module &&
                props.model.readme?.length && (
                    <section class="tsd-panel tsd-typography">
                        <Raw html={context.markdown(props.model.readme)} />
                    </section>
                )}

            {context.reflectionPreview(props.model)}

            {hasTypeParameters(props.model) && <> {context.typeParameters(props.model.typeParameters)} </>}
            {props.model instanceof DeclarationReflection && (
                <>
                    {context.hierarchy(props.model.typeHierarchy)}

                    {!!props.model.implementedTypes && (
                        <section class="tsd-panel">
                            <h4>{context.i18n.theme_implements()}</h4>
                            <ul class="tsd-hierarchy">
                                {props.model.implementedTypes.map((item) => (
                                    <li>{context.type(item)}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                    {!!props.model.implementedBy && (
                        <section class="tsd-panel">
                            <h4>{context.i18n.theme_implemented_by()}</h4>
                            <ul class="tsd-hierarchy">
                                {props.model.implementedBy.map((item) => (
                                    <li>{context.type(item)}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                    {!!props.model.signatures && (
                        <section class="tsd-panel">{context.memberSignatures(props.model)}</section>
                    )}
                    {!!props.model.indexSignature && (
                        <section class={classNames({ "tsd-panel": true }, context.getReflectionClasses(props.model))}>
                            <h4 class="tsd-before-signature">{context.i18n.theme_indexable()}</h4>
                            <div class="tsd-signature">
                                <span class="tsd-signature-symbol">[</span>
                                {props.model.indexSignature.parameters!.map((item) => (
                                    <>
                                        {item.name}: {context.type(item.type)}
                                    </>
                                ))}
                                <span class="tsd-signature-symbol">]: </span>
                                {context.type(props.model.indexSignature.type)}
                            </div>
                            {context.commentSummary(props.model.indexSignature)}
                            {context.commentTags(props.model.indexSignature)}
                            {props.model.indexSignature?.type instanceof ReflectionType &&
                                context.parameter(props.model.indexSignature.type.declaration)}
                        </section>
                    )}
                    {!props.model.signatures && context.memberSources(props.model)}
                </>
            )}
            {!!props.model.children?.length && context.index(props.model)}
            {context.members(props.model)}
        </>
    );
}
