import { With, Compact } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { TypeParameterContainer } from "../../../../models";

export const typeParameters =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: TypeParameterContainer) =>
        (
            <>
                <ul className="tsd-type-parameters">
                    {props.typeParameters?.map((item) => (
                        <>
                            <li>
                                <h4>
                                    <Compact>
                                        {item.name}
                                        {!!item.type && (
                                            <>
                                                <span className="tsd-signature-symbol">{": "}</span>
                                                {With(item.type, (props) => (
                                                    <>{partials.type(props)}</>
                                                ))}
                                            </>
                                        )}
                                        {!!item.default && (
                                            <>
                                                {" = "}
                                                {With(item.default, (props) => (
                                                    <>{partials.type(props)}</>
                                                ))}
                                            </>
                                        )}
                                    </Compact>
                                </h4>
                                {partials.comment(item)}
                            </li>
                        </>
                    ))}
                </ul>
            </>
        );
