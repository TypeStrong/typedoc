import { With, __partials__ } from "../../../lib";
import * as React from "react";
import { IndexedAccessType } from "../../../../../models";
export const indexedAccess = (props: IndexedAccessType) => (
    <>
        {With(props.objectType, (props) => (
            <>{__partials__.type(props)}</>
        ))}
        <span className="tsd-signature-symbol">[</span>
        {With(props.indexType, (props) => (
            <>{__partials__.type(props)}</>
        ))}
        <span className="tsd-signature-symbol">]</span>
    </>
);
