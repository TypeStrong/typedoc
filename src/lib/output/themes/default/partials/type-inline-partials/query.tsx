import { With, __partials__ } from "../../../lib";
import * as React from "react";
import { QueryType } from "../../../../../models";
export const query = (props: QueryType) => (
    <>
        <span className="tsd-signature-symbol">typeof </span>
        {With(props.queryType, (props) => (
            <>{__partials__.type(props)}</>
        ))}
    </>
);
