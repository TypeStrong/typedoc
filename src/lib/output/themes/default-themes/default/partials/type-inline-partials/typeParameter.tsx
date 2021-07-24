import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../../lib";
import * as React from "react";
import { TypeParameterType } from "../../../../../../models";
export const typeParameter = (props: TypeParameterType) => (
    <>
        <span className="tsd-signature-type">{props.name}</span>
    </>
);
