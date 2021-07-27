import { With, __partials__, Compact, Markdown, hasDefaultValue, hasType, isReflectionType } from "../../lib";
import * as React from "react";
import { SignatureReflection } from "../../../../models";
export const memberSignatureBody = (props: SignatureReflection, {hideSources = false}: {hideSources?: boolean} = {}) => (
    <>
        {!hideSources && <> {__partials__["memberSources"](props)}</>}
        {__partials__.comment(props)}

        {!!props.typeParameters && (
            <>
                {" "}
                <h4 className="tsd-type-parameters-title">Type parameters</h4>
                {__partials__.typeParameters(props)}
            </>
        )}
        {props.parameters && props.parameters.length > 0 && (
            <>
                {" "}
                <h4 className="tsd-parameters-title">Parameters</h4>
                <ul className="tsd-parameters">
                    {props.parameters.map((item) => (
                        <>
                            {" "}
                            <li>
                                <h5>
                                    <Compact>
                                        {item.flags.map((item) => (
                                            <>
                                                {" "}
                                                <span className={"tsd-flag ts-flag" + item}>{item}</span>
                                            </>
                                        ))}{" "}
                                        {!!item.flags.isRest && <span className="tsd-signature-symbol">...</span>}
                                        {item.name}{": "}
                                        {With(item.type, (props) => (
                                            <>{__partials__.type(props)}</>
                                        ))}
                                        {hasDefaultValue(item) && (
                                            <>
                                                {" "}
                                                <span className="tsd-signature-symbol">
                                                    {" ="}
                                                    {item.defaultValue}
                                                </span>
                                            </>
                                        )}{" "}
                                    </Compact>
                                </h5>
                                {__partials__.comment(item)}
                                {hasType(item) && isReflectionType(item.type) && !!item.type.declaration && (
                                    <>
                                        {" "}
                                        {With(item.type.declaration, (props) => (
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
        {hasType(props) && (
            <>
                {" "}
                <h4 className="tsd-returns-title">
                    {"Returns "}
                    <Compact>
                        {With(props.type, (props) => (
                            <>{__partials__.type(props)}</>
                        ))}
                    </Compact>
                </h4>
                {!!props.comment?.returns && (
                    <>
                        {" "}
                        <Markdown>{props.comment.returns}</Markdown>
                    </>
                )}
                {isReflectionType(props.type) && props.type.declaration && (
                    <>
                        {" "}
                        {With(props.type.declaration, (props) => (
                            <>{__partials__.parameter(props)}</>
                        ))}
                    </>
                )}
            </>
        )}
    </>
);
