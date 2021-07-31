import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import * as React from "react";
import { TypeOperatorType } from "../../../../../models";
export const typeOperator =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: TypeOperatorType) =>
        (
            <>
                <span className="tsd-signature-symbol">{props.operator} </span>
                {partials.type(props.target)}
            </>
        );
