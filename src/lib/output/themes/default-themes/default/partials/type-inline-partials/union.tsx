import { TypeInlinePartialsOptions } from "./options";
import { With, relativeURL, wbr, Compact, IfCond, IfNotCond, Markdown, __partials__ } from "../../../lib";
import React from "react";
import { UnionType } from "../../../../typedoc/src/lib/models";
export const union = (props: UnionType, { needsParens = false }: TypeInlinePartialsOptions = {}) => (
    <>
        {!!needsParens && (
            <>
                {" "}
                <span className="tsd-signature-symbol">(</span>
            </>
        )}
        {props.types.map((item, i) => (
            <>
                {i !== 0 && (
                    <>
                        {" "}
                        <span className="tsd-signature-symbol"> | </span>
                    </>
                )}{" "}
                {__partials__.type(item, { needsParens: true })}
            </>
        ))}
        {!!needsParens && (
            <>
                {" "}
                <span className="tsd-signature-symbol">)</span>
            </>
        )}
    </>
);
