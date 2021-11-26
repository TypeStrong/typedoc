import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { assertNever, JSX, Raw } from "../../../../utils";
import type { CommentDisplayPart, Reflection } from "../../../../models";

function humanize(text: string) {
    return text.substring(1, 2).toUpperCase() + text.substring(2).replace(/[a-z][A-Z]/g, (x) => `${x[0]} ${x[1]}`);
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
                switch (part.tag) {
                    case "@label":
                        break; // Not rendered.
                    case "@link":
                        // GERRIT RENDER ME PROPERLY
                        return part.text;
                    default:
                    // Hmm... probably want to be able to render these somehow, so custom inline tags can be given
                    // special rendering rules. Future capability. For now, do nothing.
                }
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
