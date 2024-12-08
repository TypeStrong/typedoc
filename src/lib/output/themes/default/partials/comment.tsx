import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { JSX, Raw } from "../../../../utils/index.js";
import { type CommentDisplayPart, type Reflection, ReflectionKind } from "../../../../models/index.js";
import { anchorIcon } from "./anchor-icon.js";
import { join } from "../../lib.js";

// Note: Comment modifiers are handled in `renderFlags`

export function renderDisplayParts(
    { markdown }: DefaultThemeRenderContext,
    parts: readonly CommentDisplayPart[] | undefined,
) {
    if (!parts?.length) return;

    return (
        <div class="tsd-comment tsd-typography">
            <Raw html={markdown(parts)} />
        </div>
    );
}

export function commentShortSummary(context: DefaultThemeRenderContext, props: Reflection) {
    let shortSummary: readonly CommentDisplayPart[] | undefined;
    if (props.isDocument()) {
        if (typeof props.frontmatter["summary"] === "string") {
            shortSummary = [{ kind: "text", text: props.frontmatter["summary"] }];
        }
    } else {
        shortSummary = props.comment?.getShortSummary(context.options.getValue("useFirstParagraphOfCommentAsSummary"));
    }

    if (!shortSummary?.length && props.isDeclaration() && props.signatures?.length) {
        return commentShortSummary(context, props.signatures[0]);
    }

    if (!shortSummary?.some((part) => part.text)) return;

    return context.displayParts(shortSummary);
}

export function commentSummary(context: DefaultThemeRenderContext, props: Reflection) {
    if (props.comment?.summary.some((part) => part.text)) {
        return context.displayParts(props.comment.summary);
    }

    const target =
        (props.isDeclaration() || props.isParameter()) && props.type?.type === "reference"
            ? props.type.reflection
            : undefined;

    if (target?.comment?.hasModifier("@expand") && target?.comment?.summary.some((part) => part.text)) {
        return context.displayParts(target.comment.summary);
    }
}

export function commentTags(context: DefaultThemeRenderContext, props: Reflection) {
    if (!props.comment) return;

    const skipSave = props.comment.blockTags.map((tag) => tag.skipRendering);

    const skippedTags = context.options.getValue("notRenderedTags");
    const beforeTags = context.hook("comment.beforeTags", context, props.comment, props);
    const afterTags = context.hook("comment.afterTags", context, props.comment, props);

    const tags = props.kindOf(ReflectionKind.SomeSignature)
        ? props.comment.blockTags.filter(
              (tag) => tag.tag !== "@returns" && !tag.skipRendering && !skippedTags.includes(tag.tag),
          )
        : props.comment.blockTags.filter((tag) => !tag.skipRendering && !skippedTags.includes(tag.tag));

    skipSave.forEach((skip, i) => (props.comment!.blockTags[i].skipRendering = skip));

    return (
        <>
            {beforeTags}
            <div class="tsd-comment tsd-typography">
                {tags.map((item) => {
                    const name = item.name
                        ? `${context.internationalization.translateTagName(item.tag)}: ${item.name}`
                        : context.internationalization.translateTagName(item.tag);

                    const anchor = context.slugger.slug(name);

                    return (
                        <>
                            <div class={`tsd-tag-${item.tag.substring(1)}`}>
                                <h4 class="tsd-anchor-link">
                                    <a id={anchor} class="tsd-anchor"></a>
                                    {name}
                                    {anchorIcon(context, anchor)}
                                </h4>
                                <Raw html={context.markdown(item.content)} />
                            </div>
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
