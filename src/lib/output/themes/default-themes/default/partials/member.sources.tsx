import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import React from "react";
export const memberSources = (props) => (
    <>
        <aside className="tsd-sources">
            {!!props.implementationOf && (
                <>
                    {" "}
                    <p>
                        Implementation of{" "}
                        {With(props, props.implementationOf, (superProps, props) => (
                            <>{__partials__.typeAndParent(props)}</>
                        ))}
                    </p>
                </>
            )}
            {!!props.inheritedFrom && (
                <>
                    {" "}
                    <p>
                        Inherited from{" "}
                        {With(props, props.inheritedFrom, (superProps, props) => (
                            <>{__partials__.typeAndParent(props)}</>
                        ))}
                    </p>
                </>
            )}
            {!!props.overwrites && (
                <>
                    {" "}
                    <p>
                        Overrides{" "}
                        {With(props, props.overwrites, (superProps, props) => (
                            <>{__partials__.typeAndParent(props)}</>
                        ))}
                    </p>
                </>
            )}
            {!!props.sources && (
                <>
                    {" "}
                    <ul>
                        {props.sources.map((item, i) => (
                            <>
                                {!!item.url ? (
                                    <>
                                        {" "}
                                        <li>
                                            Defined in{" "}
                                            <a href={item.url}>
                                                {item.fileName}:{item.line}
                                            </a>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        {" "}
                                        <li>
                                            Defined in {item.fileName}:{item.line}
                                        </li>
                                    </>
                                )}
                            </>
                        ))}{" "}
                    </ul>
                </>
            )}
        </aside>
    </>
);
