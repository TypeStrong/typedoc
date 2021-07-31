import { With, wbr, isReflectionType } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { DeclarationReflection } from "../../../../models";
export const parameter =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: DeclarationReflection) =>
        (
            <>
                <ul className="tsd-parameters">
                    {!!props.signatures && (
                        <>
                            <li className="tsd-parameter-signature">
                                <ul className={"tsd-signatures " + props.cssClasses}>
                                    {props.signatures.map((item) => (
                                        <>
                                            <li className="tsd-signature tsd-kind-icon">
                                                {partials.memberSignatureTitle(item, { hideName: true })}
                                            </li>
                                        </>
                                    ))}
                                </ul>

                                <ul className="tsd-descriptions">
                                    {props.signatures.map((item) => (
                                        <>
                                            <li className="tsd-description">
                                                {partials.memberSignatureBody(item, { hideSources: true })}
                                            </li>
                                        </>
                                    ))}
                                </ul>
                            </li>
                        </>
                    )}
                    {!!props.indexSignature && (
                        <>
                            <li className="tsd-parameter-index-signature">
                                <h5>
                                    <span className="tsd-signature-symbol">[</span>
                                    {props.indexSignature?.parameters?.map((item) => (
                                        <>
                                            {!!item.flags.isRest && <span className="tsd-signature-symbol">...</span>}
                                            {item.name}
                                            {": "}
                                            {With(item.type, (props) => (
                                                <>{partials.type(props)}</>
                                            ))}
                                        </>
                                    ))}
                                    <span className="tsd-signature-symbol">{"]: "}</span>
                                    {With(props.indexSignature.type, (props) => (
                                        <>{partials.type(props)}</>
                                    ))}
                                </h5>
                                {With(props.indexSignature, (props) => (
                                    <>{partials.comment(props)}</>
                                ))}
                                {isReflectionType(props.indexSignature.type) &&
                                    !!props.indexSignature.type.declaration && (
                                        <>
                                            {With(props.indexSignature.type.declaration, (props) => (
                                                <>{partials.parameter(props)}</>
                                            ))}
                                        </>
                                    )}
                            </li>
                        </>
                    )}
                    {props.children?.map((item) => (
                        <>
                            {item.signatures ? (
                                <>
                                    <li className="tsd-parameter">
                                        <h5>
                                            {!!item.flags.isRest && <span className="tsd-signature-symbol">...</span>}
                                            {wbr(item.name)}
                                            <span className="tsd-signature-symbol">
                                                {!!item.flags.isOptional && "?"}:
                                            </span>
                                            function
                                        </h5>

                                        {partials.memberSignatures(item)}
                                    </li>
                                </>
                            ) : item.type ? (
                                <>
                                    {/* standard type */}
                                    <li className="tsd-parameter">
                                        <h5>
                                            {item.flags.map((item) => (
                                                <>
                                                    <span className={"tsd-flag ts-flag" + item}>{item}</span>{" "}
                                                </>
                                            ))}
                                            {!!item.flags.isRest && <span className="tsd-signature-symbol">...</span>}
                                            {wbr(item.name)}
                                            <span className="tsd-signature-symbol">
                                                {!!item.flags.isOptional && "?"}
                                                {": "}
                                            </span>
                                            {partials.type(item.type)}
                                        </h5>
                                        {partials.comment(item)}
                                        {!!item.children && <> {partials.parameter(item)}</>}
                                        {isReflectionType(item.type) && !!item.type.declaration && (
                                            <>
                                                {With(item.type.declaration, (props) => (
                                                    <>{partials.parameter(props)}</>
                                                ))}
                                            </>
                                        )}
                                    </li>
                                </>
                            ) : (
                                <>
                                    {/* getter/setter */}
                                    {With(item.getSignature, (props) => (
                                        <>
                                            {/* getter */}
                                            <li className="tsd-parameter">
                                                <h5>
                                                    {props.flags.map((item) => (
                                                        <>
                                                            <span className={"tsd-flag ts-flag" + item}>{item}</span>{" "}
                                                        </>
                                                    ))}
                                                    <span className="tsd-signature-symbol">get </span>
                                                    {wbr(item.name)}
                                                    <span className="tsd-signature-symbol">(): </span>
                                                    {With(props.type, (props) => (
                                                        <>{partials.type(props)}</>
                                                    ))}
                                                </h5>

                                                {partials.comment(props)}
                                            </li>
                                        </>
                                    ))}
                                    {With(item.setSignature, (props) => (
                                        <>
                                            {/* setter */}
                                            <li className="tsd-parameter">
                                                <h5>
                                                    {props.flags.map((item) => (
                                                        <>
                                                            <span className={"tsd-flag ts-flag" + item}>{item}</span>{" "}
                                                        </>
                                                    ))}
                                                    <span className="tsd-signature-symbol">{"set "}</span>
                                                    {wbr(item.name)}
                                                    <span className="tsd-signature-symbol">(</span>
                                                    {props.parameters?.map((item) => (
                                                        <>
                                                            {item.name}
                                                            <span className="tsd-signature-symbol">: </span>
                                                            {item.type ? (
                                                                <>
                                                                    {With(item.type, (props) => (
                                                                        <>{partials.type(props)}</>
                                                                    ))}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="tsd-signature-type">any</span>
                                                                </>
                                                            )}
                                                        </>
                                                    ))}
                                                    <span className="tsd-signature-symbol">): </span>
                                                    {With(props.type, (props) => (
                                                        <>{partials.type(props)}</>
                                                    ))}
                                                </h5>

                                                {partials.comment(props)}
                                            </li>
                                        </>
                                    ))}
                                </>
                            )}
                        </>
                    ))}
                </ul>
            </>
        );
