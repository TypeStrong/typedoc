import { deepStrictEqual as equal } from "assert";
import ts from "typescript";
import type { CommentParserConfig } from "../lib/converter/comments";

import { lexBlockComment } from "../lib/converter/comments/blockLexer";
import { lexLineComments } from "../lib/converter/comments/lineLexer";
import { Token, TokenSyntaxKind } from "../lib/converter/comments/lexer";
import { parseComment } from "../lib/converter/comments/parser";
import { lexCommentString } from "../lib/converter/comments/rawLexer";
import { Comment, CommentTag } from "../lib/models";
import { MinimalSourceFile } from "../lib/utils/minimalSourceFile";
import { TestLogger } from "./TestLogger";

function dedent(text: string) {
    const lines = text.split(/\r?\n/);
    while (lines.length && lines[0].search(/\S/) === -1) {
        lines.shift();
    }
    while (lines.length && lines[lines.length - 1].search(/\S/) === -1) {
        lines.pop();
    }

    const minIndent = lines.reduce(
        (indent, line) =>
            line.length ? Math.min(indent, line.search(/\S/)) : indent,
        Infinity,
    );

    return lines.map((line) => line.substring(minIndent)).join("\n");
}

describe("Dedent test helper", () => {
    it("Works on empty string", () => {
        equal(dedent(""), "");
    });

    it("Works with indented text", () => {
        equal(
            dedent(`
            Text here
        `),
            "Text here",
        );
    });

    it("Works with multiple lines", () => {
        equal(
            dedent(`
            Text here
                More indented
        `),
            "Text here\n    More indented",
        );
    });
});

