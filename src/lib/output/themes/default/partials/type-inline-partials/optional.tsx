import { With } from "../../../lib";
import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import * as React from "react";
import { OptionalType } from "../../../../../models";
export const optional =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: OptionalType) =>
        (
            <>
                {With(props.elementType, (props) => (
                    <>{partials.type(props)}</>
                ))}
                <span className="tsd-signature-symbol">?</span>
            </>
        );
