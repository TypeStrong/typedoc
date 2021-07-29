import { TypeInlinePartialsOptions } from "./options";
import {DefaultThemeRenderContext} from '../../DefaultThemeRenderContext';
import * as React from "react";
import { UnionType } from "../../../../../models";
export const union = ({partials }: DefaultThemeRenderContext) => (props: UnionType, { needsParens = false }: TypeInlinePartialsOptions = {}) => (
    <>
        {!!needsParens && (
            <>

                <span className="tsd-signature-symbol">(</span>
            </>
        )}
        {props.types.map((item, i) => (
            <>
                {i !== 0 && (
                    <>

                        <span className="tsd-signature-symbol"> | </span>
                    </>
                )}
                {partials.type(item, { needsParens: true })}
            </>
        ))}
        {!!needsParens && (
            <>

                <span className="tsd-signature-symbol">)</span>
            </>
        )}
    </>
);
