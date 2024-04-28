import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { JSX, Raw } from "../../../../utils/index.js";
import { Reflection, ReflectionKind } from "../../../../models/index.js";
import { camelToTitleCase } from "../../lib.js";

// Note: Comment modifiers are handled in `renderFlags`

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
            {tags.map((item) => {
                const name = item.name
                    ? `${camelToTitleCase(item.tag.substring(1))}: ${item.name}`
                    : camelToTitleCase(item.tag.substring(1));

                return (
                    <>
                        <h4>{name}</h4>
                        <Raw html={markdown(item.content)} />
                    </>
                );
            })}
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
