import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import * as React from "react";
import { RestType } from "../../../../../models";
export const rest =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: RestType) =>
        (
            <>
                <span className="tsd-signature-symbol">...</span>
                {partials.type(props.elementType)}
            </>
        );
