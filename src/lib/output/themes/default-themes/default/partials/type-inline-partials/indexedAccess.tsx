import { TypeInlinePartialsOptions } from "./options";
import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../../lib";
import React from "react";
import { IndexedAccessType } from "../../../../typedoc/src/lib/models";
export const indexedAccess = (props: IndexedAccessType) => (
    <>
        {With(props, props.objectType, (superProps, props) => (
            <>{__partials__.type(props)}</>
        ))}
        <span className="tsd-signature-symbol">[</span>
        {With(props, props.indexType, (superProps, props) => (
            <>{__partials__.type(props)}</>
        ))}
        <span className="tsd-signature-symbol">]</span>
    </>
);
