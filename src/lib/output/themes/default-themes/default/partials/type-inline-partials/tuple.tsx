import { TypeInlinePartialsOptions } from "./options";
import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../../lib";
import React from "react";
import { TupleType } from "../../../../typedoc/src/lib/models";
export const tuple = (props: TupleType) => (
    <>
        <span className="tsd-signature-symbol">[</span>
        {props.elements.map((item, i) => (
            <>
                {!item.first && (
                    <>
                        {" "}
                        <span className="tsd-signature-symbol">, </span>
                    </>
                )}{" "}
                {__partials__.type(item)}
            </>
        ))}{" "}
        <span className="tsd-signature-symbol">]</span>
    </>
);