describe("Block Comment Lexer", () => {
    function lex(text: string): Token[] {
        return Array.from(lexBlockComment(text));
    }

    it("Should handle an empty comment", () => {
        const tokens = lex("/**/");
        equal(tokens, []);

        const tokens2 = lex("/***/");
        equal(tokens2, []);

        const tokens3 = lex("/**  */");
        equal(tokens3, []);
    });

    it("Should handle a trivial comment", () => {
        const tokens = lex("/** Comment */");

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Comment", pos: 4 },
        ]);
    });

    it("Should handle a multiline comment without stars", () => {
        const tokens = lex("/* Comment\nNext line */");

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Comment", pos: 3 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 10 },
            { kind: TokenSyntaxKind.Text, text: "Next line", pos: 11 },
        ]);
    });

    it("Should handle a multiline comment with stars", () => {
        const tokens = lex("/*\n * Comment\n * Next line */");

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Comment", pos: 6 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 13 },
            { kind: TokenSyntaxKind.Text, text: "Next line", pos: 17 },
        ]);
    });

    it("Should handle an indented comment with stars", () => {
        const tokens = lex(`/**
            * Text
            */`);

        equal(tokens, [{ kind: TokenSyntaxKind.Text, text: "Text", pos: 18 }]);
    });

    it("Should handle an indented comment without stars", () => {
        const tokens = lex(`/*
            Text
            */`);

        equal(tokens, [{ kind: TokenSyntaxKind.Text, text: "Text", pos: 15 }]);
    });

    it("Should handle a list within a comment without stars", () => {
        const tokens = lex(
            dedent(`
            /*
             Comment start
              * This is a list item
            */
        `),
        );

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Comment start", pos: 4 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 17 },
            {
                kind: TokenSyntaxKind.Text,
                text: " * This is a list item",
                pos: 19,
            },
        ]);
    });

    it("Should handle higher detected indentation than the rest of the comment", () => {
        const tokens = lex(
            dedent(`
        /*
             A
        B
            */
        `),
        );

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "A", pos: 8 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 9 },
            { kind: TokenSyntaxKind.Text, text: "B", pos: 10 },
        ]);
    });

    it("Should handle a comment with stars missing a space", () => {
        const tokens = lex(
            dedent(`
            /*
             * A
             *B
             */
            `),
        );

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "A", pos: 6 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 7 },
            { kind: TokenSyntaxKind.Text, text: "B", pos: 10 },
        ]);
    });

    it("Should handle braces", () => {
        const tokens = lex("/* {} */");

        equal(tokens, [
            { kind: TokenSyntaxKind.OpenBrace, text: "{", pos: 3 },
            { kind: TokenSyntaxKind.CloseBrace, text: "}", pos: 4 },
        ]);
    });

    it("Should handle escaping braces", () => {
        const tokens = lex("/* \\{\\} */");

        equal(tokens, [{ kind: TokenSyntaxKind.Text, text: "{}", pos: 3 }]);
    });

    it("Should allow escaping slashes", () => {
        const tokens = lex("/* Text *\\/ */");

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Text */", pos: 3 },
        ]);
    });

    it("Should allow escaping slashes in code blocks", () => {
        const tokens = lex(
            dedent(`
            /**
             * \`\`\`ts
             * /* inner block comment *\\/
             * \`\`\`
             */
            `),
        );

        equal(tokens, [
            {
                kind: TokenSyntaxKind.Code,
                text: "```ts\n/* inner block comment */\n```",
                pos: 7,
            },
        ]);
    });

    it("Should pass through unknown escapes", () => {
        const tokens = lex("/* \\\\ \\n */");

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "\\\\ \\n", pos: 3 },
        ]);
    });

    it("Should recognize tags", () => {
        const tokens = lex("/* @tag @a @abc234 */");

        equal(tokens, [
            { kind: TokenSyntaxKind.Tag, text: "@tag", pos: 3 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 7 },
            { kind: TokenSyntaxKind.Tag, text: "@a", pos: 8 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 10 },
            { kind: TokenSyntaxKind.Tag, text: "@abc234", pos: 11 },
        ]);
    });

    it("Should not indiscriminately create tags", () => {
        const tokens = lex("/* @123 @@ @ */");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "@123 @@ @", pos: 3 },
        ]);
    });

    it("Should allow escaping @ to prevent a tag creation", () => {
        const tokens = lex("/* not a \\@tag */");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "not a @tag", pos: 3 },
        ]);
    });

    it("Should not mistake an email for a modifier tag", () => {
        const tokens = lex("/* test@example.com */");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test@example.com", pos: 3 },
        ]);
    });

    it("Should not mistake a scoped package for a tag", () => {
        const tokens = lex("/* @typescript-eslint/parser @jest/globals */");
        equal(tokens, [
            {
                kind: TokenSyntaxKind.Text,
                text: "@typescript-eslint/parser @jest/globals",
                pos: 3,
            },
        ]);
    });

    it("Should allow escaping @ in an email", () => {
        const tokens = lex("/* test\\@example.com */");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test@example.com", pos: 3 },
        ]);
    });

    it("Should allow inline code", () => {
        const tokens = lex("/* test `code` after */");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test ", pos: 3 },
            { kind: TokenSyntaxKind.Code, text: "`code`", pos: 8 },
            { kind: TokenSyntaxKind.Text, text: " after", pos: 14 },
        ]);
    });

    it("Should allow inline code with multiple ticks", () => {
        const tokens = lex("/* test ```not ```` closed``` after */");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test ", pos: 3 },
            {
                kind: TokenSyntaxKind.Code,
                text: "```not ```` closed```",
                pos: 8,
            },
            { kind: TokenSyntaxKind.Text, text: " after", pos: 29 },
        ]);
    });

    it("Should allow escaping ticks", () => {
        const tokens = lex("/* test `\\`` after */");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test ", pos: 3 },
            { kind: TokenSyntaxKind.Code, text: "`\\``", pos: 8 },
            { kind: TokenSyntaxKind.Text, text: " after", pos: 12 },
        ]);
    });

    it("Should handle stars within code", () => {
        const tokens = lex(
            dedent(`
            /**
             * \`\`\`ts
             *   test()
             * \`\`\`
             */`),
        );

        equal(tokens, [
            {
                kind: TokenSyntaxKind.Code,
                text: "```ts\n  test()\n```",
                pos: 7,
            },
        ]);
    });

    it("Should indent code without stars", () => {
        const tokens = lex(
            dedent(`
            /**
            \`\`\`ts
              test()
            \`\`\`
            */`),
        );

        equal(tokens, [
            {
                kind: TokenSyntaxKind.Code,
                text: "```ts\n  test()\n```",
                pos: 4,
            },
        ]);
    });

    it("Should treat unclosed inline code as text", () => {
        const tokens = lex("/* text ` still text */");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "text ` still text", pos: 3 },
        ]);
    });

    it("Should treat unclosed code blocks as code", () => {
        const tokens = lex(
            dedent(`
                /*
                 * Text
                 * \`\`\`ts
                 * foo();
                 */`),
        );
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Text", pos: 6 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 10 },
            { kind: TokenSyntaxKind.Code, text: "```ts\nfoo();", pos: 14 },
        ]);
    });

    it("Should handle tags after unclosed code", () => {
        const tokens = lex(
            dedent(`
                /*
                 * Text
                 * code? \`\` fake
                 * @blockTag text
                 */`),
        );
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Text", pos: 6 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 10 },
            { kind: TokenSyntaxKind.Text, text: "code? `` fake", pos: 14 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 27 },
            { kind: TokenSyntaxKind.Tag, text: "@blockTag", pos: 31 },
            { kind: TokenSyntaxKind.Text, text: " text", pos: 40 },
        ]);
    });

    it("Should handle text on the first line of a comment", () => {
        let tokens = lex(
            dedent(`
                /* Text
                 * Text2
                 */`),
        );
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Text", pos: 3 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 7 },
            { kind: TokenSyntaxKind.Text, text: "Text2", pos: 11 },
        ]);

        tokens = lex(
            dedent(`
                /** Text
                 * Text2
                 */`),
        );
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Text", pos: 4 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 8 },
            { kind: TokenSyntaxKind.Text, text: "Text2", pos: 12 },
        ]);
    });

    it("Should handle a full comment", () => {
        const tokens = lex(
            dedent(`
            /**
             * This is a summary.
             *
             * @remarks
             * Detailed text here with a {@link Inline | inline link}
             *
             * @alpha @beta
             */`),
        );

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "This is a summary.", pos: 7 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 25 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 28 },
            { kind: TokenSyntaxKind.Tag, text: "@remarks", pos: 32 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 40 },
            {
                kind: TokenSyntaxKind.Text,
                text: "Detailed text here with a ",
                pos: 44,
            },
            { kind: TokenSyntaxKind.OpenBrace, text: "{", pos: 70 },
            { kind: TokenSyntaxKind.Tag, text: "@link", pos: 71 },
            {
                kind: TokenSyntaxKind.Text,
                text: " Inline | inline link",
                pos: 76,
            },
            { kind: TokenSyntaxKind.CloseBrace, text: "}", pos: 97 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 98 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 101 },
            { kind: TokenSyntaxKind.Tag, text: "@alpha", pos: 105 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 111 },
            { kind: TokenSyntaxKind.Tag, text: "@beta", pos: 112 },
        ]);
    });

    it("Should handle starred comments without an end tag in code", () => {
        const tokens = lex(
            dedent(`
            /**
             *Text
             *\`\`\`
             *Text
             */`),
        );

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Text", pos: 6 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 10 },
            { kind: TokenSyntaxKind.Code, text: "```\nText", pos: 13 },
        ]);
    });

    it("Should handle type annotations after tags at the start of a line", () => {
        const tokens = lex(
            dedent(`
            /**
             * @param {string} foo
             */`),
        );

        equal(tokens, [
            { kind: TokenSyntaxKind.Tag, text: "@param", pos: 7 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 13 },
            { kind: TokenSyntaxKind.TypeAnnotation, text: "{string}", pos: 14 },
            { kind: TokenSyntaxKind.Text, text: " foo", pos: 22 },
        ]);
    });

    it("Should handle type annotations containing string literals", () => {
        const tokens = lex(
            dedent(`
            /**
             * @param {"{{}}"}
             * @param {\`\${"{}"}\`}
             * @param {"text\\"more {}"}
             * @param {'{'}
             * EOF
             */`),
        );

        const expectedAnnotations = [
            '{"{{}}"}',
            '{`${"{}"}`}',
            '{"text\\"more {}"}',
            "{'{'}",
        ];

        const expectedTokens = expectedAnnotations.flatMap((text) => [
            { kind: TokenSyntaxKind.Tag, text: "@param" },
            { kind: TokenSyntaxKind.Text, text: " " },
            { kind: TokenSyntaxKind.TypeAnnotation, text },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
        ]);
        expectedTokens.push({ kind: TokenSyntaxKind.Text, text: "EOF" });

        equal(
            tokens.map((tok) => ({ kind: tok.kind, text: tok.text })),
            expectedTokens,
        );
    });

    it("Should handle type annotations with object literals", () => {
        const tokens = lex(
            dedent(`
            /**
             * @param {{ a: string }}
             * @param {{ a: string; b: { c: { d: string }} }}
             * EOF
             */`),
        );

        const expectedAnnotations = [
            "{{ a: string }}",
            "{{ a: string; b: { c: { d: string }} }}",
        ];

        const expectedTokens = expectedAnnotations.flatMap((text) => [
            { kind: TokenSyntaxKind.Tag, text: "@param" },
            { kind: TokenSyntaxKind.Text, text: " " },
            { kind: TokenSyntaxKind.TypeAnnotation, text },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
        ]);
        expectedTokens.push({ kind: TokenSyntaxKind.Text, text: "EOF" });

        equal(
            tokens.map((tok) => ({ kind: tok.kind, text: tok.text })),
            expectedTokens,
        );
    });

    it("Should handle unclosed type annotations", () => {
        const tokens = lex("/** @type {oops */");
        equal(tokens, [
            { kind: TokenSyntaxKind.Tag, text: "@type", pos: 4 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 9 },
            { kind: TokenSyntaxKind.TypeAnnotation, text: "{oops", pos: 10 },
        ]);
    });

    it("Should not parse inline tags as types", () => {
        const tokens = lex("/** @param {@link foo} */");

        equal(tokens, [
            { kind: TokenSyntaxKind.Tag, text: "@param", pos: 4 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 10 },
            { kind: TokenSyntaxKind.OpenBrace, text: "{", pos: 11 },
            { kind: TokenSyntaxKind.Tag, text: "@link", pos: 12 },
            { kind: TokenSyntaxKind.Text, text: " foo", pos: 17 },
            { kind: TokenSyntaxKind.CloseBrace, text: "}", pos: 21 },
        ]);
    });

    it("Should allow inline tags directly next to braces", () => {
        const tokens = lex("/** {@inline} */");

        equal(tokens, [
            { kind: TokenSyntaxKind.OpenBrace, text: "{", pos: 4 },
            { kind: TokenSyntaxKind.Tag, text: "@inline", pos: 5 },
            { kind: TokenSyntaxKind.CloseBrace, text: "}", pos: 12 },
        ]);
    });
});

