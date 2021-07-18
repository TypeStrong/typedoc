import { TypeInlinePartialsOptions } from "./options";
import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../../lib";
import React from "react";
import { RestType } from "../../../../typedoc/src/lib/models";
export const rest = (props: RestType) => (
    <>
        <span className="tsd-signature-symbol">...</span>
        {With(props, props.elementType, (superProps, props) => (
            <>{__partials__.type(props)}</>
        ))}
    </>
);
