import { TypeInlinePartialsOptions } from "./options";
import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { UnionType } from "../../../../../models";
import { createElement } from "../../../../../utils";

export const union =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: UnionType, { needsParens = false }: TypeInlinePartialsOptions = {}) =>
        (
            <>
                {!!needsParens && <span class="tsd-signature-symbol">(</span>}
                {props.types.map((item, i) => (
                    <>
                        {i !== 0 && <span class="tsd-signature-symbol"> | </span>}
                        {partials.type(item, { needsParens: true })}
                    </>
                ))}
                {!!needsParens && <span class="tsd-signature-symbol">)</span>}
            </>
        );
