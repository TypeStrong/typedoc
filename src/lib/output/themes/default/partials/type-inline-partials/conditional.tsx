import { TypeInlinePartialsOptions } from "./options";
import { With } from "../../../lib";
import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import * as React from "react";
import { ConditionalType } from "../../../../../models";
export const conditional =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: ConditionalType, { needsParens = false }: TypeInlinePartialsOptions = {}) =>
        (
            <>
                {!!needsParens && (
                    <>
                        <span className="tsd-signature-symbol">(</span>
                    </>
                )}
                {With(props.checkType, (props) => (
                    <>{partials.type(props, { needsParens: true })}</>
                ))}
                <span className="tsd-signature-symbol"> extends </span>
                {With(props.extendsType, (props) => (
                    <>{partials.type(props)}</>
                ))}
                <span className="tsd-signature-symbol"> ? </span>
                {With(props.trueType, (props) => (
                    <>{partials.type(props)}</>
                ))}
                <span className="tsd-signature-symbol"> : </span>
                {With(props.falseType, (props) => (
                    <>{partials.type(props)}</>
                ))}
                {!!needsParens && (
                    <>
                        <span className="tsd-signature-symbol">)</span>
                    </>
                )}
            </>
        );
