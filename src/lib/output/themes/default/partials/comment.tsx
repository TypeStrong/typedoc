import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX, Raw } from "../../../../utils";
import type { Reflection } from "../../../../models";

export function comment({ markdown }: DefaultThemeRenderContext, props: Reflection) {
    if (!props.comment?.hasVisibleComponent()) return;

    return (
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
                <div class="tsd-comment-tags">
                    {props.comment.tags.map((item) => (
                        <dl class="tsd-comment-tag-group">
                            <dt>
                                <code class="tsd-tag">
                                    {item.tagName}
                                    {item.paramName ? ` ${item.paramName}` : ""}
                                </code>
                            </dt>
                            <dd>
                                <Raw html={markdown(item.text)} />
                            </dd>
                        </dl>
                    ))}
                </div>
            )}
        </div>
    );
}
