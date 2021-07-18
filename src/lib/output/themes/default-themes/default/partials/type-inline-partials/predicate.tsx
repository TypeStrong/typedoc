import { TypeInlinePartialsOptions } from "./options";
import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../../lib";
import React from "react";
import { PredicateType } from "../../../../typedoc/src/lib/models";
export const predicate = (props: PredicateType) => (
    <>
        {!!props.asserts && (
            <>
                {" "}
                <span className="tsd-signature-symbol">asserts </span>
            </>
        )}{" "}
        <span className="tsd-signature-type">{props.name}</span>
        {!!props.targetType && (
            <>
                {" "}
                <span className="tsd-signature-symbol"> is </span>
                {With(props, props.targetType, (superProps, props) => (
                    <>{__partials__.type(props)}</>
                ))}
            </>
        )}
    </>
);
