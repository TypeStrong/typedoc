import { TypeInlinePartialsOptions } from "./options";
import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../../lib";
import React from "react";
import { ArrayType } from "../../../../typedoc/src/lib/models";
export const array = (props: ArrayType) => (
    <>
        {With(props, props.elementType, (superProps, props) => (
            <>
                {__partials__.type(props, { needsParens: true })}
                <span className="tsd-signature-symbol">[]</span>
            </>
        ))}
    </>
);
