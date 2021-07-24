import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown, stringify } from "../../../lib";
import * as React from "react";
import { LiteralType } from "../../../../../../models";
export const literal = (props: LiteralType) => (
    <>
        <span className="tsd-signature-type">{stringify(props.value)}</span>
    </>
);
