import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import React from "react";
export const memberReference = (props) =>
    props.tryGetTargetReflectionDeep ? (
        <>
            {" "}
            {With(props, props.tryGetTargetReflectionDeep, (superProps, props) => (
                <>
                    <IfCond cond={superProps.name === name}>
                        Re-exports <a href={relativeURL(TODO)}>{props.name}</a>
                    </IfCond>
                    <IfNotCond cond={superProps.name === name}>
                        {!!props.flags.isExported ? (
                            <>
                                {" "}
                                Renames and re-exports <a href={relativeURL(TODO)}>{props.name}</a>
                            </>
                        ) : (
                            <>
                                {" "}
                                Renames and exports <a href={relativeURL(TODO)}>{props.name}</a>
                            </>
                        )}{" "}
                    </IfNotCond>
                </>
            ))}
        </>
    ) : (
        <> Re-exports {props.name}</>
    );
