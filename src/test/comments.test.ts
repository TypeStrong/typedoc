import { deepStrictEqual as equal } from "assert";

import {
    lexBlockComment,
    Token,
    TokenSyntaxKind,
} from "../lib/converter/comments/blockLexer";

function dedent(text: string) {
    const lines = text.split(/\r?\n/);
    while (lines.length && lines[0].search(/\S/) === -1) {
        lines.shift();
    }
    while (lines.length && lines[lines.length - 1].search(/\S/) === -1) {
        lines.pop();
    }

    const minIndent = lines.reduce(
        (indent, line) => Math.min(indent, line.search(/\S/)),
        Infinity
    );

    return lines.map((line) => line.substr(minIndent)).join("\n");
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
            "Text here"
        );
    });

    it("Works with multiple lines", () => {
        equal(
            dedent(`
            Text here
                More indented
        `),
            "Text here\n    More indented"
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

        equal(tokens, [{ kind: TokenSyntaxKind.Text, text: "Comment" }]);
    });

    it("Should handle a multiline comment without stars", () => {
        const tokens = lex("/* Comment\nNext line */");

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Comment" },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
            { kind: TokenSyntaxKind.Text, text: "Next line" },
        ]);
    });

    it("Should handle a multiline comment with stars", () => {
        const tokens = lex("/*\n * Comment\n * Next line */");

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Comment" },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
            { kind: TokenSyntaxKind.Text, text: "Next line" },
        ]);
    });

    it("Should handle an indented comment with stars", () => {
        const tokens = lex(`/**
            * Text
            */`);

        equal(tokens, [{ kind: TokenSyntaxKind.Text, text: "Text" }]);
    });

    it("Should handle an indented comment without stars", () => {
        const tokens = lex(`/*
            Text
            */`);

        equal(tokens, [{ kind: TokenSyntaxKind.Text, text: "Text" }]);
    });

    it("Should handle a list within a comment without stars", () => {
        const tokens = lex(
            dedent(`
            /*
             Comment start
              * This is a list item
            */
        `)
        );

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Comment start" },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
            { kind: TokenSyntaxKind.Text, text: " * This is a list item" },
        ]);
    });

    it("Should handle higher detected indentation than the rest of the comment", () => {
        const tokens = lex(
            dedent(`
        /*
             A
        B
            */
        `)
        );

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "A" },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
            { kind: TokenSyntaxKind.Text, text: "B" },
        ]);
    });

    it("Should handle a comment with stars missing a space", () => {
        const tokens = lex(
            dedent(`
            /*
             * A
             *B
             */
            `)
        );

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "A" },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
            { kind: TokenSyntaxKind.Text, text: "B" },
        ]);
    });

    it("Should handle braces", () => {
        const tokens = lex("/* {} */");

        equal(tokens, [
            { kind: TokenSyntaxKind.OpenBrace, text: "{" },
            { kind: TokenSyntaxKind.CloseBrace, text: "}" },
        ]);
    });

    it("Should handle escaping braces", () => {
        const tokens = lex("/* \\{\\} */");

        equal(tokens, [{ kind: TokenSyntaxKind.Text, text: "{}" }]);
    });

    it("Should allow escaping slashes", () => {
        const tokens = lex("/* Text *\\/ */");

        equal(tokens, [{ kind: TokenSyntaxKind.Text, text: "Text */" }]);
    });

    it("Should allow escaping slashes in code blocks", () => {
        const tokens = lex(
            dedent(`
            /**
             * \`\`\`ts
             * /* inner block comment *\\/
             * \`\`\`
             */
            `)
        );

        equal(tokens, [
            {
                kind: TokenSyntaxKind.Code,
                text: "```ts\n/* inner block comment */\n```",
            },
        ]);
    });

    it("Should pass through unknown escapes", () => {
        const tokens = lex("/* \\\\ \\n */");

        equal(tokens, [{ kind: TokenSyntaxKind.Text, text: "\\\\ \\n" }]);
    });

    it("Should recognize tags", () => {
        const tokens = lex("/* @tag @a @abc234 */");

        equal(tokens, [
            { kind: TokenSyntaxKind.Tag, text: "@tag" },
            { kind: TokenSyntaxKind.Text, text: " " },
            { kind: TokenSyntaxKind.Tag, text: "@a" },
            { kind: TokenSyntaxKind.Text, text: " " },
            { kind: TokenSyntaxKind.Tag, text: "@abc234" },
        ]);
    });

    it("Should not indiscriminately create tags", () => {
        const tokens = lex("/* @123 @@ @ */");
        equal(tokens, [{ kind: TokenSyntaxKind.Text, text: "@123 @@ @" }]);
    });

    it("Should allow escaping @ to prevent a tag creation", () => {
        const tokens = lex("/* not a \\@tag */");
        equal(tokens, [{ kind: TokenSyntaxKind.Text, text: "not a @tag" }]);
    });

    it("Should not mistake an email for a modifier tag", () => {
        const tokens = lex("/* test@example.com */");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test@example.com" },
        ]);
    });

    it("Should allow escaping @ in an email", () => {
        const tokens = lex("/* test\\@example.com */");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test@example.com" },
        ]);
    });

    it("Should allow inline code", () => {
        const tokens = lex("/* test `code` after */");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test " },
            { kind: TokenSyntaxKind.Code, text: "`code`" },
            { kind: TokenSyntaxKind.Text, text: " after" },
        ]);
    });

    it("Should allow inline code with multiple ticks", () => {
        const tokens = lex("/* test ```not ```` closed``` after */");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test " },
            { kind: TokenSyntaxKind.Code, text: "```not ```` closed```" },
            { kind: TokenSyntaxKind.Text, text: " after" },
        ]);
    });

    it("Should allow escaping ticks", () => {
        const tokens = lex("/* test `\\`` after */");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "test " },
            { kind: TokenSyntaxKind.Code, text: "`\\``" },
            { kind: TokenSyntaxKind.Text, text: " after" },
        ]);
    });

    it("Should handle stars within code", () => {
        const tokens = lex(
            dedent(`
            /**
             * \`\`\`ts
             *   test()
             * \`\`\`
             */`)
        );

        equal(tokens, [
            { kind: TokenSyntaxKind.Code, text: "```ts\n  test()\n```" },
        ]);
    });

    it("Should indent code without stars", () => {
        const tokens = lex(
            dedent(`
            /**
            \`\`\`ts
              test()
            \`\`\`
            */`)
        );

        equal(tokens, [
            { kind: TokenSyntaxKind.Code, text: "```ts\n  test()\n```" },
        ]);
    });

    it("Should treat unclosed inline code as text", () => {
        const tokens = lex("/* text ` still text */");
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "text ` still text" },
        ]);
    });

    it("Should treat unclosed code blocks as code", () => {
        const tokens = lex(
            dedent(`
                /*
                 * Text
                 * \`\`\`ts
                 * foo();
                 */`)
        );
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Text" },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
            { kind: TokenSyntaxKind.Code, text: "```ts\nfoo();" },
        ]);
    });

    it("Should handle tags after unclosed code", () => {
        const tokens = lex(
            dedent(`
                /*
                 * Text
                 * code? \`\` fake
                 * @blockTag text
                 */`)
        );
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Text" },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
            { kind: TokenSyntaxKind.Text, text: "code? `` fake" },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
            { kind: TokenSyntaxKind.Tag, text: "@blockTag" },
            { kind: TokenSyntaxKind.Text, text: " text" },
        ]);
    });

    it("Should handle text on the first line of a comment", () => {
        let tokens = lex(
            dedent(`
                /* Text
                 * Text2
                 */`)
        );
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Text" },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
            { kind: TokenSyntaxKind.Text, text: "Text2" },
        ]);

        tokens = lex(
            dedent(`
                /** Text
                 * Text2
                 */`)
        );
        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Text" },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
            { kind: TokenSyntaxKind.Text, text: "Text2" },
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
             */`)
        );

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

    it("Should handle starred comments without an end tag in code", () => {
        const tokens = lex(
            dedent(`
            /**
             *Text
             *\`\`\`
             *Text
             */`)
        );

        equal(tokens, [
            { kind: TokenSyntaxKind.Text, text: "Text" },
            { kind: TokenSyntaxKind.NewLine, text: "\n" },
            { kind: TokenSyntaxKind.Code, text: "```\nText" },
        ]);
    });

    it("Should handle type annotations after tags at the start of a line", () => {
        const tokens = lex(
            dedent(`
            /**
             * @param {string} foo
             */`)
        );

        equal(tokens, [
            { kind: TokenSyntaxKind.Tag, text: "@param" },
            { kind: TokenSyntaxKind.Text, text: " " },
            { kind: TokenSyntaxKind.TypeAnnotation, text: "{string}" },
            { kind: TokenSyntaxKind.Text, text: " foo" },
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
             */`)
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

        equal(tokens, expectedTokens);
    });

    it("Should handle type annotations with object literals", () => {
        const tokens = lex(
            dedent(`
            /**
             * @param {{ a: string }}
             * @param {{ a: string; b: { c: { d: string }} }}
             * EOF
             */`)
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

        equal(tokens, expectedTokens);
    });

    it("Should handle unclosed type annotations", () => {
        const tokens = lex("/** @type {oops */");
        equal(tokens, [
            { kind: TokenSyntaxKind.Tag, text: "@type" },
            { kind: TokenSyntaxKind.Text, text: " " },
            { kind: TokenSyntaxKind.TypeAnnotation, text: "{oops" },
        ]);
    });

    it("Should not parse inline tags as types", () => {
        const tokens = lex("/** @param {@link foo} */");

        equal(tokens, [
            { kind: TokenSyntaxKind.Tag, text: "@param" },
            { kind: TokenSyntaxKind.Text, text: " " },
            { kind: TokenSyntaxKind.OpenBrace, text: "{" },
            { kind: TokenSyntaxKind.Tag, text: "@link" },
            { kind: TokenSyntaxKind.Text, text: " foo" },
            { kind: TokenSyntaxKind.CloseBrace, text: "}" },
        ]);
    });
});
