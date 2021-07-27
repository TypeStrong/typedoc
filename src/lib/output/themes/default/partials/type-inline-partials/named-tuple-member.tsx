import { With, __partials__ } from "../../../lib";
import * as React from "react";
import { NamedTupleMember } from "../../../../../models";
export const namedTupleMember = (props: NamedTupleMember) => (
    <>
        {props.name}
        {props.isOptional ? (
            <>

                <span className="tsd-signature-symbol">?: </span>
            </>
        ) : (
            <>

                <span className="tsd-signature-symbol">: </span>
            </>
        )}
        {With(props.element, (props) => (
            <>{__partials__.type(props)}</>
        ))}
    </>
);
