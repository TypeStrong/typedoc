import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX, Raw } from "../../../../utils";
import type { Reflection } from "../../../../models";
import { camelToTitleCase } from "../../lib";

export function comment({ markdown }: DefaultThemeRenderContext, props: Reflection) {
    if (!props.comment?.hasVisibleComponent()) return;

    // Note: Comment modifiers are handled in `renderFlags`

    return (
        <div class="tsd-comment tsd-typography">
            <Raw html={markdown(props.comment.summary)} />
            {props.comment.blockTags.map((item) => (
                <>
                    <h3>{camelToTitleCase(item.tag.substring(1))}</h3>
                    <Raw html={markdown(item.content)} />
                </>
            ))}
        </div>
    );
}
