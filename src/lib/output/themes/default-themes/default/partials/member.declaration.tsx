import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import React from "react";
export const memberDeclaration = (props) => (
    <>
        <div className="tsd-signature tsd-kind-icon">
            <Compact>
                {wbr(TODO)}
                {!!props.typeParameters && (
                    <>
                        {" "}
                        {"<"}
                        {props.typeParameters.map((item, i) => (
                            <>
                                {" "}
                                {!!item.index && ",\xA0"}
                                {item.name}
                            </>
                        ))}{" "}
                        {">"}
                    </>
                )}{" "}
                <span className="tsd-signature-symbol">{!!props.isOptional && "?"}:</span>
                {With(props, props.type, (superProps, props) => (
                    <>{__partials__.type(props)}</>
                ))}
                {!!props.defaultValue && (
                    <>
                        {" "}
                        <span className="tsd-signature-symbol">
                             =
                            {props.defaultValue}
                        </span>
                    </>
                )}
            </Compact>
        </div>

        {__partials__["memberSources"](props)}

        {__partials__.comment(props)}

        {!!props.typeParameters && (
            <>
                {" "}
                <h4 className="tsd-type-parameters-title">Type parameters</h4>
                {__partials__.typeParameters(props)}
            </>
        )}
        {!!props.type.declaration && (
            <>
                {" "}
                <div className="tsd-type-declaration">
                    <h4>Type declaration</h4>
                    {With(props, props.type.declaration, (superProps, props) => (
                        <>{__partials__.parameter(props)}</>
                    ))}
                </div>
            </>
        )}
    </>
);
