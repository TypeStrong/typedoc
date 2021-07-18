import { TypeInlinePartialsOptions } from "./options";
import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../../lib";
import React from "react";
import { QueryType } from "../../../../typedoc/src/lib/models";
export const query = (props: QueryType) => (
    <>
        <span className="tsd-signature-symbol">typeof </span>
        {With(props, props.queryType, (superProps, props) => (
            <>{__partials__.type(props)}</>
        ))}
    </>
);
