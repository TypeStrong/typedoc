import { wbr, isReflectionType } from "../../lib";
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
                        <li className="tsd-parameter-signature">
                            <ul className={"tsd-signatures " + props.cssClasses}>
                                {props.signatures.map((item) => (
                                    <li className="tsd-signature tsd-kind-icon">
                                        {partials.memberSignatureTitle(item, { hideName: true })}
                                    </li>
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
                                            {item.type && partials.type(item.type)}
                                        </>
                                    ))}
                                    <span className="tsd-signature-symbol">{"]: "}</span>
                                    {props.indexSignature.type && partials.type(props.indexSignature.type)}
                                </h5>
                                {partials.comment(props.indexSignature)}
                                {isReflectionType(props.indexSignature.type) &&
                                    !!props.indexSignature.type.declaration &&
                                    partials.parameter(props.indexSignature.type.declaration)}
                            </li>
                        </>
                    )}
                    {props.children?.map((item) => (
                        <>
                            {item.signatures ? (
                                <li className="tsd-parameter">
                                    <h5>
                                        {!!item.flags.isRest && <span className="tsd-signature-symbol">...</span>}
                                        {wbr(item.name)}
                                        <span className="tsd-signature-symbol">{!!item.flags.isOptional && "?"}:</span>
                                        function
                                    </h5>

                                    {partials.memberSignatures(item)}
                                </li>
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
                                        {isReflectionType(item.type) &&
                                            !!item.type.declaration &&
                                            partials.parameter(item.type.declaration)}
                                    </li>
                                </>
                            ) : (
                                <>
                                    {/* getter/setter */}
                                    {item.getSignature && (
                                        <>
                                            {/* getter */}
                                            <li className="tsd-parameter">
                                                <h5>
                                                    {item.getSignature.flags.map((item) => (
                                                        <>
                                                            <span className={"tsd-flag ts-flag" + item}>{item}</span>{" "}
                                                        </>
                                                    ))}
                                                    <span className="tsd-signature-symbol">get </span>
                                                    {wbr(item.name)}
                                                    <span className="tsd-signature-symbol">(): </span>
                                                    {item.getSignature.type && partials.type(item.getSignature.type)}
                                                </h5>

                                                {partials.comment(item.getSignature)}
                                            </li>
                                        </>
                                    )}
                                    {item.setSignature && (
                                        <>
                                            {/* setter */}
                                            <li className="tsd-parameter">
                                                <h5>
                                                    {item.setSignature.flags.map((item) => (
                                                        <>
                                                            <span className={"tsd-flag ts-flag" + item}>{item}</span>{" "}
                                                        </>
                                                    ))}
                                                    <span className="tsd-signature-symbol">set </span>
                                                    {wbr(item.name)}
                                                    <span className="tsd-signature-symbol">(</span>
                                                    {item.setSignature.parameters?.map((item) => (
                                                        <>
                                                            {item.name}
                                                            <span className="tsd-signature-symbol">: </span>
                                                            {item.type ? (
                                                                partials.type(item.type)
                                                            ) : (
                                                                <span className="tsd-signature-type">any</span>
                                                            )}
                                                        </>
                                                    ))}
                                                    <span className="tsd-signature-symbol">): </span>
                                                    {item.setSignature.type && partials.type(item.setSignature.type)}
                                                </h5>

                                                {partials.comment(item.setSignature)}
                                            </li>
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    ))}
                </ul>
            </>
        );
