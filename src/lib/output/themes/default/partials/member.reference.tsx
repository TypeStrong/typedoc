import { With, relativeURL, __partials__, IfCond, IfNotCond } from "../../lib";
import * as React from "react";
import { ReferenceReflection } from "../../../../models";
export const memberReference = (props: ReferenceReflection) =>
    props.tryGetTargetReflectionDeep ? (
        <>
            {" "}
            {With(props.tryGetTargetReflectionDeep(), (targetReflection) => (
                <>
                    <IfCond cond={props.name === targetReflection.name}>
                        Re-exports <a href={relativeURL(targetReflection.url)}>{targetReflection.name}</a>
                    </IfCond>
                    <IfNotCond cond={props.name === targetReflection.name}>
                        {targetReflection.flags.isExported ? (
                            <>
                                {" "}
                                Renames and re-exports <a href={relativeURL(targetReflection.url)}>{targetReflection.name}</a>
                            </>
                        ) : (
                            <>
                                {" "}
                                Renames and exports <a href={relativeURL(targetReflection.url)}>{targetReflection.name}</a>
                            </>
                        )}{" "}
                    </IfNotCond>
                </>
            ))}
        </>
    ) : (
        <> Re-exports {props.name}</>
    );
