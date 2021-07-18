import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../../lib";
import React from "react";
import { LiteralType } from "../../../../typedoc/src/lib/models";
export const literal = (props: LiteralType) => (
    <>
        <span className="tsd-signature-type">{props.stringify}</span>
    </>
);
