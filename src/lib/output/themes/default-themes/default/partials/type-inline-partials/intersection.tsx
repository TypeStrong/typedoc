import { TypeInlinePartialsOptions } from "./options";
import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../../lib";
import * as React from "react";
import { IntersectionType } from "../../../../../../models";
export const intersection = (props: IntersectionType, {needsParens}: {needsParens: boolean}) => (
    <>
        {!!needsParens && (
            <>
                {" "}
                <span className="tsd-signature-symbol">(</span>
            </>
        )}
        {props.types.map((item, i) => (
            <>
                {i > 0 && (
                    <>
                        {" "}
                        <span className="tsd-signature-symbol"> & </span>
                    </>
                )}{" "}
                {__partials__.type(props, { needsParens: true })}
            </>
        ))}
        {!!needsParens && (
            <>
                {" "}
                <span className="tsd-signature-symbol">)</span>
            </>
        )}
    </>
);
