import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import * as React from "react";
import { ArrayType } from "../../../../../models";
export const array =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: ArrayType) =>
        (
            <>
                {partials.type(props.elementType, { needsParens: true })}
                <span className="tsd-signature-symbol">[]</span>
            </>
        );
