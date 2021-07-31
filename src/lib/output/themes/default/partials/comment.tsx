import { With } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { Reflection } from "../../../../models";

export const comment =
    ({ markdown, Markdown }: DefaultThemeRenderContext) =>
    (props: Reflection) =>
        (
            <>
                {With(props.comment, (props) => (
                    <>
                        {!!props.hasVisibleComponent() && (
                            <>
                                <div className="tsd-comment tsd-typography">
                                    {!!props.shortText && (
                                        <>
                                            <div
                                                className="lead"
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        "\n" +
                                                        markdown(
                                                            props.shortText
                                                        ),
                                                }}
                                            ></div>
                                        </>
                                    )}
                                    {!!props.text && (
                                        <Markdown>{props.text}</Markdown>
                                    )}
                                    {props.tags?.length > 0 && (
                                        <>
                                            <dl className="tsd-comment-tags">
                                                {props.tags.map((item) => (
                                                    <>
                                                        <dt>{item.tagName}</dt>
                                                        <dd
                                                            dangerouslySetInnerHTML={{
                                                                __html: markdown(
                                                                    item.text
                                                                ),
                                                            }}
                                                        ></dd>
                                                    </>
                                                ))}
                                            </dl>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                ))}
            </>
        );
