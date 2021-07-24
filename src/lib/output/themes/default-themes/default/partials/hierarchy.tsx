import { With, __partials__ } from "../../lib";
import * as React from "react";
export const hierarchy = (props) => (
        <ul className="tsd-hierarchy">
            {props.types.map((item) => (
                    <li>
                        {props.isTarget ? (
                                <span className="target">{item}</span>
                        ) : (
                                __partials__.type(item)
                        )}
                        {!!item.last && (
                            <>
                                {" "}
                                {With(props.next, (props) => (
                                    <>{__partials__.hierarchy(props)}</>
                                ))}
                            </>
                        )}{" "}
                    </li>
            ))}
        </ul>
);
