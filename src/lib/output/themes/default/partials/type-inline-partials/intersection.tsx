import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { createElement } from "../../../../../utils";
import { IntersectionType } from "../../../../../models";
import { TypeInlinePartialsOptions } from "./options";
export const intersection =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: IntersectionType, { needsParens = false }: TypeInlinePartialsOptions = {}) =>
        (
            <>
                {needsParens && <span class="tsd-signature-symbol">(</span>}
                {props.types.map((item, i) => (
                    <>
                        {i > 0 && <span class="tsd-signature-symbol"> & </span>}
                        {partials.type(item, { needsParens: true })}
                    </>
                ))}
                {needsParens && <span class="tsd-signature-symbol">)</span>}
            </>
        );
