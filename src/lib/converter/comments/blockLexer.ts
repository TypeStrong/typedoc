import { Token, TokenSyntaxKind } from "./lexer";

export function* lexBlockComment(
    file: string,
    pos = 0,
    end = file.length
): Generator<Token, undefined, undefined> {
    // Wrapper around our real lex function to collapse adjacent text tokens.
    let textToken: Token | undefined;
    for (const token of lexBlockComment2(file, pos, end)) {
        if (token.kind === TokenSyntaxKind.Text) {
            if (textToken) {
                textToken.text += token.text;
            } else {
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

function* lexBlockComment2(
    file: string,
    pos: number,
    end: number
): Generator<Token, undefined, undefined> {
    pos += 2; // Leading '/*'
    end -= 2; // Trailing '*/'

    if (pos < end && file[pos] === "*") {
        // Might start with '/**'
        pos++;
    }

    // Before skipping whitespace, figure out the comment indent size
    const [commentHasStars, indent] = discoverIndent(file, pos, end);

    // Skip leading whitespace
    while (pos < end && /\s/.test(file[pos])) {
        pos++;
    }

    // Trailing whitespace
    while (pos < end && /\s/.test(file[end - 1])) {
        end--;
    }

    let lineStart = true;
    let braceStartsType = false;

    for (;;) {
        if (pos >= end) {
            return;
        }

        if (lineStart) {
            pos = skipIndent(pos);
            if (commentHasStars && file[pos] === "*") {
                pos++;
                if (file[pos] === " ") {
                    pos++;
                }
            }
            lineStart = false;
        }

        switch (file[pos]) {
            case "\n":
                yield makeToken(TokenSyntaxKind.NewLine, 1);
                lineStart = true;
                break;

            case "{":
                if (braceStartsType && nextNonWs(pos + 1) !== "@") {
                    yield makeToken(
                        TokenSyntaxKind.TypeAnnotation,
                        findEndOfType(pos) - pos
                    );
                    braceStartsType = false;
                } else {
                    yield makeToken(TokenSyntaxKind.OpenBrace, 1);
                }
                break;

            case "}":
                yield makeToken(TokenSyntaxKind.CloseBrace, 1);
                braceStartsType = false;
                break;

            case "`": {
                // Markdown's code rules are a royal pain. This could be one of several things.
                // 1. Inline code: <1-n ticks><text><same number of ticks>
                // 2. Code block: <3 ticks><language, no ticks>\n<text>\n<3 ticks>\n
                // 3. Unmatched tick(s), not code, but part of some text.
                // We don't quite handle #2 correctly yet. PR welcome!
                braceStartsType = false;
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
                            file.substring(lookaheadStart, lookahead)
                        );
                        yield {
                            kind: TokenSyntaxKind.Code,
                            text: codeText.join(""),
                        };
                        pos = lookahead;
                        break;
                    } else if (file[lookahead] === "`") {
                        while (lookahead < end && file[lookahead] === "`") {
                            lookahead++;
                        }
                    } else if (
                        file[lookahead] === "\\" &&
                        lookahead + 1 < end &&
                        file[lookahead + 1] === "/"
                    ) {
                        codeText.push(
                            file.substring(lookaheadStart, lookahead)
                        );
                        lookaheadStart = lookahead + 1;
                        lookahead += 2;
                    } else if (
                        file[lookahead] === "\\" &&
                        lookahead + 1 < end &&
                        file[lookahead + 1] !== "\n"
                    ) {
                        lookahead += 2;
                    } else if (file[lookahead] === "\n") {
                        lookahead++;
                        codeText.push(
                            file.substring(lookaheadStart, lookahead)
                        );
                        lookahead = skipIndent(lookahead);
                        if (commentHasStars && file[lookahead] === "*") {
                            lookahead++;
                            if (file[lookahead] === " ") {
                                lookahead++;
                            }
                        }
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
                        };
                        pos = lookahead;
                    } else {
                        yield makeToken(TokenSyntaxKind.Text, tickCount);
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

                if (lookahead !== pos + 1) {
                    braceStartsType = true;
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
                        "{}@/`".includes(file[lookahead + 1])
                    ) {
                        textParts.push(
                            file.substring(lookaheadStart, lookahead),
                            file[lookahead + 1]
                        );
                        lookahead++;
                        lookaheadStart = lookahead + 1;
                    }

                    lookahead++;
                }

                textParts.push(file.substring(lookaheadStart, lookahead));

                if (textParts.some((part) => /\S/.test(part))) {
                    braceStartsType = false;
                }

                pos = lookahead;
                // This piece of text had line continuations or escaped text
                yield {
                    kind: TokenSyntaxKind.Text,
                    text: textParts.join(""),
                };
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
        };
    }

    function skipIndent(pos: number) {
        let taken = indent;
        let lookahead = pos;
        while (
            taken > 0 &&
            lookahead < end &&
            file[lookahead] !== "\n" &&
            /\s/.test(file[lookahead])
        ) {
            taken--;
            lookahead++;
        }
        return lookahead;
    }

    function lookaheadExactlyNTicks(pos: number, n: number) {
        if (pos + n > end) {
            return false;
        }

        return file.startsWith("`".repeat(n), pos) && file[pos + n] !== "`";
    }

    function findEndOfType(pos: number): number {
        let openBraces = 0;

        while (pos < end) {
            if (file[pos] === "{") {
                openBraces++;
            } else if (file[pos] === "}") {
                if (--openBraces === 0) {
                    break;
                }
            } else if ("`'\"".includes(file[pos])) {
                pos = findEndOfString(pos);
            }

            pos++;
        }

        if (pos < end && file[pos] === "}") {
            pos++;
        }

        return pos;
    }

    function findEndOfString(pos: number): number {
        const endOfString = file[pos];
        pos++;
        while (pos < end) {
            if (file[pos] === endOfString) {
                break;
            } else if (file[pos] === "\\") {
                pos++; // Skip escaped character
            } else if (
                endOfString === "`" &&
                file[pos] === "$" &&
                file[pos + 1] === "{"
            ) {
                // Template literal with data inside a ${}
                while (pos < end && file[pos] !== "}") {
                    if ("`'\"".includes(file[pos])) {
                        pos = findEndOfString(pos) + 1;
                    } else {
                        pos++;
                    }
                }
            }

            pos++;
        }

        return pos;
    }

    function nextNonWs(pos: number): string | undefined {
        while (pos < end && /\s/.test(file[pos])) {
            pos++;
        }
        return file[pos];
    }
}

function discoverIndent(
    file: string,
    pos: number,
    end: number
): [boolean, number] {
    let indent = 0;

    while (pos < end && file[pos] !== "\n") {
        pos++;
    }

    outer: while (pos < end) {
        pos++;
        const lineStart = pos;
        while (pos < end && file[pos] !== "\n") {
            if (/\S/.test(file[pos])) {
                indent = pos - lineStart;
                break outer;
            }
            pos++;
        }
    }

    const commentHasStars = pos < end && file[pos] === "*";

    return [commentHasStars, indent];
}