describe("Line Comment Lexer", () => {
    function lex(text: string): Token[] {
        return Array.from(
            lexLineComments(text, [
                {
                    kind: ts.SyntaxKind.SingleLineCommentTrivia,
                    pos: 0,
                    end: text.length,
                },
            ]),
        );
    }

    it("Should handle an empty string", () => {
        equal(lex("//"), []);

        equal(lex("//   "), []);
    });

    it("Should handle a trivial comment", () => {
        const tokens = lex("// Comment ");

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Comment", pos: 3 },
        ]);
    });

    it("Should handle a multiline comment", () => {
        const tokens = lex("// Comment\n  // Next line ");

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Comment", pos: 3 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 10 },
            { kind: TokenSyntaxKind.Text, text: "Next line", pos: 16 },
        ]);
    });

    it("Should handle braces", () => {
        const tokens = lex("// {}");

        equal(tokens, [
            { kind: TokenSyntaxKind.OpenBrace, text: "{", pos: 3 },
            { kind: TokenSyntaxKind.CloseBrace, text: "}", pos: 4 },
        ]);
    });

    it("Should handle escaping braces", () => {
        const tokens = lex("// \\{\\}");

        equal(tokens, [{ kind: TokenSyntaxKind.Text, text: "{}", pos: 3 }]);
    });

    it("Should pass through unknown escapes", () => {
        const tokens = lex("// \\\\ \\n");

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "\\\\ \\n", pos: 3 },
        ]);
        equal(lex("// *\\/"), [
            { kind: TokenSyntaxKind.Text, text: "*\\/", pos: 3 },
        ]);
    });

    it("Should recognize tags", () => {
        const tokens = lex("// @tag @a @abc234");

        equal(tokens, [
            { kind: TokenSyntaxKind.Tag, text: "@tag", pos: 3 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 7 },
            { kind: TokenSyntaxKind.Tag, text: "@a", pos: 8 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 10 },
            { kind: TokenSyntaxKind.Tag, text: "@abc234", pos: 11 },
        ]);
    });

    it("Should not indiscriminately create tags", () => {
        const tokens = lex("// @123 @@ @");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "@123 @@ @", pos: 3 },
        ]);
    });

    it("Should allow escaping @ to prevent a tag creation", () => {
        const tokens = lex("// not a \\@tag");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "not a @tag", pos: 3 },
        ]);
    });

    it("Should not mistake an email for a modifier tag", () => {
        const tokens = lex("// test@example.com");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test@example.com", pos: 3 },
        ]);
    });

    it("Should not mistake a scoped package for a tag", () => {
        const tokens = lex("// @typescript-eslint/parser @jest/globals");
        equal(tokens, [
            {
                kind: TokenSyntaxKind.Text,
                text: "@typescript-eslint/parser @jest/globals",
                pos: 3,
            },
        ]);
    });

    it("Should allow escaping @ in an email", () => {
        const tokens = lex("// test\\@example.com");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test@example.com", pos: 3 },
        ]);
    });

    it("Should allow inline code", () => {
        const tokens = lex("// test `code` after");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test ", pos: 3 },
            { kind: TokenSyntaxKind.Code, text: "`code`", pos: 8 },
            { kind: TokenSyntaxKind.Text, text: " after", pos: 14 },
        ]);
    });

    it("Should allow inline code with multiple ticks", () => {
        const tokens = lex("// test ```not ```` closed``` after");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test ", pos: 3 },
            {
                kind: TokenSyntaxKind.Code,
                text: "```not ```` closed```",
                pos: 8,
            },
            { kind: TokenSyntaxKind.Text, text: " after", pos: 29 },
        ]);
    });

    it("Should allow escaping ticks", () => {
        const tokens = lex("// test `\\`` after");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test ", pos: 3 },
            { kind: TokenSyntaxKind.Code, text: "`\\``", pos: 8 },
            { kind: TokenSyntaxKind.Text, text: " after", pos: 12 },
        ]);
    });

    it("Should treat unclosed inline code as text", () => {
        const tokens = lex("// text ` still text");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "text ` still text", pos: 3 },
        ]);
    });

    it("Should handle tags after unclosed code", () => {
        const tokens = lex(
            dedent(`
            // Text
            // code? \`\` fake
            // @blockTag text
        `),
        );
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Text", pos: 3 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 7 },
            { kind: TokenSyntaxKind.Text, text: "code? `` fake", pos: 11 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 24 },
            { kind: TokenSyntaxKind.Tag, text: "@blockTag", pos: 28 },
            { kind: TokenSyntaxKind.Text, text: " text", pos: 37 },
        ]);
    });

    it("Should handle a full comment", () => {
        const tokens = lex(
            dedent(`
            // This is a summary.
            //
            // @remarks
            // Detailed text here with a {@link Inline | inline link}
            //
            // @alpha @beta
            `),
        );

        equal(
            tokens.map((tok) => ({ kind: tok.kind, text: tok.text })),
            [
                { kind: TokenSyntaxKind.Text, text: "This is a summary." },
                { kind: TokenSyntaxKind.NewLine, text: "\n" },
                { kind: TokenSyntaxKind.NewLine, text: "\n" },
                { kind: TokenSyntaxKind.Tag, text: "@remarks" },
                { kind: TokenSyntaxKind.NewLine, text: "\n" },
                {
                    kind: TokenSyntaxKind.Text,
                    text: "Detailed text here with a ",
                },
                { kind: TokenSyntaxKind.OpenBrace, text: "{" },
                { kind: TokenSyntaxKind.Tag, text: "@link" },
                { kind: TokenSyntaxKind.Text, text: " Inline | inline link" },
                { kind: TokenSyntaxKind.CloseBrace, text: "}" },
                { kind: TokenSyntaxKind.NewLine, text: "\n" },
                { kind: TokenSyntaxKind.NewLine, text: "\n" },
                { kind: TokenSyntaxKind.Tag, text: "@alpha" },
                { kind: TokenSyntaxKind.Text, text: " " },
                { kind: TokenSyntaxKind.Tag, text: "@beta" },
            ],
        );
    });

    it("Should handle unclosed code blocks", () => {
        const tokens = lex(
            dedent(`
            // Text
            // \`\`\`
            // Text`),
        );

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Text", pos: 3 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 7 },
            { kind: TokenSyntaxKind.Code, text: "```\nText", pos: 11 },
        ]);
    });

    it("Should handle type annotations after tags at the start of a line", () => {
        const tokens = lex(`// @param {string} foo`);

        equal(tokens, [
            { kind: TokenSyntaxKind.Tag, text: "@param", pos: 3 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 9 },
            { kind: TokenSyntaxKind.TypeAnnotation, text: "{string}", pos: 10 },
            { kind: TokenSyntaxKind.Text, text: " foo", pos: 18 },
        ]);
    });

    it("Should handle type annotations containing string literals", () => {
        const tokens = lex(
            dedent(`
            // @param {"{{}}"}
            // @param {\`\${"{}"}\`}
            // @param {"text\\"more {}"}
            // @param {'{'}
            // EOF
            `),
        );

        const expectedAnnotations = [
            '{"{{}}"}',
            '{`${"{}"}`}',
            '{"text\\"more {}"}',
            "{'{'}",
        ];

        const expectedTokens = expectedAnnotations.flatMap((text) => [
            { kind: TokenSyntaxKind.Tag, text: "@param" },
            { kind: TokenSyntaxKind.Text, text: " " },
            { kind: TokenSyntaxKind.TypeAnnotation, text },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
        ]);
        expectedTokens.push({ kind: TokenSyntaxKind.Text, text: "EOF" });

        equal(
            tokens.map((tok) => ({ kind: tok.kind, text: tok.text })),
            expectedTokens,
        );
    });

    it("Should handle type annotations with object literals", () => {
        const tokens = lex(
            dedent(`
            // @param {{ a: string }}
            // @param {{ a: string; b: { c: { d: string }} }}
            // EOF
            `),
        );

        const expectedAnnotations = [
            "{{ a: string }}",
            "{{ a: string; b: { c: { d: string }} }}",
        ];

        const expectedTokens = expectedAnnotations.flatMap((text) => [
            { kind: TokenSyntaxKind.Tag, text: "@param" },
            { kind: TokenSyntaxKind.Text, text: " " },
            { kind: TokenSyntaxKind.TypeAnnotation, text },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
        ]);
        expectedTokens.push({ kind: TokenSyntaxKind.Text, text: "EOF" });

        equal(
            tokens.map((tok) => ({ kind: tok.kind, text: tok.text })),
            expectedTokens,
        );
    });

    it("Should handle unclosed type annotations", () => {
        const tokens = lex("// @type {oops");
        equal(tokens, [
            { kind: TokenSyntaxKind.Tag, text: "@type", pos: 3 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 8 },
            { kind: TokenSyntaxKind.TypeAnnotation, text: "{oops", pos: 9 },
        ]);
    });

    it("Should not parse inline tags as types", () => {
        const tokens = lex("// @param { @link foo}");

        equal(tokens, [
            { kind: TokenSyntaxKind.Tag, text: "@param", pos: 3 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 9 },
            { kind: TokenSyntaxKind.OpenBrace, text: "{", pos: 10 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 11 },
            { kind: TokenSyntaxKind.Tag, text: "@link", pos: 12 },
            { kind: TokenSyntaxKind.Text, text: " foo", pos: 17 },
            { kind: TokenSyntaxKind.CloseBrace, text: "}", pos: 21 },
        ]);
    });

    it("Should allow inline tags directly next to braces", () => {
        const tokens = lex("// {@inline}");

        equal(tokens, [
            { kind: TokenSyntaxKind.OpenBrace, text: "{", pos: 3 },
            { kind: TokenSyntaxKind.Tag, text: "@inline", pos: 4 },
            { kind: TokenSyntaxKind.CloseBrace, text: "}", pos: 11 },
        ]);
    });
});

