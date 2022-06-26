import { hasTypeParameters } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import type { PageEvent } from "../../../events";
import { ContainerReflection, DeclarationReflection, ReflectionKind, ReflectionType } from "../../../../models";
import { JSX } from "../../../../utils";

export function reflectionTemplate(context: DefaultThemeRenderContext, props: PageEvent<ContainerReflection>) {
    if (
        [ReflectionKind.TypeAlias, ReflectionKind.Variable].includes(props.model.kind) &&
        props.model instanceof DeclarationReflection
    )
        return context.memberDeclaration(props.model);
    return (
        <>
            {props.model.hasComment() && (
                <section class="tsd-panel tsd-comment">{context.comment(props.model)}</section>
            )}

            {hasTypeParameters(props.model) && (
                <section class="tsd-panel tsd-type-parameters">
                    <h4>Type Parameters</h4>
                    {context.typeParameters(props.model.typeParameters)}
                </section>
            )}
            {props.model instanceof DeclarationReflection && (
                <>
                    {!!props.model.typeHierarchy && (
                        <section class="tsd-panel tsd-hierarchy">
                            <h4>Hierarchy</h4>
                            {context.hierarchy(props.model.typeHierarchy)}
                        </section>
                    )}
                    {!!props.model.implementedTypes && (
                        <section class="tsd-panel">
                            <h4>Implements</h4>
                            <ul class="tsd-hierarchy">
                                {props.model.implementedTypes.map((item) => (
                                    <li>{context.type(item)}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                    {!!props.model.implementedBy && (
                        <section class="tsd-panel">
                            <h4>Implemented by</h4>
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
                        <section class={"tsd-panel " + props.model.cssClasses}>
                            <h4 class="tsd-before-signature">Indexable</h4>
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
                            {context.comment(props.model.indexSignature)}
                            {props.model.indexSignature?.type instanceof ReflectionType &&
                                context.parameter(props.model.indexSignature.type.declaration)}
                        </section>
                    )}
                </>
            )}
            {!!props.model.children?.length && context.index(props.model)}
            {context.members(props.model)}
        </>
    );
}
