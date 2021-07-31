import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { Reflection } from "../../../../models";

export const comment =
    ({ markdown, Markdown }: DefaultThemeRenderContext) =>
    (props: Reflection) =>
        !!props.comment?.hasVisibleComponent() && (
            <>
                <div className="tsd-comment tsd-typography">
                    {!!props.comment.shortText && (
                        <>
                            <div
                                className="lead"
                                dangerouslySetInnerHTML={{
                                    __html: "\n" + markdown(props.comment.shortText),
                                }}
                            ></div>
                        </>
                    )}
                    {!!props.comment.text && <Markdown>{props.comment.text}</Markdown>}
                    {props.comment.tags?.length > 0 && (
                        <dl className="tsd-comment-tags">
                            {props.comment.tags.map((item) => (
                                <>
                                    <dt>{item.tagName}</dt>
                                    <dd
                                        dangerouslySetInnerHTML={{
                                            __html: markdown(item.text),
                                        }}
                                    ></dd>
                                </>
                            ))}
                        </dl>
                    )}
                </div>
            </>
        );
