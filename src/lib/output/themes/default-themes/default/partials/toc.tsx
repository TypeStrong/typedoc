import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import * as React from "react";
export const toc = (props) => (
    <>
        <li className={"#if isInPath current /if " + props.cssClasses}>
            <a href={relativeURL(TODO)} className="tsd-kind-icon">
                {wbr(TODO)}
            </a>
            {!!props.children && (
                <>
                    {" "}
                    <ul>
                        {props.children.map((item) => (
                            <> {__partials__.toc(item)}</>
                        ))}{" "}
                    </ul>
                </>
            )}
        </li>
    </>
);
