import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import * as React from "react";
import { IntersectionType } from "../../../../../models";
import { TypeInlinePartialsOptions } from "./options";
export const intersection =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: IntersectionType, { needsParens = false }: TypeInlinePartialsOptions = {}) =>
        (
            <>
                {needsParens && <span className="tsd-signature-symbol">(</span>}
                {props.types.map((item, i) => (
                    <>
                        {i > 0 && <span className="tsd-signature-symbol"> & </span>}
                        {partials.type(item, { needsParens: true })}
                    </>
                ))}
                {needsParens && <span className="tsd-signature-symbol">)</span>}
            </>
        );
