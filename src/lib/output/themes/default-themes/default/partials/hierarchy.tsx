import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import * as React from "react";
export const hierarchy = (props) => (
        <ul className="tsd-hierarchy">
            {props.types.map((item, i) => (
                    <li>
                        {!!props.isTarget ? (
                                <span className="target">{item}</span>
                        ) : (
                                __partials__.type(item)
                        )}
                        {!!item.last && (
                            <>
                                {" "}
                                {With(item, props.next, (superProps, props) => (
                                    <>{__partials__.hierarchy(props)}</>
                                ))}
                            </>
                        )}{" "}
                    </li>
            ))}
        </ul>
);
