import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import React from "react";
import { DeclarationReflection } from "../../../typedoc/src";
export const component = (props: { model: DeclarationReflection }) => (
    <>
        {With(props, props.model, (superProps, props) => (
            <>
                {!!props.hasComment && (
                    <>
                        {" "}
                        <section className="tsd-panel tsd-comment">{__partials__.comment(props)}</section>
                    </>
                )}
            </>
        ))}

        {!!props.model.typeParameters && (
            <>
                {" "}
                <section className="tsd-panel tsd-type-parameters">
                    <h3>Type parameters</h3>
                    {With(props, props.model, (superProps, props) => (
                        <>{__partials__.typeParameters(props)}</>
                    ))}
                </section>
            </>
        )}
        {!!props.model.typeHierarchy && (
            <>
                {" "}
                <section className="tsd-panel tsd-hierarchy">
                    <h3>Hierarchy</h3>
                    {With(props, props.model.typeHierarchy, (superProps, props) => (
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
                        {props.model.implementedTypes!.map((item, i) => (
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
                        {props.model.implementedBy!.map((item, i) => (
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
                    {With(props, props.model, (superProps, props) => (
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
                            {props.model.indexSignature.parameters!.map((item, i) => (
                                <>
                                    {" "}
                                    {item.name}:
                                    {With(item, item.type, (superProps, props) => (
                                        <>{__partials__.type(props)}</>
                                    ))}
                                </>
                            ))}{" "}
                            <span className="tsd-signature-symbol">]: </span>
                            {With(props, props.model.indexSignature!.type, (superProps, props) => (
                                <>{__partials__.type(props)}</>
                            ))}
                        </Compact>
                    </div>
                    {With(props, props.model.indexSignature, (superProps, props) => (
                        <>{__partials__.comment(props)}</>
                    ))}
                    {!!props.model.indexSignature.type.declaration && (
                        <>
                            {" "}
                            {With(props, props.model.indexSignature.type.declaration, (superProps, props) => (
                                <>{__partials__.parameter(props)}</>
                            ))}
                        </>
                    )}{" "}
                </section>
            </>
        )}
        {With(props, props.model, (superProps, props) => (
            <>
                {__partials__.index(props)}
                {__partials__.members(props)}
            </>
        ))}
    </>
);
