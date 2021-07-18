import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import React from "react";
export const comment = (props) => (
    <>
        {With(props, props.comment, (superProps, props) => (
            <>
                {!!props.hasVisibleComponent && (
                    <>
                        {" "}
                        <div className="tsd-comment tsd-typography">
                            {!!props.shortText && (
                                <>
                                    {" "}
                                    <div className="lead">
                                        <Markdown>{props.shortText}</Markdown>
                                    </div>
                                </>
                            )}
                            {!!props.text && (
                                <>
                                    {" "}
                                    <Markdown>{props.text}</Markdown>
                                </>
                            )}
                            {!!props.tags && (
                                <>
                                    {" "}
                                    <dl className="tsd-comment-tags">
                                        {props.tags.map((item, i) => (
                                            <>
                                                {" "}
                                                <dt>{item.tagName}</dt>
                                                <dd>
                                                    <Markdown>{item.text}</Markdown>
                                                </dd>
                                            </>
                                        ))}{" "}
                                    </dl>
                                </>
                            )}{" "}
                        </div>
                    </>
                )}
            </>
        ))}
    </>
);
