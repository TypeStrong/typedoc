import { TypeInlinePartialsOptions } from "./options";
import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import * as React from "react";
import { ConditionalType } from "../../../../../models";
export const conditional =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: ConditionalType, { needsParens = false }: TypeInlinePartialsOptions = {}) =>
        (
            <>
                {needsParens && <span className="tsd-signature-symbol">(</span>}
                {partials.type(props.checkType, { needsParens: true })}
                <span className="tsd-signature-symbol"> extends </span>
                {partials.type(props.extendsType)}
                <span className="tsd-signature-symbol"> ? </span>
                {partials.type(props.trueType)}
                <span className="tsd-signature-symbol"> : </span>
                {partials.type(props.falseType)}
                {needsParens && <span className="tsd-signature-symbol">)</span>}
            </>
        );
