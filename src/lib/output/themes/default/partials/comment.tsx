import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { assertNever, JSX, Raw } from "../../../../utils";
import type { CommentDisplayPart, Reflection } from "../../../../models";

function humanize(text: string) {
    return text.substring(1, 2).toUpperCase() + text.substring(2).replace(/[a-z][A-Z]/g, (x) => `${x[0]} ${x[1]}`);
}

function displayPartsToMarkdown(parts: CommentDisplayPart[], urlTo: DefaultThemeRenderContext["urlTo"]) {
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
                    case "@inheritdoc": // Shouldn't happen
                        break; // Not rendered.
                    case "@link":
                    case "@linkcode":
                    case "@linkplain": {
                        if (part.target) {
                            const url = typeof part.target === "string" ? part.target : urlTo(part.target);
                            const wrap = part.tag === "@linkcode" ? "`" : "";
                            result.push(url ? `[${wrap}${part.text}${wrap}](${url})` : part.text);
                        } else {
                            result.push(part.text);
                        }
                        break;
                    }
                    default:
                        // Hmm... probably want to be able to render these somehow, so custom inline tags can be given
                        // special rendering rules. Future capability. For now, just render their text.
                        result.push(`{${part.tag} ${part.text}}`);
                        break;
                }
                break;
            default:
                assertNever(part);
        }
    }

    return result.join("");
}

export function comment({ markdown, urlTo }: DefaultThemeRenderContext, props: Reflection) {
    if (!props.comment?.hasVisibleComponent()) return;

    // Note: Comment modifiers are handled in `renderFlags`

    return (
        <div class="tsd-comment tsd-typography">
            <Raw html={markdown(displayPartsToMarkdown(props.comment.summary, urlTo))} />
            {props.comment.blockTags.map((item) => (
                <>
                    <h3>{humanize(item.tag)}</h3>
                    <Raw html={markdown(displayPartsToMarkdown(item.content, urlTo))} />
                </>
            ))}
        </div>
    );
}
