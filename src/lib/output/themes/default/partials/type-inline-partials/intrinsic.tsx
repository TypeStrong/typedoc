import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import * as React from "react";
import { IntrinsicType } from "../../../../../models";
export const intrinsic = (_ctx: DefaultThemeRenderContext) => (props: IntrinsicType) =>
    (
        <>
            <span className="tsd-signature-type">{props.name}</span>
        </>
    );
