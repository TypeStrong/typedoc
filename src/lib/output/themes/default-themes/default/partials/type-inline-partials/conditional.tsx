import { TypeInlinePartialsOptions } from "./options";
import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../../lib";
import * as React from "react";
import { ConditionalType } from "../../../../../../models";
export const conditional = (props: ConditionalType, { needsParens = false }: TypeInlinePartialsOptions = {}) => (
    <>
        {!!needsParens && (
            <>
                {" "}
                <span className="tsd-signature-symbol">(</span>
            </>
        )}{" "}
        {With(props.checkType, (props) => (
            <>{__partials__.type(props, { needsParens: true })}</>
        ))}
        <span className="tsd-signature-symbol"> extends </span>
        {With(props.extendsType, (props) => (
            <>{__partials__.type(props)}</>
        ))}
        <span className="tsd-signature-symbol"> ? </span>
        {With(props.trueType, (props) => (
            <>{__partials__.type(props)}</>
        ))}
        <span className="tsd-signature-symbol"> : </span>
        {With(props.falseType, (props) => (
            <>{__partials__.type(props)}</>
        ))}
        {!!needsParens && (
            <>
                {" "}
                <span className="tsd-signature-symbol">)</span>
            </>
        )}
    </>
);
