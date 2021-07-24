import { With, wbr, __partials__, Compact } from "../../lib";
import * as React from "react";
import { DeclarationReflection } from "../../../../../models";
export const parameter = (props: DeclarationReflection) => (
    <>
        <ul className="tsd-parameters">
            {!!props.signatures && (
                <>
                    {" "}
                    <li className="tsd-parameter-signature">
                        <ul className={"tsd-signatures " + props.cssClasses}>
                            {props.signatures.map((item, i) => (
                                <>
                                    {" "}
                                    <li className="tsd-signature tsd-kind-icon">
                                        <Compact>
                                            {__partials__["memberSignatureTitle"](item, { hideName: true })}
                                        </Compact>
                                    </li>
                                </>
                            ))}{" "}
                        </ul>

                        <ul className="tsd-descriptions">
                            {props.signatures.map((item, i) => (
                                <>
                                    {" "}
                                    <li className="tsd-description">
                                        {__partials__["memberSignatureBody"](item, { hideSources: true })}
                                    </li>
                                </>
                            ))}{" "}
                        </ul>
                    </li>
                </>
            )}
            {!!props.indexSignature && (
                <>
                    {" "}
                    <li className="tsd-parameter-index-signature">
                        <h5>
                            <Compact>
                                <span className="tsd-signature-symbol">[</span>
                                {props.indexSignature?.parameters?.map((item, i) => (
                                    <>
                                        {" "}
                                        {!!item.flags.isRest && <span className="tsd-signature-symbol">...</span>}
                                        {item.name}:
                                        {With(item.type, (props) => (
                                            <>{__partials__.type(props)}</>
                                        ))}
                                    </>
                                ))}{" "}
                                <span className="tsd-signature-symbol">]: </span>
                                {With(props.indexSignature.type, (props) => (
                                    <>{__partials__.type(props)}</>
                                ))}
                            </Compact>
                        </h5>
                        {With(props.indexSignature, (props) => (
                            <>{__partials__.comment(props)}</>
                        ))}
                        {!!props.indexSignature.type?.declaration && (
                            <>
                                {" "}
                                {With(props.indexSignature.type.declaration, (props) => (
                                    <>{__partials__.parameter(props)}</>
                                ))}
                            </>
                        )}{" "}
                    </li>
                </>
            )}
            {props.children?.map((item, i) => (
                <>
                    {item.signatures ? (
                        <>
                            {" "}
                            <li className="tsd-parameter">
                                <h5>
                                    <Compact>
                                        {!!item.flags.isRest && <span className="tsd-signature-symbol">...</span>}
                                        {wbr(TODO)}
                                        <span className="tsd-signature-symbol">{!!item.flags.isOptional && "?"}:</span>
                                        function
                                    </Compact>
                                </h5>

                                {__partials__.memberSignatures(item)}
                            </li>
                        </>
                    ) : item.type ? (
                        <>
                            {" "}
                            {/* standard type */}
                            <li className="tsd-parameter">
                                <h5>
                                    <Compact>
                                        {item.flags.map((item, i) => (
                                            <>
                                                {" "}
                                                <span className={"tsd-flag ts-flag" + item}>{item}</span>
                                            </>
                                        ))}{" "}
                                        {!!item.flags.isRest && <span className="tsd-signature-symbol">...</span>}
                                        {wbr(TODO)}
                                        <span className="tsd-signature-symbol">
                                            {!!item.flags.isOptional && "?"}:
                                        </span>
                                        {__partials__.type(item.type)}
                                    </Compact>
                                </h5>
                                {__partials__.comment(item)}
                                {!!item.children && <> {__partials__.parameter(item)}</>}
                                {!!item.type.declaration && (
                                    <>
                                        {" "}
                                        {With(item.type.declaration, (props) => (
                                            <>{__partials__.parameter(props)}</>
                                        ))}
                                    </>
                                )}{" "}
                            </li>
                        </>
                    ) : (
                        <>
                            {" "}
                            {/* getter/setter */}
                            {With(item.getSignature, (props) => (
                                <>
                                    {" "}
                                    {/* getter */}
                                    <li className="tsd-parameter">
                                        <h5>
                                            <Compact>
                                                {props.flags.map((item, i) => (
                                                    <>
                                                        {" "}
                                                        <span className={"tsd-flag ts-flag" + item}>{item}</span>
                                                    </>
                                                ))}{" "}
                                                <span className="tsd-signature-symbol">get </span>
                                                {wbr(TODO)}
                                                <span className="tsd-signature-symbol">(): </span>
                                                {With(props.type, (props) => (
                                                    <>{__partials__.type(props)}</>
                                                ))}
                                            </Compact>
                                        </h5>

                                        {__partials__.comment(props)}
                                    </li>
                                </>
                            ))}
                            {With(item.setSignature, (props) => (
                                <>
                                    {" "}
                                    {/* setter */}
                                    <li className="tsd-parameter">
                                        <h5>
                                            <Compact>
                                                {props.flags.map((item, i) => (
                                                    <>
                                                        {" "}
                                                        <span className={"tsd-flag ts-flag" + item}>{item}</span>
                                                    </>
                                                ))}{" "}
                                                <span className="tsd-signature-symbol">set </span>
                                                {wbr(TODO)}
                                                <span className="tsd-signature-symbol">(</span>
                                                {props.parameters?.map((item, i) => (
                                                    <>
                                                        {" "}
                                                        {item.name}
                                                        <span className="tsd-signature-symbol">: </span>
                                                        {item.type ? (
                                                            <>
                                                                {" "}
                                                                {With(item.type, (props) => (
                                                                    <>{__partials__.type(props)}</>
                                                                ))}
                                                            </>
                                                        ) : (
                                                            <>
                                                                {" "}
                                                                <span className="tsd-signature-type">any</span>
                                                            </>
                                                        )}
                                                    </>
                                                ))}{" "}
                                                <span className="tsd-signature-symbol">): </span>
                                                {With(props.type, (props) => (
                                                    <>{__partials__.type(props)}</>
                                                ))}
                                            </Compact>
                                        </h5>

                                        {__partials__.comment(props)}
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
