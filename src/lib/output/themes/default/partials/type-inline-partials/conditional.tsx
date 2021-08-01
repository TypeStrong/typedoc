import { TypeInlinePartialsOptions } from "./options";
import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { createElement } from "../../../../../utils";
import { ConditionalType } from "../../../../../models";
export const conditional =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: ConditionalType, { needsParens = false }: TypeInlinePartialsOptions = {}) =>
        (
            <>
                {needsParens && <span class="tsd-signature-symbol">(</span>}
                {partials.type(props.checkType, { needsParens: true })}
                <span class="tsd-signature-symbol"> extends </span>
                {partials.type(props.extendsType)}
                <span class="tsd-signature-symbol"> ? </span>
                {partials.type(props.trueType)}
                <span class="tsd-signature-symbol"> : </span>
                {partials.type(props.falseType)}
                {needsParens && <span class="tsd-signature-symbol">)</span>}
            </>
        );
