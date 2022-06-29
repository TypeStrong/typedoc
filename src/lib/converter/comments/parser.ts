import { ok } from "assert";
import type { CommentParserConfig } from ".";
import { Comment, CommentDisplayPart, CommentTag } from "../../models";
import { assertNever, removeIf } from "../../utils";
import { Token, TokenSyntaxKind } from "./lexer";

interface LookaheadGenerator<T> {
    done(): boolean;
    peek(): T;
    take(): T;
}

function makeLookaheadGenerator<T>(
    gen: Generator<T, void>
): LookaheadGenerator<T> {
    let nextItem = gen.next();

    return {
        done() {
            return !!nextItem.done;
        },
        peek() {
            ok(!nextItem.done);
            return nextItem.value;
        },
        take() {
            const thisItem = nextItem;
            ok(!thisItem.done);
            nextItem = gen.next();
            return thisItem.value;
        },
    };
}

export function parseComment(
    tokens: Generator<Token, undefined, undefined>,
    config: CommentParserConfig,
    warning: (message: string) => void
): Comment {
    const lexer = makeLookaheadGenerator(tokens);

    const comment = new Comment();
    comment.summary = blockContent(comment, lexer, config, warning);

    while (!lexer.done()) {
        comment.blockTags.push(blockTag(comment, lexer, config, warning));
    }

    postProcessComment(comment, warning);

    return comment;
}

const HAS_USER_IDENTIFIER: `@${string}`[] = [
    "@callback",
    "@param",
    "@prop",
    "@property",
    "@template",
    "@typedef",
    "@typeParam",
    "@inheritDoc",
];

function makeCodeBlock(text: string) {
    return "```ts\n" + text + "\n```";
}

/**
 * Loop over comment, produce lint warnings, and set tag names for tags
 * which have them.
 */
function postProcessComment(comment: Comment, warning: (msg: string) => void) {
    for (const tag of comment.blockTags) {
        if (HAS_USER_IDENTIFIER.includes(tag.tag) && tag.content.length) {
            const first = tag.content[0];
            if (first.kind === "text") {
                let end = first.text.search(/\s/);
                if (end === -1) end = first.text.length;

                tag.name = first.text.substring(0, end);
                if (tag.name.startsWith("[") && tag.name.endsWith("]")) {
                    tag.name = tag.name.slice(1, tag.name.indexOf("="));
                }

                first.text = first.text.substring(end);
                const endOfTrivia = first.text.search(/[^\-\s]/);
                if (endOfTrivia !== -1) {
                    first.text = first.text.substring(endOfTrivia);
                } else {
                    // Remove this token, no real text in it.
                    tag.content.shift();
                }
            }
        }

        if (
            tag.content.some(
                (part) =>
                    part.kind === "inline-tag" && part.tag === "@inheritDoc"
            )
        ) {
            warning(
                "An inline @inheritDoc tag should not appear within a block tag as it will not be processed"
            );
        }

        if (
            tag.tag === "@example" &&
            !tag.content.some((part) => part.kind === "code")
        ) {
            const caption = tag.content[0]?.text.match(
                /^\s*<caption>(.*?)<\/caption>\s*(\n|$)/
            );
            if (caption) {
                const code = Comment.combineDisplayParts([
                    {
                        kind: "text",
                        text: tag.content[0].text.slice(caption[0].length),
                    },
                    ...tag.content.slice(1),
                ]);
                tag.content = [
                    {
                        kind: "text",
                        text: caption[1] + "\n",
                    },
                    {
                        kind: "code",
                        text: makeCodeBlock(code),
                    },
                ];
            } else {
                tag.content = [
                    {
                        kind: "code",
                        text: makeCodeBlock(
                            Comment.combineDisplayParts(tag.content)
                        ),
                    },
                ];
            }
        }
    }

    const remarks = comment.blockTags.filter((tag) => tag.tag === "@remarks");
    if (remarks.length > 1) {
        warning(
            "At most one @remarks tag is expected in a comment, ignoring all but the first"
        );
        removeIf(comment.blockTags, (tag) => remarks.indexOf(tag) > 0);
    }

    const inheritDoc = comment.blockTags.filter(
        (tag) => tag.tag === "@inheritDoc"
    );
    const inlineInheritDoc = comment.summary.filter(
        (part) => part.kind === "inline-tag" && part.tag === "@inheritDoc"
    );

    if (inlineInheritDoc.length + inheritDoc.length > 1) {
        warning(
            "At most one @inheritDoc tag is expected in a comment, ignoring all but the first"
        );
        const allInheritTags = [...inlineInheritDoc, ...inheritDoc];
        removeIf(comment.summary, (part) => allInheritTags.indexOf(part) > 0);
        removeIf(comment.blockTags, (tag) => allInheritTags.indexOf(tag) > 0);
    }

    if (
        (inlineInheritDoc.length || inheritDoc.length) &&
        comment.summary.some(
            (part) => part.kind !== "inline-tag" && /\S/.test(part.text)
        )
    ) {
        warning(
            "Content in the summary section will be overwritten by the @inheritDoc tag"
        );
    }

    if ((inlineInheritDoc.length || inheritDoc.length) && remarks.length) {
        warning(
            "Content in the @remarks block will be overwritten by the @inheritDoc tag"
        );
    }
}

const aliasedTags = new Map([["@return", "@returns"]]);