describe("Raw Lexer", () => {
    function lex(text: string): Token[] {
        return Array.from(lexCommentString(text));
    }

    it("Should handle an empty string", () => {
        equal(lex(""), []);

        equal(lex("   \n   "), []);
    });

    it("Should handle a trivial comment", () => {
        const tokens = lex(" Comment ");

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Comment", pos: 1 },
        ]);
    });

    it("Should handle a multiline comment", () => {
        const tokens = lex(" Comment\nNext line ");

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Comment", pos: 1 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 8 },
            { kind: TokenSyntaxKind.Text, text: "Next line", pos: 9 },
        ]);
    });

    it("Should handle braces", () => {
        const tokens = lex("{}");

        equal(tokens, [
            { kind: TokenSyntaxKind.OpenBrace, text: "{", pos: 0 },
            { kind: TokenSyntaxKind.CloseBrace, text: "}", pos: 1 },
        ]);
    });

    it("Should handle escaping braces", () => {
        const tokens = lex("\\{\\}");

        equal(tokens, [{ kind: TokenSyntaxKind.Text, text: "{}", pos: 0 }]);
    });

    it("Should pass through unknown escapes", () => {
        const tokens = lex("\\\\ \\n");

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "\\\\ \\n", pos: 0 },
        ]);
        equal(lex("*\\/"), [
            { kind: TokenSyntaxKind.Text, text: "*\\/", pos: 0 },
        ]);
    });

    it("Should recognize tags", () => {
        const tokens = lex("@tag @a @abc234");

        equal(tokens, [
            { kind: TokenSyntaxKind.Tag, text: "@tag", pos: 0 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 4 },
            { kind: TokenSyntaxKind.Tag, text: "@a", pos: 5 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 7 },
            { kind: TokenSyntaxKind.Tag, text: "@abc234", pos: 8 },
        ]);
    });

    it("Should not indiscriminately create tags", () => {
        const tokens = lex("@123 @@ @");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "@123 @@ @", pos: 0 },
        ]);
    });

    it("Should allow escaping @ to prevent a tag creation", () => {
        const tokens = lex("not a \\@tag");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "not a @tag", pos: 0 },
        ]);
    });

    it("Should not mistake an email for a modifier tag", () => {
        const tokens = lex("test@example.com");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test@example.com", pos: 0 },
        ]);
    });

    it("Should not mistake a scoped package for a tag", () => {
        const tokens = lex("@typescript-eslint/parser @jest/globals");
        equal(tokens, [
            {
                kind: TokenSyntaxKind.Text,
                text: "@typescript-eslint/parser @jest/globals",
                pos: 0,
            },
        ]);
    });

    it("Should allow escaping @ in an email", () => {
        const tokens = lex("test\\@example.com");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test@example.com", pos: 0 },
        ]);
    });

    it("Should allow inline code", () => {
        const tokens = lex("test `code` after");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test ", pos: 0 },
            { kind: TokenSyntaxKind.Code, text: "`code`", pos: 5 },
            { kind: TokenSyntaxKind.Text, text: " after", pos: 11 },
        ]);
    });

    // https://github.com/TypeStrong/typedoc/issues/1922#issuecomment-1166278275
    it("Should handle code blocks ending a string", () => {
        const tokens = lex("`code`");

        equal(tokens, [
            {
                kind: "code",
                text: "`code`",
                pos: 0,
            },
        ]);
    });

    it("Should allow inline code with multiple ticks", () => {
        const tokens = lex("test ```not ```` closed``` after");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test ", pos: 0 },
            {
                kind: TokenSyntaxKind.Code,
                text: "```not ```` closed```",
                pos: 5,
            },
            { kind: TokenSyntaxKind.Text, text: " after", pos: 26 },
        ]);
    });

    it("Should allow escaping ticks", () => {
        const tokens = lex("test `\\`` after");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test ", pos: 0 },
            { kind: TokenSyntaxKind.Code, text: "`\\``", pos: 5 },
            { kind: TokenSyntaxKind.Text, text: " after", pos: 9 },
        ]);
    });

    it("Should treat unclosed inline code as text", () => {
        const tokens = lex("text ` still text");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "text ` still text", pos: 0 },
        ]);
    });

    it("Should handle tags after unclosed code", () => {
        const tokens = lex(
            dedent(`
            Text
            code? \`\` fake
            @blockTag text
        `),
        );
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Text", pos: 0 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 4 },
            { kind: TokenSyntaxKind.Text, text: "code? `` fake", pos: 5 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 18 },
            { kind: TokenSyntaxKind.Tag, text: "@blockTag", pos: 19 },
            { kind: TokenSyntaxKind.Text, text: " text", pos: 28 },
        ]);
    });

    it("Should handle a full comment", () => {
        const tokens = lex(
            dedent(`
            This is a summary.

            @remarks
            Detailed text here with a {@link Inline | inline link}

            @alpha @beta
            `),
        ).map((t) => ({ kind: t.kind, text: t.text }));

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "This is a summary." },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
            { kind: TokenSyntaxKind.Tag, text: "@remarks" },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
            { kind: TokenSyntaxKind.Text, text: "Detailed text here with a " },
            { kind: TokenSyntaxKind.OpenBrace, text: "{" },
            { kind: TokenSyntaxKind.Tag, text: "@link" },
            { kind: TokenSyntaxKind.Text, text: " Inline | inline link" },
            { kind: TokenSyntaxKind.CloseBrace, text: "}" },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
            { kind: TokenSyntaxKind.Tag, text: "@alpha" },
            { kind: TokenSyntaxKind.Text, text: " " },
            { kind: TokenSyntaxKind.Tag, text: "@beta" },
        ]);
    });

    it("Should handle unclosed code blocks", () => {
        const tokens = lex(
            dedent(`
            Text
            \`\`\`
            Text`),
        );

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Text", pos: 0 },
            { kind: TokenSyntaxKind.NewLine, text: "\n", pos: 4 },
            { kind: TokenSyntaxKind.Code, text: "```\nText", pos: 5 },
        ]);
    });

    it("Should handle type annotations after tags at the start of a line", () => {
        const tokens = lex(`@param {string} foo`);

        equal(tokens, [
            { kind: TokenSyntaxKind.Tag, text: "@param", pos: 0 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 6 },
            { kind: TokenSyntaxKind.TypeAnnotation, text: "{string}", pos: 7 },
            { kind: TokenSyntaxKind.Text, text: " foo", pos: 15 },
        ]);
    });

    it("Should handle type annotations containing string literals", () => {
        const tokens = lex(
            dedent(`
            @param {"{{}}"}
            @param {\`\${"{}"}\`}
            @param {"text\\"more {}"}
            @param {'{'}
            EOF
            `),
        );

        const expectedAnnotations = [
            '{"{{}}"}',
            '{`${"{}"}`}',
            '{"text\\"more {}"}',
            "{'{'}",
        ];

        const expectedTokens = expectedAnnotations.flatMap((text) => [
            { kind: TokenSyntaxKind.Tag, text: "@param" },
            { kind: TokenSyntaxKind.Text, text: " " },
            { kind: TokenSyntaxKind.TypeAnnotation, text },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
        ]);
        expectedTokens.push({ kind: TokenSyntaxKind.Text, text: "EOF" });

        equal(
            tokens.map((t) => ({ kind: t.kind, text: t.text })),
            expectedTokens,
        );
    });

    it("Should handle type annotations with object literals", () => {
        const tokens = lex(
            dedent(`
            @param {{ a: string }}
            @param {{ a: string; b: { c: { d: string }} }}
            EOF
            `),
        );

        const expectedAnnotations = [
            "{{ a: string }}",
            "{{ a: string; b: { c: { d: string }} }}",
        ];

        const expectedTokens = expectedAnnotations.flatMap((text) => [
            { kind: TokenSyntaxKind.Tag, text: "@param" },
            { kind: TokenSyntaxKind.Text, text: " " },
            { kind: TokenSyntaxKind.TypeAnnotation, text },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
        ]);
        expectedTokens.push({ kind: TokenSyntaxKind.Text, text: "EOF" });

        equal(
            tokens.map((t) => ({ kind: t.kind, text: t.text })),
            expectedTokens,
        );
    });

    it("Should handle unclosed type annotations", () => {
        const tokens = lex("@type {oops");
        equal(tokens, [
            { kind: TokenSyntaxKind.Tag, text: "@type", pos: 0 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 5 },
            { kind: TokenSyntaxKind.TypeAnnotation, text: "{oops", pos: 6 },
        ]);
    });

    it("Should not parse inline tags as types", () => {
        const tokens = lex("@param { @link foo}");

        equal(tokens, [
            { kind: TokenSyntaxKind.Tag, text: "@param", pos: 0 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 6 },
            { kind: TokenSyntaxKind.OpenBrace, text: "{", pos: 7 },
            { kind: TokenSyntaxKind.Text, text: " ", pos: 8 },
            { kind: TokenSyntaxKind.Tag, text: "@link", pos: 9 },
            { kind: TokenSyntaxKind.Text, text: " foo", pos: 14 },
            { kind: TokenSyntaxKind.CloseBrace, text: "}", pos: 18 },
        ]);
    });

    it("Should allow inline tags directly next to braces", () => {
        const tokens = lex("{@inline}");

        equal(tokens, [
            { kind: TokenSyntaxKind.OpenBrace, text: "{", pos: 0 },
            { kind: TokenSyntaxKind.Tag, text: "@inline", pos: 1 },
            { kind: TokenSyntaxKind.CloseBrace, text: "}", pos: 8 },
        ]);
    });
});

