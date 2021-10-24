import { ok } from "assert";
import * as ts from "typescript";
import {
    Comment,
    CommentTag,
    CommentDisplayPart,
    ReflectionKind,
} from "../../models";
import { assertNever, Logger } from "../../utils";
import { lexBlockComment, Token, TokenSyntaxKind } from "./blockLexer";
import { discoverComment } from "./discovery";

export interface CommentParserConfig {
    blockTags: Set<string>;
    inlineTags: Set<string>;
    modifierTags: Set<string>;
}

export function getComment(
    symbol: ts.Symbol,
    kind: ReflectionKind,
    config: CommentParserConfig,
    logger: Logger
): Comment | undefined {
    const comment = discoverComment(symbol, kind);
    if (comment) {
        const [file, range] = comment;
        const { line } = ts.getLineAndCharacterOfPosition(file, range.pos);
        const warning = (warning: string) =>
            logger.warn(`${warning} in comment at ${file.fileName}:${line}.`);

        switch (range.kind) {
            case ts.SyntaxKind.MultiLineCommentTrivia:
                return parseComment(
                    lexBlockComment(file.text, range.pos, range.end),
                    config,
                    warning
                );
            case ts.SyntaxKind.SingleLineCommentTrivia:
                throw "GERRIT FIX ME";
            default:
                assertNever(range.kind);
        }
    }
}

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

function parseComment(
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

    return comment;
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

    const tag = new CommentTag(
        tagName,
        blockContent(comment, lexer, config, warning)
    );

    if (
        tagName === "@param" &&
        tag.content.length &&
        tag.content[0].kind === "text"
    ) {
        const firstPart = tag.content[0];
        const match = firstPart.text.match(/^([a-z_$]+)\s*(-\s*)?/);
        if (match) {
            tag.paramName = match[1];
            firstPart.text = firstPart.text.substr(match[0].length);
        }
    }

    return tag;
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

        switch (next.kind) {
            case TokenSyntaxKind.NewLine:
            case TokenSyntaxKind.Text:
                content.push({ kind: "text", text: next.text });
                break;

            case TokenSyntaxKind.Code:
                content.push({ kind: "code", text: next.text });
                break;

            case TokenSyntaxKind.Tag:
                if (config.modifierTags.has(next.text)) {
                    comment.modifierTags.add(next.text);
                    break;
                } else if (!atNewLine && !config.blockTags.has(next.text)) {
                    // Treat unknown tag as a modifier, bug warn about it.
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
                warning(`Unmatched closing brace in comment`);
                content.push({ kind: "code", text: next.text });
                break;

            case TokenSyntaxKind.OpenBrace:
                inlineTag(lexer, content, config, warning);
                break;

            default:
                assertNever(next.kind);
        }

        if (lexer.take().kind === TokenSyntaxKind.NewLine) {
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
        block.push({ kind: "text", text: openBrace.text });
        block.push({ kind: "text", text: tagName.text });
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
        tag: tagName.text,
        text: content.join(""),
    });
}
