import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import * as React from "react";
import { ReferenceReflection } from "../../../../../models";
export const memberReference = (props: ReferenceReflection) =>
    props.tryGetTargetReflectionDeep ? (
        <>
            {" "}
            {With(props, props.tryGetTargetReflectionDeep(), (props, props2) => (
                <>
                    <IfCond cond={props.name === props2.name}>
                        Re-exports <a href={relativeURL(props2.url)}>{props2.name}</a>
                    </IfCond>
                    <IfNotCond cond={props.name === props2.name}>
                        {props2.flags.isExported ? (
                            <>
                                {" "}
                                Renames and re-exports <a href={relativeURL(props2.url)}>{props2.name}</a>
                            </>
                        ) : (
                            <>
                                {" "}
                                Renames and exports <a href={relativeURL(props2.url)}>{props2.name}</a>
                            </>
                        )}{" "}
                    </IfNotCond>
                </>
            ))}
        </>
    ) : (
        <> Re-exports {props.name}</>
    );
