import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { assertNever, JSX, Raw } from "../../../../utils";
import type { CommentDisplayPart, Reflection } from "../../../../models";

function humanize(text: string) {
    return text.substr(1, 1).toUpperCase() + text.substr(2).replace(/[a-z][A-Z]/g, (x) => `${x[0]} ${x[1]}`);
}

function displayPartsToMarkdown(parts: CommentDisplayPart[]) {
    const result: string[] = [];

    for (const part of parts) {
        switch (part.kind) {
            case "text":
            case "code":
                result.push(part.text);
                break;
            case "inline-tag":
                // TODO GERRIT
                break;
            default:
                assertNever(part);
        }
    }

    return result.join("");
}

export function comment({ markdown }: DefaultThemeRenderContext, props: Reflection) {
    if (!props.comment?.hasVisibleComponent()) return;

    return (
        <div class="tsd-comment tsd-typography">
            <Raw html={markdown(displayPartsToMarkdown(props.comment.summary))} />
            {props.comment.blockTags?.length > 0 && (
                <dl class="tsd-comment-tags">
                    {props.comment.blockTags.map((item) => (
                        <>
                            <h3>{humanize(item.tag)}</h3>
                            <Raw html={markdown(displayPartsToMarkdown(item.content))} />
                        </>
                    ))}
                </dl>
            )}
        </div>
    );
}
