import { With, wbr, __partials__, Compact, isReflectionType } from "../../lib";
import * as React from "react";
import { DeclarationReflection } from "../../../../models";
export const memberDeclaration = (props: DeclarationReflection) => (
    <>
        <div className="tsd-signature tsd-kind-icon">
            <Compact>
                {wbr(props.name)}
                {!!props.typeParameters && (
                    <>
                        {" <"}
                        {props.typeParameters.map((item, i) => (
                            <>
                                {" "}
                                {i > 0 && ",\xA0"}
                                {item.name}
                            </>
                        ))}{" "}
                        {">"}
                    </>
                )}
                <span className="tsd-signature-symbol">{!!props.flags.isOptional && "?"}:</span>
                {" "}
                {With(props.type, (props) => (
                    <>{__partials__.type(props)}</>
                ))}
                {!!props.defaultValue && (
                    <>
                        {" "}
                        <span className="tsd-signature-symbol">
                            {" ="}
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
        {isReflectionType(props.type) && !!props.type.declaration && (
            <>
                {" "}
                <div className="tsd-type-declaration">
                    <h4>Type declaration</h4>
                    {With(props.type.declaration, (props) => (
                        <>{__partials__.parameter(props)}</>
                    ))}
                </div>
            </>
        )}
    </>
);
