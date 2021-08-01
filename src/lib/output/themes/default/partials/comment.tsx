import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement, Raw } from "../../../../utils";
import { Reflection } from "../../../../models";

export const comment =
    ({ markdown }: DefaultThemeRenderContext) =>
    (props: Reflection) =>
        !!props.comment?.hasVisibleComponent() && (
            <>
                <div class="tsd-comment tsd-typography">
                    {!!props.comment.shortText && (
                        <div class="lead">
                            <Raw html={"\n" + markdown(props.comment.shortText)} />
                        </div>
                    )}
                    {!!props.comment.text && (
                        <div>
                            <Raw html={markdown(props.comment.text)} />
                        </div>
                    )}
                    {props.comment.tags?.length > 0 && (
                        <dl class="tsd-comment-tags">
                            {props.comment.tags.map((item) => (
                                <>
                                    <dt>{item.tagName}</dt>
                                    <dd>
                                        <Raw html={markdown(item.text)} />
                                    </dd>
                                </>
                            ))}
                        </dl>
                    )}
                </div>
            </>
        );
