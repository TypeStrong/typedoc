import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { TypeParameterContainer } from "../../../../models";

export const typeParameters =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: TypeParameterContainer) =>
        (
            <ul className="tsd-type-parameters">
                {props.typeParameters?.map((item) => (
                    <li>
                        <h4>
                            {item.name}
                            {!!item.type && (
                                <>
                                    <span className="tsd-signature-symbol">{": "}</span>
                                    {partials.type(item.type)}
                                </>
                            )}
                            {!!item.default && (
                                <>
                                    {" = "}
                                    {partials.type(item.default)}
                                </>
                            )}
                        </h4>
                        {partials.comment(item)}
                    </li>
                ))}
            </ul>
        );
