import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import React from "react";
export const memberGetterSetter = (props) => (
    <>
        <ul className={"tsd-signatures " + props.cssClasses}>
            {!!props.getSignature && (
                <>
                    {" "}
                    {With(props, props.getSignature, (superProps, props) => (
                        <>
                            <li className="tsd-signature tsd-kind-icon">
                                <Compact>
                                    <span className="tsd-signature-symbol">get</span>
                                    {props.superProps.name}
                                    {__partials__["memberSignatureTitle"](props, { hideName: true })}
                                </Compact>
                            </li>
                        </>
                    ))}
                </>
            )}
            {!!props.setSignature && (
                <>
                    {" "}
                    {With(props, props.setSignature, (superProps, props) => (
                        <>
                            <li className="tsd-signature tsd-kind-icon">
                                <Compact>
                                    <span className="tsd-signature-symbol">set</span>
                                    {props.superProps.name}
                                    {__partials__["memberSignatureTitle"](props, { hideName: true })}
                                </Compact>
                            </li>
                        </>
                    ))}
                </>
            )}
        </ul>

        <ul className="tsd-descriptions">
            {!!props.getSignature && (
                <>
                    {" "}
                    {With(props, props.getSignature, (superProps, props) => (
                        <>
                            <li className="tsd-description">{__partials__["memberSignatureBody"](props)}</li>
                        </>
                    ))}
                </>
            )}
            {!!props.setSignature && (
                <>
                    {" "}
                    {With(props, props.setSignature, (superProps, props) => (
                        <>
                            <li className="tsd-description">{__partials__["memberSignatureBody"](props)}</li>
                        </>
                    ))}
                </>
            )}
        </ul>
    </>
);