function blockTag(
    comment: Comment,
    lexer: LookaheadGenerator<Token>,
    config: CommentParserConfig,
    warning: (msg: string) => void
): CommentTag {
    const blockTag = lexer.take();
    ok(blockTag.kind === TokenSyntaxKind.Tag); // blockContent is broken if this fails.

    const tagName = aliasedTags.get(blockTag.text) || blockTag.text;

    return new CommentTag(
        tagName as `@${string}`,
        blockContent(comment, lexer, config, warning)
    );
}

function blockContent(
    comment: Comment,
    lexer: LookaheadGenerator<Token>,
    config: CommentParserConfig,
    warning: (msg: string) => void
): CommentDisplayPart[] {
    const content: CommentDisplayPart[] = [];
    let atNewLine = true;

    loop: while (!lexer.done()) {
        const next = lexer.peek();
        let consume = true;

        switch (next.kind) {
            case TokenSyntaxKind.NewLine:
            case TokenSyntaxKind.Text:
                content.push({ kind: "text", text: next.text });
                break;

            case TokenSyntaxKind.Code:
                content.push({ kind: "code", text: next.text });
                break;

            case TokenSyntaxKind.Tag:
                if (next.text === "@inheritdoc") {
                    warning(
                        "The @inheritDoc tag should be properly capitalized"
                    );
                    next.text = "@inheritDoc";
                }
                if (config.modifierTags.has(next.text)) {
                    comment.modifierTags.add(next.text);
                    break;
                } else if (!atNewLine && !config.blockTags.has(next.text)) {
                    // Treat unknown tag as a modifier, but warn about it.
                    comment.modifierTags.add(next.text);
                    warning(
                        `Treating unrecognized tag "${next.text}" as a modifier tag`
                    );
                    break;
                } else {
                    // Block tag or unknown tag, handled by our caller.
                    break loop;
                }

            case TokenSyntaxKind.TypeAnnotation:
                // We always ignore these. In TS files they are redundant, in JS files
                // they are required.
                break;

            case TokenSyntaxKind.CloseBrace:
                // Unmatched closing brace, generate a warning, and treat it as text.
                warning(`Unmatched closing brace`);
                content.push({ kind: "text", text: next.text });
                break;

            case TokenSyntaxKind.OpenBrace:
                inlineTag(lexer, content, config, warning);
                consume = false;
                break;

            default:
                assertNever(next.kind);
        }

        if (consume && lexer.take().kind === TokenSyntaxKind.NewLine) {
            atNewLine = true;
        }
    }

    // Collapse adjacent text parts
    for (let i = 0; i < content.length - 1 /* inside loop */; ) {
        if (content[i].kind === "text" && content[i + 1].kind === "text") {
            content[i].text += content[i + 1].text;
            content.splice(i + 1, 1);
        } else {
            i++;
        }
    }

    // Now get rid of extra whitespace, and any empty parts
    for (let i = 0; i < content.length /* inside loop */; ) {
        if (i === 0 || content[i].kind === "inline-tag") {
            content[i].text = content[i].text.trimStart();
        }
        if (i === content.length - 1 || content[i].kind === "inline-tag") {
            content[i].text = content[i].text.trimEnd();
        }

        if (!content[i].text && content[i].kind === "text") {
            content.splice(i, 1);
        } else {
            i++;
        }
    }

    return content;
}

function inlineTag(
    lexer: LookaheadGenerator<Token>,
    block: CommentDisplayPart[],
    config: CommentParserConfig,
    warning: (msg: string) => void
) {
    const openBrace = lexer.take();

    // Now skip whitespace to grab the tag name.
    // If the first non-whitespace text after the brace isn't a tag,
    // then produce a warning and treat what we've consumed as plain text.
    if (
        lexer.done() ||
        ![TokenSyntaxKind.Text, TokenSyntaxKind.Tag].includes(lexer.peek().kind)
    ) {
        warning("Encountered an unescaped open brace without an inline tag");
        block.push({ kind: "text", text: openBrace.text });
        return;
    }

    let tagName = lexer.take();

    if (
        lexer.done() ||
        (tagName.kind === TokenSyntaxKind.Text &&
            (!/^\s+$/.test(tagName.text) ||
                lexer.peek().kind != TokenSyntaxKind.Tag))
    ) {
        warning("Encountered an unescaped open brace without an inline tag");
        block.push({ kind: "text", text: openBrace.text + tagName.text });
        return;
    }

    if (tagName.kind !== TokenSyntaxKind.Tag) {
        tagName = lexer.take();
    }

    if (!config.inlineTags.has(tagName.text)) {
        warning(`Encountered an unknown inline tag "${tagName.text}"`);
    }

    const content: string[] = [];

    // At this point, we know we have an inline tag. Treat everything following as plain text,
    // until we get to the closing brace.
    while (!lexer.done() && lexer.peek().kind !== TokenSyntaxKind.CloseBrace) {
        const token = lexer.take();
        if (token.kind === TokenSyntaxKind.OpenBrace) {
            warning(
                "Encountered an open brace within an inline tag, this is likely a mistake"
            );
        }

        content.push(token.kind === TokenSyntaxKind.NewLine ? " " : token.text);
    }

    if (lexer.done()) {
        warning("Inline tag is not closed");
    } else {
        lexer.take(); // Close brace
    }

    block.push({
        kind: "inline-tag",
        tag: tagName.text as `@${string}`,
        text: content.join(""),
    });
}
