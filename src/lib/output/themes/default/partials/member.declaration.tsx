import { wbr } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { DeclarationReflection, ReflectionType } from "../../../../models";
export const memberDeclaration =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: DeclarationReflection) =>
        (
            <>
                <div className="tsd-signature tsd-kind-icon">
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
                    <span className="tsd-signature-symbol">{!!props.flags.isOptional && "?"}:</span>{" "}
                    {props.type && partials.type(props.type)}
                    {!!props.defaultValue && (
                        <>
                            <span className="tsd-signature-symbol">
                                {" = "}
                                {props.defaultValue}
                            </span>
                        </>
                    )}
                </div>

                {partials.memberSources(props)}

                {partials.comment(props)}

                {!!props.typeParameters && (
                    <>
                        <h4 className="tsd-type-parameters-title">Type parameters</h4>
                        {partials.typeParameters(props)}
                    </>
                )}
                {props.type instanceof ReflectionType && (
                    <>
                        <div className="tsd-type-declaration">
                            <h4>Type declaration</h4>
                            {partials.parameter(props.type.declaration)}
                        </div>
                    </>
                )}
            </>
        );
