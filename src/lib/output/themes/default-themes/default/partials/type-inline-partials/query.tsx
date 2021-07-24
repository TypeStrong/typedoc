import { TypeInlinePartialsOptions } from "./options";
import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../../lib";
import * as React from "react";
import { QueryType } from "../../../../../../models";
export const query = (props: QueryType) => (
    <>
        <span className="tsd-signature-symbol">typeof </span>
        {With(props.queryType, (props) => (
            <>{__partials__.type(props)}</>
        ))}
    </>
);
