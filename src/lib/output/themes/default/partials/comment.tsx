import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { JSX, Raw } from "../../../../utils/index.js";
import { type CommentDisplayPart, type Reflection, ReflectionKind } from "../../../../models/index.js";
import { anchorIcon } from "./anchor-icon.js";
import { join } from "../../lib.js";

// Note: Comment modifiers are handled in `renderFlags`

export function commentShortSummary({ markdown }: DefaultThemeRenderContext, props: Reflection) {
    let shortSummary: readonly CommentDisplayPart[] | undefined;
    if (props.isDocument()) {
        if (typeof props.frontmatter["summary"] === "string") {
            shortSummary = [{ kind: "text", text: props.frontmatter["summary"] }];
        }
    } else {
        shortSummary = props.comment?.getShortSummary();
    }

    if (!shortSummary?.some((part) => part.text)) return;

    return (
        <div class="tsd-comment tsd-typography">
            <Raw html={markdown(shortSummary)} />
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

export function commentTags(context: DefaultThemeRenderContext, props: Reflection) {
    if (!props.comment) return;

    const skippedTags = context.options.getValue("notRenderedTags");
    const beforeTags = context.hook("comment.beforeTags", context, props.comment, props);
    const afterTags = context.hook("comment.afterTags", context, props.comment, props);

    const tags = props.kindOf(ReflectionKind.SomeSignature)
        ? props.comment.blockTags.filter(
              (tag) => tag.tag !== "@returns" && !tag.skipRendering && !skippedTags.includes(tag.tag),
          )
        : props.comment.blockTags.filter((tag) => !tag.skipRendering && !skippedTags.includes(tag.tag));

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

export function reflectionFlags(context: DefaultThemeRenderContext, props: Reflection) {
    const flagsNotRendered = context.options.getValue("notRenderedTags");
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
