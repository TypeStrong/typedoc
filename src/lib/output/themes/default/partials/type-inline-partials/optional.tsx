import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import * as React from "react";
import { OptionalType } from "../../../../../models";
export const optional =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: OptionalType) =>
        (
            <>
                {partials.type(props.elementType)}
                <span className="tsd-signature-symbol">?</span>
            </>
        );
