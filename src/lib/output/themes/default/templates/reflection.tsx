import { With, __partials__, Compact, isDeclarationReflection, isReflectionType, hasTypeParameters } from "../../lib";
import * as React from "react";
import { PageEvent } from "../../../events";
import { ContainerReflection } from "../../../../models";

// export const reflectionTemplate = (props: PageEvent<ProjectReflection | TypeParameterContainer | DeclarationReflection>) => (
export const reflectionTemplate = (props: PageEvent<ContainerReflection>) => (
    <>
        {With(props.model, (props) => (
            <>
                {!!props.hasComment && (
                    <>
                        {" "}
                        <section className="tsd-panel tsd-comment">{__partials__.comment(props)}</section>
                    </>
                )}
            </>
        ))}

        {hasTypeParameters(props.model) && (
            <>
                {" "}
                <section className="tsd-panel tsd-type-parameters">
                    <h3>Type parameters</h3>
                    {With(props.model, (props) => (
                        <>{__partials__.typeParameters(props)}</>
                    ))}
                </section>
            </>
        )}
        {isDeclarationReflection(props.model) && <>
            {!!props.model.typeHierarchy && (
                <>
                    {" "}
                    <section className="tsd-panel tsd-hierarchy">
                        <h3>Hierarchy</h3>
                        {With(props.model.typeHierarchy, (props) => (
                            <>{__partials__.hierarchy(props)}</>
                        ))}
                    </section>
                </>
            )}
            {!!props.model.implementedTypes && (
                <>
                    {" "}
                    <section className="tsd-panel">
                        <h3>Implements</h3>
                        <ul className="tsd-hierarchy">
                            {props.model.implementedTypes!.map((item) => (
                                <>
                                    {" "}
                                    <li>
                                        <Compact>{__partials__.type(item)}</Compact>
                                    </li>
                                </>
                            ))}{" "}
                        </ul>
                    </section>
                </>
            )}
            {!!props.model.implementedBy && (
                <>
                    {" "}
                    <section className="tsd-panel">
                        <h3>Implemented by</h3>
                        <ul className="tsd-hierarchy">
                            {props.model.implementedBy!.map((item) => (
                                <>
                                    {" "}
                                    <li>
                                        <Compact>{__partials__.type(item)}</Compact>
                                    </li>
                                </>
                            ))}{" "}
                        </ul>
                    </section>
                </>
            )}
            {!!props.model.signatures && (
                <>
                    {" "}
                    <section className="tsd-panel">
                        <h3 className="tsd-before-signature">Callable</h3>
                        {With(props.model, (props) => (
                            <>{__partials__["memberSignatures"](props)}</>
                        ))}
                    </section>
                </>
            )}
            {!!props.model.indexSignature && (
                <>
                    {" "}
                    <section className={"tsd-panel " + props.model.cssClasses}>
                        <h3 className="tsd-before-signature">Indexable</h3>
                        <div className="tsd-signature tsd-kind-icon">
                            <Compact>
                                <span className="tsd-signature-symbol">[</span>
                                {props.model.indexSignature.parameters!.map((item) => (
                                    <>
                                        {" "}
                                        {item.name}:
                                        {With(item.type, (props) => (
                                            <>{__partials__.type(props)}</>
                                        ))}
                                    </>
                                ))}{" "}
                                <span className="tsd-signature-symbol">{"]: "}</span>
                                {With(props.model.indexSignature!.type, (props) => (
                                    <>{__partials__.type(props)}</>
                                ))}
                            </Compact>
                        </div>
                        {With(props.model.indexSignature, (props) => (
                            <>{__partials__.comment(props)}</>
                        ))}
                        {isReflectionType(props.model.indexSignature?.type) && !!props.model.indexSignature?.type?.declaration && (
                            <>
                                {" "}
                                {With(props.model.indexSignature.type.declaration, (props) => (
                                    <>{__partials__.parameter(props)}</>
                                ))}
                            </>
                        )}{" "}
                    </section>
                </>
            )}
        </>}
        {__partials__.index(props.model)}
        {__partials__.members(props.model)}
    </>
);
