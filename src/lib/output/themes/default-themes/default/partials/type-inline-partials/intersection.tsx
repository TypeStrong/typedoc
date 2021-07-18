import { TypeInlinePartialsOptions } from "./options";
import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../../lib";
import React from "react";
import { IntersectionType } from "../../../../typedoc/src/lib/models";
export const intersection = (props: IntersectionType) => (
    <>
        {!!needsParens && (
            <>
                {" "}
                <span className="tsd-signature-symbol">(</span>
            </>
        )}
        {props.types.map((item, i) => (
            <>
                {!item.first && (
                    <>
                        {" "}
                        <span className="tsd-signature-symbol"> & </span>
                    </>
                )}{" "}
                {__partials__.type(props, { needsParens: true })}
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
