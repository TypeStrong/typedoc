import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement, Raw } from "../../../../utils";
import type { Reflection } from "../../../../models";

export function comment({ markdown }: DefaultThemeRenderContext, props: Reflection) {
    if (!props.comment?.hasVisibleComponent()) return;

    return (
        <div class="tsd-comment tsd-typography">
            {!!props.comment.shortText && (
                <div class="lead">
                    Break it
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
    );
}
