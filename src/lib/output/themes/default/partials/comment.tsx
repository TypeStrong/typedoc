import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX, Raw } from "../../../../utils";
import { type Reflection, ReflectionKind } from "../../../../models";
import { camelToTitleCase } from "../../lib";

// Note: Comment modifiers are handled in `renderFlags`

export function commentSummary({ markdown }: DefaultThemeRenderContext, props: Reflection) {
    if (!props.comment?.summary.some((part) => part.text)) return;

    return (
        <div class="tsd-comment tsd-typography">
            <Raw html={markdown(props.comment.summary)} />
        </div>
    );
}

export function commentTags(context: DefaultThemeRenderContext, props: Reflection) {
    if (!props.comment) return;

    const beforeTags = context.hook("comment.beforeTags", context, props.comment, props);
    const afterTags = context.hook("comment.afterTags", context, props.comment, props);

    const tags = props.kindOf(ReflectionKind.SomeSignature)
        ? props.comment.blockTags.filter((tag) => tag.tag !== "@returns" && !tag.skipRendering)
        : props.comment.blockTags.filter((tag) => !tag.skipRendering);

    return (
        <div class="tsd-comment tsd-typography">
            {beforeTags}
            {tags.map((item) => {
                const name = item.name
                    ? `${camelToTitleCase(item.tag.substring(1))}: ${item.name}`
                    : camelToTitleCase(item.tag.substring(1));

                return (
                    <>
                        <h4>{name}</h4>
                        <Raw html={context.markdown(item.content)} />
                    </>
                );
            })}
            {afterTags}
        </div>
    );
}

const flagsNotRendered: `@${string}`[] = ["@showCategories", "@showGroups", "@hideCategories", "@hideGroups"];

export function reflectionFlags(_context: DefaultThemeRenderContext, props: Reflection) {
    const allFlags = [...props.flags];
    if (props.comment) {
        for (const tag of props.comment.modifierTags) {
            if (!flagsNotRendered.includes(tag)) {
                allFlags.push(camelToTitleCase(tag.substring(1)));
            }
        }
    }

    return (
        <>
            {allFlags.map((item) => (
                <>
                    <code class={"tsd-tag ts-flag" + item}>{item}</code>{" "}
                </>
            ))}
        </>
    );
}
