import { With, __partials__ } from "../../../lib";
import * as React from "react";
import { OptionalType } from "../../../../../models";
export const optional = (props: OptionalType) => (
    <>
        {With(props.elementType, (props) => (
            <>{__partials__.type(props)}</>
        ))}
        <span className="tsd-signature-symbol">?</span>
    </>
);
