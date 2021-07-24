import { TypeInlinePartialsOptions } from "./options";
import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../../lib";
import * as React from "react";
import { NamedTupleMember } from "../../../models";
export const namedTupleMember = (props: NamedTupleMember) => (
    <>
        {props.name}
        {!!props.isOptional ? (
            <>
                {" "}
                <span className="tsd-signature-symbol">?: </span>
            </>
        ) : (
            <>
                {" "}
                <span className="tsd-signature-symbol">: </span>
            </>
        )}{" "}
        {With(props, props.element, (superProps, props) => (
            <>{__partials__.type(props)}</>
        ))}
    </>
);
