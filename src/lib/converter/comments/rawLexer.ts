import { type Token, TokenSyntaxKind } from "./lexer";

/**
 * Note: This lexer intentionally *only* recognizes inline tags and code blocks.
 * This is because it is intended for use on markdown documents, and we shouldn't
 * take some stray `@user` mention within a "Thanks" section of someone's changelog
 * as starting a block!
 */
export function* lexCommentString(
    file: string,
): Generator<Token, undefined, undefined> {
    // Wrapper around our real lex function to collapse adjacent text tokens.
    let textToken: Token | undefined;
    for (const token of lexCommentString2(file)) {
        if (
            token.kind === TokenSyntaxKind.Text ||
            token.kind === TokenSyntaxKind.NewLine
        ) {
            if (textToken) {
                textToken.text += token.text;
            } else {
                token.kind = TokenSyntaxKind.Text;
                textToken = token;
            }
        } else {
            if (textToken) {
                yield textToken;
                textToken = void 0;
            }
            yield token;
        }
    }

    if (textToken) {
        yield textToken;
    }
    return;
}

function* lexCommentString2(
    file: string,
): Generator<Token, undefined, undefined> {
    let pos = 0;
    let end = file.length;

    // Skip leading whitespace
    while (pos < end && /\s/.test(file[pos])) {
        pos++;
    }

    // Trailing whitespace
    while (pos < end && /\s/.test(file[end - 1])) {
        end--;
    }

    let lineStart = true;
    let expectingTag = false;

    for (;;) {
        if (pos >= end) {
            return;
        }

        if (lineStart) {
            lineStart = false;
        }

        switch (file[pos]) {
            case "\n":
                yield makeToken(TokenSyntaxKind.NewLine, 1);
                lineStart = true;
                expectingTag = false;
                break;

            case "{":
                yield makeToken(TokenSyntaxKind.OpenBrace, 1);
                expectingTag = true;
                break;

            case "}":
                yield makeToken(TokenSyntaxKind.CloseBrace, 1);
                expectingTag = false;
                break;

            case "`": {
                // Markdown's code rules are a royal pain. This could be one of several things.
                // 1. Inline code: <1-n ticks><text><same number of ticks>
                // 2. Code block: <3 ticks><language, no ticks>\n<text>\n<3 ticks>\n
                // 3. Unmatched tick(s), not code, but part of some text.
                // We don't quite handle #2 correctly yet. PR welcome!
                let tickCount = 1;
                let lookahead = pos;

                while (lookahead + 1 < end && file[lookahead + 1] === "`") {
                    tickCount++;
                    lookahead++;
                }
                let lookaheadStart = pos;
                const codeText: string[] = [];

                lookahead++;
                while (lookahead < end) {
                    if (lookaheadExactlyNTicks(lookahead, tickCount)) {
                        lookahead += tickCount;
                        codeText.push(
                            file.substring(lookaheadStart, lookahead),
                        );
                        yield {
                            kind: TokenSyntaxKind.Code,
                            text: codeText.join(""),
                            pos,
                        };
                        expectingTag = false;
                        pos = lookahead;
                        break;
                    } else if (file[lookahead] === "`") {
                        while (lookahead < end && file[lookahead] === "`") {
                            lookahead++;
                        }
                    } else if (
                        file[lookahead] === "\\" &&
                        lookahead + 1 < end &&
                        file[lookahead + 1] !== "\n"
                    ) {
                        lookahead += 2;
                    } else if (file[lookahead] === "\n") {
                        lookahead++;
                        codeText.push(
                            file.substring(lookaheadStart, lookahead),
                        );
                        lookaheadStart = lookahead;
                    } else {
                        lookahead++;
                    }
                }

                if (lookahead >= end && pos !== lookahead) {
                    if (
                        tickCount === 3 &&
                        file.substring(pos, end).includes("\n")
                    ) {
                        codeText.push(file.substring(lookaheadStart, end));
                        yield {
                            kind: TokenSyntaxKind.Code,
                            text: codeText.join(""),
                            pos,
                        };
                        expectingTag = false;
                        pos = lookahead;
                    } else {
                        yield makeToken(TokenSyntaxKind.Text, tickCount);
                        expectingTag = false;
                    }
                }

                break;
            }

            case "@": {
                let lookahead = pos + 1;
                while (lookahead < end && /[a-z]/i.test(file[lookahead])) {
                    lookahead++;
                }

                if (lookahead !== pos + 1) {
                    while (
                        lookahead < end &&
                        /[a-z0-9]/i.test(file[lookahead])
                    ) {
                        lookahead++;
                    }
                }

                if (
                    expectingTag &&
                    lookahead !== pos + 1 &&
                    (lookahead === end || /[\s}]/.test(file[lookahead]))
                ) {
                    yield makeToken(TokenSyntaxKind.Tag, lookahead - pos);
                    break;
                }
            }
            // fall through if we didn't find something that looks like a tag

            default: {
                const textParts: string[] = [];

                let lookaheadStart = pos;
                let lookahead = pos;
                while (lookahead < end) {
                    if ("{}\n`".includes(file[lookahead])) break;

                    if (
                        lookahead !== pos &&
                        file[lookahead] === "@" &&
                        /\s/.test(file[lookahead - 1])
                    ) {
                        // Probably the start of a modifier tag
                        break;
                    }

                    if (
                        file[lookahead] === "\\" &&
                        lookahead + 1 < end &&
                        "{}@`".includes(file[lookahead + 1])
                    ) {
                        textParts.push(
                            file.substring(lookaheadStart, lookahead),
                            file[lookahead + 1],
                        );
                        lookahead++;
                        lookaheadStart = lookahead + 1;
                    }

                    lookahead++;
                }

                textParts.push(file.substring(lookaheadStart, lookahead));

                if (textParts.some((part) => /\S/.test(part))) {
                    expectingTag = false;
                }

                // This piece of text had line continuations or escaped text
                yield {
                    kind: TokenSyntaxKind.Text,
                    text: textParts.join(""),
                    pos,
                };
                pos = lookahead;
                break;
            }
        }
    }

    function makeToken(kind: TokenSyntaxKind, size: number): Token {
        const start = pos;
        pos += size;

        return {
            kind,
            text: file.substring(start, pos),
            pos: start,
        };
    }

    function lookaheadExactlyNTicks(pos: number, n: number) {
        if (pos + n > end) {
            return false;
        }

        return file.startsWith("`".repeat(n), pos) && file[pos + n] !== "`";
    }
}
