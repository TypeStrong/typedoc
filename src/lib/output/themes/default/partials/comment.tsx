import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX, Raw } from "../../../../utils";
import type { Reflection } from "../../../../models";
import { camelToTitleCase, displayPartsToMarkdown } from "../../lib";

export function comment({ markdown, urlTo }: DefaultThemeRenderContext, props: Reflection) {
    if (!props.comment?.hasVisibleComponent()) return;

    // Note: Comment modifiers are handled in `renderFlags`

    return (
        <div class="tsd-comment tsd-typography">
            <Raw html={markdown(displayPartsToMarkdown(props.comment.summary, urlTo))} />
            {props.comment.blockTags.map((item) => (
                <>
                    <h3>{camelToTitleCase(item.tag.substring(1))}</h3>
                    <Raw html={markdown(displayPartsToMarkdown(item.content, urlTo))} />
                </>
            ))}
        </div>
    );
}
