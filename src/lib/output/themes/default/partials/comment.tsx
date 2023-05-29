import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX, Raw } from "../../../../utils";
import { Reflection, ReflectionKind } from "../../../../models";
import { camelToTitleCase } from "../../lib";

// Note: Comment modifiers are handled in `renderFlags`

export function comment({ markdown }: DefaultThemeRenderContext, props: Reflection) {
    if (!props.comment?.hasVisibleComponent()) return;

    const tags = props.kindOf(ReflectionKind.SomeSignature)
        ? props.comment.blockTags.filter((tag) => tag.tag !== "@returns")
        : props.comment.blockTags;

    return (
        <div class="tsd-comment tsd-typography">
            <Raw html={markdown(props.comment.summary)} />
            {tags.map((item) => (
                <>
                    <h3>{camelToTitleCase(item.tag.substring(1))}</h3>
                    <Raw html={markdown(item.content)} />
                </>
            ))}
        </div>
    );
}

export function commentSummary({ markdown }: DefaultThemeRenderContext, props: Reflection) {
    if (!props.comment?.summary.some((part) => part.text)) return;

    return (
        <div class="tsd-comment tsd-typography">
            <Raw html={markdown(props.comment.summary)} />
        </div>
    );
}

export function commentTags({ markdown }: DefaultThemeRenderContext, props: Reflection) {
    if (!props.comment) return;

    const tags = props.kindOf(ReflectionKind.SomeSignature)
        ? props.comment.blockTags.filter((tag) => tag.tag !== "@returns")
        : props.comment.blockTags;

    return (
        <div class="tsd-comment tsd-typography">
            {tags.map((item) => (
                <>
                    <h4>{camelToTitleCase(item.tag.substring(1))}</h4>
                    <Raw html={markdown(item.content)} />
                </>
            ))}
        </div>
    );
}
