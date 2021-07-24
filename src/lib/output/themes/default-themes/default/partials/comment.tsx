import { With, __partials__, Markdown } from "../../lib";
import * as React from "react";
export const comment = (props) => (
    <>
        {With(props.comment, (props) => (
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
