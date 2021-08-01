import { hasTypeParameters } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { PageEvent } from "../../../events";
import { ContainerReflection, DeclarationReflection, ReflectionType } from "../../../../models";

// export const reflectionTemplate = ({relativeURL, partials, markdown, Markdown }: DefaultThemeRenderContext) => (props: PageEvent<ProjectReflection | TypeParameterContainer | DeclarationReflection>) => (
export const reflectionTemplate =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: PageEvent<ContainerReflection>) =>
        (
            <>
                {props.model.hasComment() && (
                    <section className="tsd-panel tsd-comment">{partials.comment(props.model)}</section>
                )}

                {hasTypeParameters(props.model) && (
                    <section className="tsd-panel tsd-type-parameters">
                        <h3>Type parameters</h3>
                        {partials.typeParameters(props.model)}
                    </section>
                )}
                {props.model instanceof DeclarationReflection && (
                    <>
                        {!!props.model.typeHierarchy && (
                            <section className="tsd-panel tsd-hierarchy">
                                <h3>Hierarchy</h3>
                                {partials.hierarchy(props.model.typeHierarchy)}
                            </section>
                        )}
                        {!!props.model.implementedTypes && (
                            <section className="tsd-panel">
                                <h3>Implements</h3>
                                <ul className="tsd-hierarchy">
                                    {props.model.implementedTypes!.map((item) => (
                                        <li>{partials.type(item)}</li>
                                    ))}
                                </ul>
                            </section>
                        )}
                        {!!props.model.implementedBy && (
                            <section className="tsd-panel">
                                <h3>Implemented by</h3>
                                <ul className="tsd-hierarchy">
                                    {props.model.implementedBy!.map((item) => (
                                        <li>{partials.type(item)}</li>
                                    ))}
                                </ul>
                            </section>
                        )}
                        {!!props.model.signatures && (
                            <section className="tsd-panel">
                                <h3 className="tsd-before-signature">Callable</h3>
                                {partials.memberSignatures(props.model)}
                            </section>
                        )}
                        {!!props.model.indexSignature && (
                            <section className={"tsd-panel " + props.model.cssClasses}>
                                <h3 className="tsd-before-signature">Indexable</h3>
                                <div className="tsd-signature tsd-kind-icon">
                                    <span className="tsd-signature-symbol">[</span>
                                    {props.model.indexSignature.parameters!.map((item) => (
                                        <>
                                            {item.name}: {item.type && partials.type(item.type)}
                                        </>
                                    ))}
                                    <span className="tsd-signature-symbol">{"]: "}</span>
                                    {props.model.indexSignature.type && partials.type(props.model.indexSignature.type)}
                                </div>
                                {partials.comment(props.model.indexSignature)}
                                {props.model.indexSignature?.type instanceof ReflectionType &&
                                    partials.parameter(props.model.indexSignature.type.declaration)}
                            </section>
                        )}
                    </>
                )}
                {partials.index(props.model)}
                {partials.members(props.model)}
            </>
        );