describe("Comment Parser", () => {
    const config: CommentParserConfig = {
        blockTags: new Set(["@param", "@remarks", "@module"]),
        inlineTags: new Set(["@link"]),
        modifierTags: new Set([
            "@public",
            "@private",
            "@protected",
            "@readonly",
            "@enum",
            "@event",
            "@packageDocumentation",
        ]),
        jsDocCompatibility: {
            defaultTag: true,
            exampleTag: true,
            ignoreUnescapedBraces: false,
            inheritDocTag: false,
        },
    };

    it("Should rewrite @inheritdoc to @inheritDoc", () => {
        const logger = new TestLogger();
        const file = "/** @inheritdoc */";
        const content = lexBlockComment(file);
        const comment = parseComment(
            content,
            config,
            new MinimalSourceFile(file, "<memory>"),
            logger,
        );

        logger.expectMessage(
            "warn: The @inheritDoc tag should be properly capitalized",
        );
        logger.expectNoOtherMessages();
        equal(comment, new Comment([], [new CommentTag("@inheritDoc", [])]));
    });

    function test(name: string, text: string, cb: (comment: Comment) => void) {
        it(name, () => {
            const logger = new TestLogger();
            const content = lexBlockComment(text);
            const comment = parseComment(
                content,
                config,
                new MinimalSourceFile(text, "<memory>"),
                logger,
            );
            logger.expectNoOtherMessages();
            cb(comment);
        });
    }

    test("Simple summary", "/** Summary! */", (comment) => {
        equal(comment.summary, [{ kind: "text", text: "Summary!" }]);
        equal(comment.blockTags, []);
        equal(comment.modifierTags, new Set());
    });

    test(
        "Summary with remarks",
        `/**
          * Summary
          * @remarks Remarks
          */`,
        (comment) => {
            equal(comment.summary, [{ kind: "text", text: "Summary" }]);
            equal(comment.blockTags, [
                new CommentTag("@remarks", [{ kind: "text", text: "Remarks" }]),
            ]);
            equal(comment.modifierTags, new Set());
        },
    );

    test(
        "Parameter without content",
        `/**
          * Summary
          * @param
          */`,
        (comment) => {
            equal(comment.summary, [{ kind: "text", text: "Summary" }]);
            const tag = new CommentTag("@param", []);

            equal(comment.blockTags, [tag]);
            equal(comment.modifierTags, new Set());
        },
    );

    test(
        "Parameter name",
        `/**
          * Summary
          * @param T Param text
          */`,
        (comment) => {
            equal(comment.summary, [{ kind: "text", text: "Summary" }]);
            const tag = new CommentTag("@param", [
                { kind: "text", text: "Param text" },
            ]);
            tag.name = "T";

            equal(comment.blockTags, [tag]);
            equal(comment.modifierTags, new Set());
        },
    );

    test(
        "Parameter name with no content",
        `/**
          * Summary
          * @param T
          */`,
        (comment) => {
            equal(comment.summary, [{ kind: "text", text: "Summary" }]);
            const tag = new CommentTag("@param", []);
            tag.name = "T";

            equal(comment.blockTags, [tag]);
            equal(comment.modifierTags, new Set());
        },
    );

    test(
        "Parameter name with dash",
        `/**
          * Summary
          * @param T - Param text
          */`,
        (comment) => {
            equal(comment.summary, [{ kind: "text", text: "Summary" }]);
            const tag = new CommentTag("@param", [
                { kind: "text", text: "Param text" },
            ]);
            tag.name = "T";

            equal(comment.blockTags, [tag]);
            equal(comment.modifierTags, new Set());
        },
    );

    test(
        "Parameter name with type annotation",
        `/**
          * Summary
          * @param {string} T - Param text
          */`,
        (comment) => {
            equal(comment.summary, [{ kind: "text", text: "Summary" }]);
            const tag = new CommentTag("@param", [
                { kind: "text", text: "Param text" },
            ]);
            tag.name = "T";

            equal(comment.blockTags, [tag]);
            equal(comment.modifierTags, new Set());
        },
    );
});
