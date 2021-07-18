import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import React from "react";
export const hierarchy = (props) => (
    <>
        <ul className="tsd-hierarchy">
            {props.types.map((item, i) => (
                <>
                    {" "}
                    <li>
                        {!!item.superProps.isTarget ? (
                            <>
                                {" "}
                                <span className="target">{item}</span>
                            </>
                        ) : (
                            <>
                                {" "}
                                <Compact>{__partials__.type(item)}</Compact>
                            </>
                        )}
                        {!!item.last && (
                            <>
                                {" "}
                                {With(item, item.superProps.next, (superProps, props) => (
                                    <>{__partials__.hierarchy(props)}</>
                                ))}
                            </>
                        )}{" "}
                    </li>
                </>
            ))}
        </ul>
    </>
);
