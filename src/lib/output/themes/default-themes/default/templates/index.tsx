import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import React from "react";
import { ProjectReflection } from "../../../typedoc/src";
export const component = (props: { model: ProjectReflection }) => (
    <>
        <div className="tsd-panel tsd-typography">
            <Markdown>{props.model.readme}</Markdown>
        </div>
    </>
);
