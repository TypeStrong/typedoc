import { With, wbr, Compact, isReflectionType } from "../../lib";
import {DefaultThemeRenderContext} from '../DefaultThemeRenderContext';
import * as React from "react";
import { DeclarationReflection } from "../../../../models";
export const memberDeclaration = ({partials }: DefaultThemeRenderContext) => (props: DeclarationReflection) => (
    <>
        <div className="tsd-signature tsd-kind-icon">
            <Compact>
                {wbr(props.name)}
                {!!props.typeParameters && (
                    <>
                        {"<"}
                        {props.typeParameters.map((item, i) => (
                            <>

                                {i > 0 && ",\xA0"}
                                {item.name}
                            </>
                        ))}
                        {">"}
                    </>
                )}
                <span className="tsd-signature-symbol">{!!props.flags.isOptional && "?"}:</span>
                {" "}
                {With(props.type, (props) => (
                    <>{partials.type(props)}</>
                ))}
                {!!props.defaultValue && (
                    <>

                        <span className="tsd-signature-symbol">
                            {" = "}
                            {props.defaultValue}
                        </span>
                    </>
                )}
            </Compact>
        </div>

        {partials["memberSources"](props)}

        {partials.comment(props)}

        {!!props.typeParameters && (
            <>

                <h4 className="tsd-type-parameters-title">Type parameters</h4>
                {partials.typeParameters(props)}
            </>
        )}
        {isReflectionType(props.type) && !!props.type.declaration && (
            <>

                <div className="tsd-type-declaration">
                    <h4>Type declaration</h4>
                    {With(props.type.declaration, (props) => (
                        <>{partials.parameter(props)}</>
                    ))}
                </div>
            </>
        )}
    </>
);
