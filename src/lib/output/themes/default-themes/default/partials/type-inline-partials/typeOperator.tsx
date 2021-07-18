import { TypeInlinePartialsOptions } from "./options";
import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../../lib";
import React from "react";
import { TypeOperatorType } from "../../../../typedoc/src/lib/models";
export const typeOperator = (props: TypeOperatorType) => (
    <>
        <span className="tsd-signature-symbol">{props.operator} </span>
        {With(props, props.target, (superProps, props) => (
            <>{__partials__.type(props)}</>
        ))}
    </>
);
