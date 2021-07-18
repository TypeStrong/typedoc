import { TypeInlinePartialsOptions } from "./options";
import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../../lib";
import React from "react";
import { OptionalType } from "../../../../typedoc/src/lib/models";
export const optional = (props: OptionalType) => (
    <>
        {With(props, props.elementType, (superProps, props) => (
            <>{__partials__.type(props)}</>
        ))}
        <span className="tsd-signature-symbol">?</span>
    </>
);
