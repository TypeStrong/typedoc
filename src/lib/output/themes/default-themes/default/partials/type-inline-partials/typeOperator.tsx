import { TypeInlinePartialsOptions } from "./options";
import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../../lib";
import * as React from "react";
import { TypeOperatorType } from "../../../models";
export const typeOperator = (props: TypeOperatorType) => (
    <>
        <span className="tsd-signature-symbol">{props.operator} </span>
        {With(props.target, (props) => (
            <>{__partials__.type(props)}</>
        ))}
    </>
);
