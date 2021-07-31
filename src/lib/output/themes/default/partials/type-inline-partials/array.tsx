import { With } from "../../../lib";
import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import * as React from "react";
import { ArrayType } from "../../../../../models";
export const array =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: ArrayType) =>
        (
            <>
                {With(props.elementType, (props) => (
                    <>
                        {partials.type(props, { needsParens: true })}
                        <span className="tsd-signature-symbol">[]</span>
                    </>
                ))}
            </>
        );
