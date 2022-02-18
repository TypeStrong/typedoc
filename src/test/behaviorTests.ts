import { deepStrictEqual as equal, ok } from "assert";
import {
    DeclarationReflection,
    ProjectReflection,
    ReflectionKind,
    Comment,
    CommentDisplayPart,
} from "../lib/models";
import type { TestLogger } from "./TestLogger";

function query(project: ProjectReflection, name: string) {
    const reflection = project.getChildByName(name);
    ok(reflection instanceof DeclarationReflection, `Failed to find ${name}`);
    return reflection;
}

export const behaviorTests: Record<
    string,
    (project: ProjectReflection, logger: TestLogger) => void
> = {
    asConstEnum(project) {
        const SomeEnumLike = query(project, "SomeEnumLike");
        equal(SomeEnumLike.kind, ReflectionKind.Variable, "SomeEnumLike");
        const SomeEnumLikeTagged = query(project, "SomeEnumLikeTagged");
        equal(
            SomeEnumLikeTagged.kind,
            ReflectionKind.Enum,
            "SomeEnumLikeTagged"
        );
        const A = query(project, "SomeEnumLikeTagged.a");
        equal(A.defaultValue, '"a"');

        const ManualEnum = query(project, "ManualEnum");
        equal(ManualEnum.kind, ReflectionKind.Enum, "ManualEnum");

        const ManualWithoutHelper = query(project, "ManualEnumHelper");
        equal(
            ManualWithoutHelper.kind,
            ReflectionKind.Enum,
            "ManualEnumHelper"
        );

        const WithoutReadonly = query(project, "WithoutReadonly");
        equal(WithoutReadonly.kind, ReflectionKind.Enum, "WithoutReadonly");
    },

    deprecatedBracketLinks(project, logger) {
        const a = query(project, "alpha");
        const b = query(project, "beta");

        const aTag = a.comment?.summary.find((p) => p.kind === "inline-tag") as
            | Extract<CommentDisplayPart, { kind: "inline-tag" }>
            | undefined;
        equal(aTag?.tag, "@link");
        equal(aTag?.text, "beta");
        equal(aTag.target, b);
        logger.expectMessage(
            "warn: alpha: Comment [[target]] style links are deprecated and will be removed in 0.24"
        );

        const bTag = b.comment?.summary.find((p) => p.kind === "inline-tag") as
            | Extract<CommentDisplayPart, { kind: "inline-tag" }>
            | undefined;
        equal(bTag?.tag, "@link");
        equal(bTag?.text, "bracket links");
        equal(bTag.target, a);
        logger.expectMessage(
            "warn: beta: Comment [[target]] style links are deprecated and will be removed in 0.24"
        );
    },

    duplicateHeritageClauses(project) {
        const b = query(project, "B");
        equal(b.extendedTypes?.map(String), ["A"]);

        const c = query(project, "C");
        equal(c.extendedTypes?.map(String), ["A"]);
        equal(c.implementedTypes?.map(String), ["A"]);

        const d = query(project, "D");
        equal(d.extendedTypes?.map(String), [
            'Record<"a", 1>',
            'Record<"b", 1>',
        ]);
    },

    exampleTags(project) {
        const foo = query(project, "foo");
        const tags = foo.comment?.blockTags.map((tag) => tag.content);

        equal(tags, [
            [{ kind: "code", text: "```ts\n// JSDoc style\ncodeHere();\n```" }],
            [
                { kind: "text", text: "JSDoc specialness\n" },
                {
                    kind: "code",
                    text: "```ts\n// JSDoc style\ncodeHere();\n```",
                },
            ],
            [{ kind: "code", text: "```ts\n// TSDoc style\ncodeHere();\n```" }],
        ]);
    },

    mergedDeclarations(project, logger) {
        const a = query(project, "SingleCommentMultiDeclaration");
        equal(
            Comment.combineDisplayParts(a.comment?.summary),
            "Comment on second declaration"
        );

        const b = query(project, "MultiCommentMultiDeclaration");
        equal(Comment.combineDisplayParts(b.comment?.summary), "Comment 1");

        logger.expectMessage(
            "warn: MultiCommentMultiDeclaration has multiple declarations with a comment. An arbitrary comment will be used."
        );
    },

    overloads(project) {
        const foo = query(project, "foo");
        const fooComments = foo.signatures?.map((sig) =>
            Comment.combineDisplayParts(sig.comment?.summary)
        );
        equal(fooComments, [
            "No arg comment\n{@label NO_ARGS}",
            "{@inheritDoc (foo:NO_ARGS)}\n{@label WITH_X}",
        ]);
        equal(foo.comment, undefined);

        const bar = query(project, "bar");
        const barComments = bar.signatures?.map((sig) =>
            Comment.combineDisplayParts(sig.comment?.summary)
        );
        equal(barComments, ["Implementation comment", "Custom comment"]);
        equal(bar.comment, undefined);
    },
};
