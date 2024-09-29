import { deepStrictEqual as equal } from "assert";
import { Comment, CommentTag, type CommentDisplayPart } from "../../index.js";

describe("Comment.combineDisplayParts", () => {
    it("Handles text and code", () => {
        const parts: CommentDisplayPart[] = [
            { kind: "text", text: "a" },
            { kind: "code", text: "`b`" },
        ];
        equal(Comment.combineDisplayParts(parts), "a`b`");
    });

    it("Handles inline tags", () => {
        const parts: CommentDisplayPart[] = [
            { kind: "inline-tag", text: "`b`", tag: "@test" },
        ];
        equal(Comment.combineDisplayParts(parts), "{@test `b`}");
    });
});

describe("Comment.splitPartsToHeaderAndBody", () => {
    it("Handles a simple case", () => {
        const parts: CommentDisplayPart[] = [{ kind: "text", text: "a\nb" }];

        equal(Comment.splitPartsToHeaderAndBody(parts), {
            header: "a",
            body: [{ kind: "text", text: "b" }],
        });
    });

    it("Refuses to split a code block", () => {
        const parts: CommentDisplayPart[] = [{ kind: "code", text: "`a\nb`" }];

        equal(Comment.splitPartsToHeaderAndBody(parts), {
            header: "",
            body: [{ kind: "code", text: "`a\nb`" }],
        });
    });

    it("Handles a newline in a code block after text", () => {
        const parts: CommentDisplayPart[] = [
            { kind: "text", text: "Header" },
            { kind: "code", text: "`a\nb`" },
        ];

        equal(Comment.splitPartsToHeaderAndBody(parts), {
            header: "Header",
            body: [{ kind: "code", text: "`a\nb`" }],
        });
    });

    it("Handles header consisting of multiple display parts", () => {
        const parts: CommentDisplayPart[] = [
            { kind: "text", text: "Header" },
            { kind: "text", text: " more " },
            { kind: "text", text: "text\nbody" },
        ];

        equal(Comment.splitPartsToHeaderAndBody(parts), {
            header: "Header more text",
            body: [{ kind: "text", text: "body" }],
        });
    });

    it("Handles empty body", () => {
        const parts: CommentDisplayPart[] = [
            { kind: "text", text: "Header\n" },
        ];

        equal(Comment.splitPartsToHeaderAndBody(parts), {
            header: "Header",
            body: [],
        });
    });

    it("Trims the header text", () => {
        const parts: CommentDisplayPart[] = [
            { kind: "text", text: "Header  \n" },
        ];

        equal(Comment.splitPartsToHeaderAndBody(parts), {
            header: "Header",
            body: [],
        });
    });
});

describe("Comment.getShortSummary", () => {
    it("Gets the @summary tag if present", () => {
        const comment = new Comment(
            [{ kind: "text", text: "Summary" }],
            [new CommentTag("@summary", [{ kind: "text", text: "Tag" }])],
        );

        equal(comment.getShortSummary(true), [{ kind: "text", text: "Tag" }]);
    });

    it("Ignores the body if instructed", () => {
        const comment = new Comment([{ kind: "text", text: "Hi" }]);
        equal(comment.getShortSummary(false), []);
    });

    it("Handles an empty comment", () => {
        const comment = new Comment([]);
        equal(comment.getShortSummary(true), []);
    });

    it("Handles a one line comment", () => {
        const comment = new Comment([{ kind: "text", text: "Hi" }]);
        equal(comment.getShortSummary(true), [{ kind: "text", text: "Hi" }]);
    });

    it("Handles a multi-paragraph comment", () => {
        const comment = new Comment([
            {
                kind: "text",
                text: "Paragraph one\n\nParagraph two",
            },
        ]);

        equal(comment.getShortSummary(true), [
            { kind: "text", text: "Paragraph one" },
        ]);
    });

    it("Gets the first paragraph of a comment", () => {
        const comment = new Comment([
            {
                kind: "text",
                text: "Stuff\nwith\nnewlines ",
            },
            {
                kind: "inline-tag",
                tag: "@link",
                text: "Element",
            },
            {
                kind: "text",
                text: "\nmore text\n",
            },
            {
                kind: "code",
                text: "```json\n{}\n```",
            },
        ]);

        equal(comment.getShortSummary(true), [
            {
                kind: "text",
                text: "Stuff\nwith\nnewlines ",
            },
            {
                kind: "inline-tag",
                tag: "@link",
                text: "Element",
            },
            {
                kind: "text",
                text: "\nmore text\n",
            },
        ]);
    });
});
