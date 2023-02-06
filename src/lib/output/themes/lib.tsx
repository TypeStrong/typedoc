import {
    Comment,
    CommentDisplayPart,
    DeclarationReflection,
    Reflection,
    ReflectionFlags,
    SignatureReflection,
    TypeParameterReflection,
} from "../../models";
import { assertNever, JSX } from "../../utils";
import type { DefaultThemeRenderContext } from "./default/DefaultThemeRenderContext";

export function stringify(data: unknown) {
    if (typeof data === "bigint") {
        return data.toString() + "n";
    }
    return JSON.stringify(data);
}

/**
 * Insert word break tags ``<wbr>`` into the given string.
 *
 * Breaks the given string at ``_``, ``-`` and capital letters.
 *
 * @param str The string that should be split.
 * @return The original string containing ``<wbr>`` tags where possible.
 */
export function wbr(str: string): (string | JSX.Element)[] {
    // TODO surely there is a better way to do this, but I'm tired.
    const ret: (string | JSX.Element)[] = [];
    const re = /[\s\S]*?(?:[^_-][_-](?=[^_-])|[^A-Z](?=[A-Z][^A-Z]))/g;
    let match: RegExpExecArray | null;
    let i = 0;
    while ((match = re.exec(str))) {
        ret.push(match[0], <wbr />);
        i += match[0].length;
    }
    ret.push(str.slice(i));

    return ret;
}

export function join<T>(joiner: JSX.Children, list: readonly T[], cb: (x: T) => JSX.Children) {
    const result: JSX.Children = [];

    for (const item of list) {
        if (result.length > 0) {
            result.push(joiner);
        }
        result.push(cb(item));
    }

    return <>{result}</>;
}

export function renderFlags(flags: ReflectionFlags, comment: Comment | undefined) {
    const allFlags = [...flags];
    if (comment) {
        allFlags.push(...Array.from(comment.modifierTags, (tag) => tag.replace(/@([a-z])/, (x) => x[1].toUpperCase())));
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

export function classNames(names: Record<string, boolean | null | undefined>, extraCss?: string) {
    const css = Object.keys(names)
        .filter((key) => names[key])
        .concat(extraCss || "")
        .join(" ")
        .trim()
        .replace(/\s+/g, " ");
    return css.length ? css : undefined;
}

export function hasTypeParameters(
    reflection: Reflection
): reflection is Reflection & { typeParameters: TypeParameterReflection[] } {
    return (
        (reflection instanceof DeclarationReflection || reflection instanceof SignatureReflection) &&
        reflection.typeParameters != null &&
        reflection.typeParameters.length > 0
    );
}

export function renderTypeParametersSignature(
    typeParameters: readonly TypeParameterReflection[] | undefined
): JSX.Element {
    return (
        <>
            {!!typeParameters && typeParameters.length > 0 && (
                <>
                    <span class="tsd-signature-symbol">{"<"}</span>
                    {join(<span class="tsd-signature-symbol">{", "}</span>, typeParameters, (item) => (
                        <>
                            {item.varianceModifier ? `${item.varianceModifier} ` : ""}
                            <span class="tsd-signature-type" data-tsd-kind={item.kindString}>
                                {item.name}
                            </span>
                        </>
                    ))}
                    <span class="tsd-signature-symbol">{">"}</span>
                </>
            )}
        </>
    );
}

export function camelToTitleCase(text: string) {
    return text.substring(0, 1).toUpperCase() + text.substring(1).replace(/[a-z][A-Z]/g, (x) => `${x[0]} ${x[1]}`);
}

export function displayPartsToMarkdown(
    parts: readonly CommentDisplayPart[],
    urlTo: DefaultThemeRenderContext["urlTo"]
) {
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
                            const text = part.tag === "@linkcode" ? `<code>${part.text}</code>` : part.text;
                            result.push(url ? `<a href="${url}">${text}</a>` : part.text);
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

/**
 * Renders the reflection name with an additional `?` if optional.
 */
export function renderName(refl: Reflection) {
    if (!refl.name) {
        return <em>{wbr(refl.kindString!)}</em>;
    }

    if (refl.flags.isOptional) {
        return <>{wbr(refl.name)}?</>;
    }

    return wbr(refl.name);
}
