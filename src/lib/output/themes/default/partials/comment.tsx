import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX, Raw } from "../../../../utils";
import { type Reflection, ReflectionKind } from "../../../../models";
import { anchorIcon } from "./anchor-icon";
import { join } from "../../lib";

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
        <>
            {beforeTags}
            <div class="tsd-comment tsd-typography">
                {tags.map((item) => {
                    const name = item.name
                        ? `${context.internationalization.translateTagName(item.tag)}: ${item.name}`
                        : context.internationalization.translateTagName(item.tag);

                    const anchor = props.getUniqueAliasInPage(name);

                    return (
                        <>
                            <h4 class="tsd-anchor-link">
                                <a id={anchor} class="tsd-anchor"></a>
                                {name}
                                {anchorIcon(context, anchor)}
                            </h4>
                            <Raw html={context.markdown(item.content)} />
                        </>
                    );
                })}
            </div>
            {afterTags}
        </>
    );
}

const flagsNotRendered: `@${string}`[] = ["@showCategories", "@showGroups", "@hideCategories", "@hideGroups"];

export function reflectionFlags(context: DefaultThemeRenderContext, props: Reflection) {
    const allFlags = props.flags.getFlagStrings(context.internationalization);
    if (props.comment) {
        for (const tag of props.comment.modifierTags) {
            if (!flagsNotRendered.includes(tag)) {
                allFlags.push(context.internationalization.translateTagName(tag));
            }
        }
    }

    return join(" ", allFlags, (item) => <code class="tsd-tag">{item}</code>);
}
