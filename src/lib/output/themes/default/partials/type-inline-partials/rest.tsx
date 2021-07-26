import { With, __partials__ } from "../../../lib";
import * as React from "react";
import { RestType } from "../../../../../models";
export const rest = (props: RestType) => (
    <>
        <span className="tsd-signature-symbol">...</span>
        {With(props.elementType, (props) => (
            <>{__partials__.type(props)}</>
        ))}
    </>
);
