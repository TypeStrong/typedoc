import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import * as React from "react";
import { TypeParameterType } from "../../../../../models";
export const typeParameter = (_ctx: DefaultThemeRenderContext) => (props: TypeParameterType) =>
    (
        <>
            <span className="tsd-signature-type">{props.name}</span>
        </>
    );
