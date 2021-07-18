import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import React from "react";
export const parameter = (props) => (
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
                                {props.indexSignature.parameters.map((item, i) => (
                                    <>
                                        {" "}
                                        {!!item.flags.isRest && <span className="tsd-signature-symbol">...</span>}
                                        {item.name}:
                                        {With(item, item.type, (superProps, props) => (
                                            <>{__partials__.type(props)}</>
                                        ))}
                                    </>
                                ))}{" "}
                                <span className="tsd-signature-symbol">]: </span>
                                {With(props, props.indexSignature.type, (superProps, props) => (
                                    <>{__partials__.type(props)}</>
                                ))}
                            </Compact>
                        </h5>
                        {With(props, props.indexSignature, (superProps, props) => (
                            <>{__partials__.comment(props)}</>
                        ))}
                        {!!props.indexSignature.type.declaration && (
                            <>
                                {" "}
                                {With(props, props.indexSignature.type.declaration, (superProps, props) => (
                                    <>{__partials__.parameter(props)}</>
                                ))}
                            </>
                        )}{" "}
                    </li>
                </>
            )}
            {props.children.map((item, i) => (
                <>
                    {!!item.signatures ? (
                        <>
                            {" "}
                            <li className="tsd-parameter">
                                <h5>
                                    <Compact>
                                        {!!item.flags.isRest && <span className="tsd-signature-symbol">...</span>}
                                        {wbr(TODO)}
                                        <span className="tsd-signature-symbol">{!!item.isOptional && "?"}:</span>
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
                                        {With(item, item.type, (superProps, props) => (
                                            <>
                                                {wbr(TODO)}
                                                <span className="tsd-signature-symbol">
                                                    {!!props.superProps.flags.isOptional && "?"}:
                                                </span>
                                                {__partials__.type(props)}
                                            </>
                                        ))}
                                    </Compact>
                                </h5>
                                {__partials__.comment(item)}
                                {!!item.children && <> {__partials__.parameter(item)}</>}
                                {!!item.type.declaration && (
                                    <>
                                        {" "}
                                        {With(item, item.type.declaration, (superProps, props) => (
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
                            {With(item, item.getSignature, (superProps, props) => (
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
                                                {With(props, props.type, (superProps, props) => (
                                                    <>{__partials__.type(props)}</>
                                                ))}
                                            </Compact>
                                        </h5>

                                        {__partials__.comment(props)}
                                    </li>
                                </>
                            ))}
                            {With(item, item.setSignature, (superProps, props) => (
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
                                                {props.parameters.map((item, i) => (
                                                    <>
                                                        {" "}
                                                        {item.name}
                                                        <span className="tsd-signature-symbol">: </span>
                                                        {!!item.type ? (
                                                            <>
                                                                {" "}
                                                                {With(item, item.type, (superProps, props) => (
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
                                                {With(props, props.type, (superProps, props) => (
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
