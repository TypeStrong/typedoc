import { TypeInlinePartialsOptions } from "./options";
import { __partials__ } from "../../../lib";
import * as React from "react";
import { UnionType } from "../../../../../models";
export const union = (props: UnionType, { needsParens = false }: TypeInlinePartialsOptions = {}) => (
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
                {__partials__.type(item, { needsParens: true })}
            </>
        ))}
        {!!needsParens && (
            <>

                <span className="tsd-signature-symbol">)</span>
            </>
        )}
    </>
);
