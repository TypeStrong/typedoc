import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import React from "react";
export const memberSignatureBody = (props) => (
    <>
        {!props.hideSources && <> {__partials__["memberSources"](props)}</>}
        {__partials__.comment(props)}

        {!!props.typeParameters && (
            <>
                {" "}
                <h4 className="tsd-type-parameters-title">Type parameters</h4>
                {__partials__.typeParameters(props)}
            </>
        )}
        {!!props.parameters && (
            <>
                {" "}
                <h4 className="tsd-parameters-title">Parameters</h4>
                <ul className="tsd-parameters">
                    {props.parameters.map((item, i) => (
                        <>
                            {" "}
                            <li>
                                <h5>
                                    <Compact>
                                        {item.flags.map((item, i) => (
                                            <>
                                                {" "}
                                                <span className={"tsd-flag ts-flag" + item}>{item}</span>
                                            </>
                                        ))}{" "}
                                        {!!item.flags.isRest && <span className="tsd-signature-symbol">...</span>}
                                        {item.name}:
                                        {With(item, item.type, (superProps, props) => (
                                            <>{__partials__.type(props)}</>
                                        ))}
                                        {!!item.defaultValue && (
                                            <>
                                                {" "}
                                                <span className="tsd-signature-symbol">
                                                     =
                                                    {item.defaultValue}
                                                </span>
                                            </>
                                        )}{" "}
                                    </Compact>
                                </h5>
                                {__partials__.comment(item)}
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
                    ))}{" "}
                </ul>
            </>
        )}
        {!!props.type && (
            <>
                {" "}
                <h4 className="tsd-returns-title">
                    Returns{" "}
                    <Compact>
                        {With(props, props.type, (superProps, props) => (
                            <>{__partials__.type(props)}</>
                        ))}
                    </Compact>
                </h4>
                {!!props.comment.returns && (
                    <>
                        {" "}
                        <Markdown>{props.comment.returns}</Markdown>
                    </>
                )}
                {!!props.type.declaration && (
                    <>
                        {" "}
                        {With(props, props.type.declaration, (superProps, props) => (
                            <>{__partials__.parameter(props)}</>
                        ))}
                    </>
                )}
            </>
        )}
    </>
);
