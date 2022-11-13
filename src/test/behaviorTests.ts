import { deepStrictEqual as equal, ok } from "assert";
import type { Application } from "../lib/application";
import {
    DeclarationReflection,
    LiteralType,
    ProjectReflection,
    ReflectionKind,
    Comment,
    CommentDisplayPart,
    CommentTag,
    Reflection,
    SignatureReflection,
} from "../lib/models";
import { Chars, filterMap } from "../lib/utils";
import { CommentStyle } from "../lib/utils/options/declaration";
import type { TestLogger } from "./TestLogger";

function query(project: ProjectReflection, name: string) {
    const reflection = project.getChildByName(name);
    ok(reflection instanceof DeclarationReflection, `Failed to find ${name}`);
    return reflection;
}

type Letters = Chars<"abcdefghijklmnopqrstuvwxyz">;

export const behaviorTests: {
    [issue: `_${string}`]: (app: Application) => void;
    [issue: `${Letters}${string}`]: (
        project: ProjectReflection,
        logger: TestLogger
    ) => void;
} = {
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
        equal(A.type, new LiteralType("a"));
        equal(A.defaultValue, undefined);

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

        const SomeEnumLikeNumeric = query(project, "SomeEnumLikeNumeric");
        equal(
            SomeEnumLikeNumeric.kind,
            ReflectionKind.Variable,
            "SomeEnumLikeNumeric"
        );
        const SomeEnumLikeTaggedNumeric = query(
            project,
            "SomeEnumLikeTaggedNumeric"
        );
        equal(
            SomeEnumLikeTaggedNumeric.kind,
            ReflectionKind.Enum,
            "SomeEnumLikeTaggedNumeric"
        );
        const B = query(project, "SomeEnumLikeTaggedNumeric.b");
        equal(B.type, new LiteralType(1));
        equal(B.defaultValue, undefined);

        const ManualEnumNumeric = query(project, "ManualEnumNumeric");
        equal(ManualEnumNumeric.kind, ReflectionKind.Enum, "ManualEnumNumeric");

        const ManualWithoutHelperNumeric = query(
            project,
            "ManualEnumHelperNumeric"
        );
        equal(
            ManualWithoutHelperNumeric.kind,
            ReflectionKind.Enum,
            "ManualEnumHelperNumeric"
        );

        const WithoutReadonlyNumeric = query(project, "WithoutReadonlyNumeric");
        equal(
            WithoutReadonlyNumeric.kind,
            ReflectionKind.Enum,
            "WithoutReadonlyNumeric"
        );

        const WithInvalidTypeUnionMember = query(
            project,
            "WithInvalidTypeUnionMember"
        );
        equal(
            WithInvalidTypeUnionMember.kind,
            ReflectionKind.Variable,
            "WithInvalidTypeUnionMember"
        );

        const WithNumericExpression = query(project, "WithNumericExpression");
        equal(
            WithNumericExpression.kind,
            ReflectionKind.Enum,
            "WithNumericExpression"
        );
    },

    _blockComment(app) {
        app.options.setValue("commentStyle", CommentStyle.Block);
    },
    blockComment(project) {
        const a = query(project, "a");
        const b = query(project, "b");

        equal(Comment.combineDisplayParts(a.comment?.summary), "jsdoc block");
        equal(
            Comment.combineDisplayParts(b.comment?.summary),
            "block, but not jsdoc"
        );
    },

    declareGlobal(project) {
        equal(
            project.children?.map((c) => c.name),
            ["DeclareGlobal"]
        );
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

    exampleTags(project, logger) {
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
            [
                { kind: "text", text: "JSDoc with braces\n" },
                {
                    kind: "code",
                    text: "```ts\nx.map(() => { return 1; })\n```",
                },
            ],
            [{ kind: "code", text: "```ts\n// TSDoc style\ncodeHere();\n```" }],
        ]);

        logger.discardDebugMessages();
        logger.expectNoOtherMessages();
    },

    exportComments(project) {
        const abc = query(project, "abc");
        equal(abc.kind, ReflectionKind.Variable);
        equal(Comment.combineDisplayParts(abc.comment?.summary), "abc");

        const abcRef = query(project, "abcRef");
        equal(abcRef.kind, ReflectionKind.Reference);
        equal(
            Comment.combineDisplayParts(abcRef.comment?.summary),
            "export abc"
        );

        const foo = query(project, "foo");
        equal(Comment.combineDisplayParts(foo.comment?.summary), "export foo");
    },

    _externalSymbols(app) {
        app.options.setValue("externalSymbolLinkMappings", {
            global: {
                Promise: "/promise",
            },
            typescript: {
                Promise: "/promise2",
            },
            "@types/marked": {
                Lexer: "https://marked.js.org/using_pro#lexer",
                "*": "https://marked.js.org",
            },
        });
    },
    externalSymbols(project) {
        const p = query(project, "P");
        equal(p.comment?.summary?.[1], {
            kind: "inline-tag",
            tag: "@link",
            target: "/promise",
            text: "!Promise",
        });

        equal(p.type?.type, "reference" as const);
        equal(p.type.externalUrl, "/promise2");

        const m = query(project, "L");
        equal(m.type?.type, "reference" as const);
        equal(m.type.externalUrl, "https://marked.js.org/using_pro#lexer");

        const s = query(project, "S");
        equal(s.type?.type, "reference" as const);
        equal(s.type.externalUrl, "https://marked.js.org");
    },

    groupTag(project) {
        const A = query(project, "A");
        const B = query(project, "B");
        const C = query(project, "C");

        equal(
            project.groups?.map((g) => g.title),
            ["A", "B", "With Spaces"]
        );

        equal(
            project.groups.map((g) => g.children),
            [[A, B], [B], [C]]
        );
    },

    hiddenAccessor(project) {
        const test = query(project, "Test");
        equal(
            test.children?.map((c) => c.name),
            ["constructor", "auto", "x", "y"]
        );
    },

    inheritDocBasic(project) {
        const target = query(project, "InterfaceTarget");
        const comment = new Comment(
            [{ kind: "text", text: "Summary" }],
            [new CommentTag("@remarks", [{ kind: "text", text: "Remarks" }])]
        );
        equal(target.comment, comment);

        equal(
            Comment.combineDisplayParts(
                target.typeParameters?.[0].comment?.summary
            ),
            "Type parameter"
        );

        const prop = query(project, "InterfaceTarget.property");
        equal(
            Comment.combineDisplayParts(prop.comment?.summary),
            "Property description"
        );

        const meth = query(project, "InterfaceTarget.someMethod");
        const methodComment = new Comment(
            [{ kind: "text", text: "Method description" }],
            [
                new CommentTag("@example", [
                    { kind: "text", text: "This should still be present\n" },
                    { kind: "code", text: "```ts\nsomeMethod(123)\n```" },
                ]),
            ]
        );
        equal(meth.signatures?.[0].comment, methodComment);
    },

    inheritDocJsdoc(project) {
        const fooComment = query(project, "Foo").comment;
        const fooMemberComment = query(project, "Foo.member").signatures?.[0]
            .comment;
        const xComment = query(project, "Foo.member").signatures?.[0]
            .parameters?.[0].comment;

        ok(fooComment, "Foo");
        ok(fooMemberComment, "Foo.member");
        ok(xComment, "Foo.member.x");

        for (const name of ["Bar", "Baz"]) {
            equal(query(project, name).comment, fooComment, name);
        }

        for (const name of ["Bar.member", "Baz.member"]) {
            const refl = query(project, name);
            equal(refl.signatures?.length, 1, name);

            equal(
                refl.signatures[0].comment,
                fooMemberComment,
                `${name} signature`
            );
            equal(
                refl.signatures[0].parameters?.[0].comment,
                xComment,
                `${name} parameter`
            );
        }
    },

    inheritDocRecursive(project, logger) {
        const a = query(project, "A");
        equal(a.comment?.getTag("@inheritDoc")?.name, "B");

        const b = query(project, "B");
        equal(b.comment?.getTag("@inheritDoc")?.name, "C");

        const c = query(project, "C");
        equal(c.comment?.getTag("@inheritDoc")?.name, "A");

        logger.expectMessage(
            "warn: @inheritDoc specifies a circular inheritance chain: B -> C -> A -> B"
        );
    },

    inheritDocWarnings(project, logger) {
        const target1 = query(project, "target1");
        equal(Comment.combineDisplayParts(target1.comment?.summary), "Source");
        equal(
            Comment.combineDisplayParts(
                target1.comment?.getTag("@remarks")?.content
            ),
            "Remarks"
        );
        logger.expectMessage(
            "warn: Content in the summary section will be overwritten by the @inheritDoc tag in comment at ./src/test/converter2/behavior/inheritDocWarnings.ts:10"
        );

        const target2 = query(project, "target2");
        equal(Comment.combineDisplayParts(target2.comment?.summary), "Source");
        equal(
            Comment.combineDisplayParts(
                target2.comment?.getTag("@remarks")?.content
            ),
            "Remarks"
        );
        logger.expectMessage(
            "warn: Content in the @remarks block will be overwritten by the @inheritDoc tag in comment at ./src/test/converter2/behavior/inheritDocWarnings.ts:16"
        );

        const target3 = query(project, "target3");
        ok(target3.comment?.getTag("@inheritDoc"));
        logger.expectMessage(
            'warn: Failed to find "doesNotExist" to inherit the comment from in the comment for target3'
        );

        const target4 = query(project, "target4");
        ok(target4.comment?.getTag("@inheritDoc"));
        logger.expectMessage(
            "warn: target4 tried to copy a comment from source2 with @inheritDoc, but the source has no associated comment."
        );

        logger.expectMessage(
            "warn: Declaration reference in @inheritDoc for badParse was not fully parsed and may resolve incorrectly."
        );

        logger.discardDebugMessages();
        logger.expectNoOtherMessages();
    },

    _lineComment(app) {
        app.options.setValue("commentStyle", CommentStyle.Line);
    },
    lineComment(project) {
        const a = query(project, "a");
        const b = query(project, "b");
        const c = query(project, "c");

        equal(Comment.combineDisplayParts(a.comment?.summary), "docs");
        equal(
            Comment.combineDisplayParts(b.comment?.summary),
            "docs\nwith multiple lines"
        );
        equal(Comment.combineDisplayParts(c.comment?.summary), "");
    },

    _linkResolution(app) {
        app.options.setValue("sort", ["source-order"]);
    },
    linkResolution(project) {
        function getLinks(refl: Reflection) {
            ok(refl.comment);
            return filterMap(refl.comment.summary, (p) => {
                if (p.kind === "inline-tag" && p.tag === "@link") {
                    if (typeof p.target === "string") {
                        return p.target;
                    }
                    if (p.target instanceof SignatureReflection) {
                        return [
                            p.target.getFullName(),
                            p.target.parent.signatures?.indexOf(p.target),
                        ];
                    }
                    return [p.target?.kind, p.target?.getFullName()];
                }
            });
        }

        for (const [refl, target] of [
            ["Scoping.abc", "Scoping.abc"],
            ["Scoping.Foo", "Scoping.Foo.abc"],
            ["Scoping.Foo.abc", "Scoping.Foo.abc"],
            ["Scoping.Bar", "Scoping.abc"],
            ["Scoping.Bar.abc", "Scoping.abc"],
        ] as const) {
            equal(
                getLinks(query(project, refl)).map((x) => x[1]),
                [query(project, target).getFullName()]
            );
        }

        const links = getLinks(query(project, "Meanings"));
        equal(links, [
            [ReflectionKind.Enum, "Meanings.A"],
            [ReflectionKind.Namespace, "Meanings.A"],
            [ReflectionKind.Enum, "Meanings.A"],

            [undefined, undefined],
            [ReflectionKind.Class, "Meanings.B"],

            [ReflectionKind.Interface, "Meanings.C"],
            [ReflectionKind.TypeAlias, "Meanings.D"],
            ["Meanings.E.E", 0],
            [ReflectionKind.Variable, "Meanings.F"],

            ["Meanings.B.constructor.new B", 0],
            ["Meanings.B.constructor.new B", 0],
            ["Meanings.B.constructor.new B", 1],

            [ReflectionKind.EnumMember, "Meanings.A.A"],
            [undefined, undefined],

            ["Meanings.E.E", 0],
            ["Meanings.E.E", 1],

            ["Meanings.B.constructor.new B", 0],
            ["Meanings.B.constructor.new B", 1],

            ["Meanings.B.__index", undefined],
            [ReflectionKind.Interface, "Meanings.G"],

            ["Meanings.E.E", 1],
            [ReflectionKind.Class, "Meanings.B"],
        ]);

        equal(getLinks(query(project, "URLS")), [
            "https://example.com",
            "ftp://example.com",
        ]);

        equal(
            getLinks(query(project, "Globals.A")).map((x) => x[1]),
            ["URLS", "A", "Globals.A"]
        );

        equal(getLinks(query(project, "Navigation")), [
            [ReflectionKind.Method, "Navigation.Child.foo"],
            [ReflectionKind.Property, "Navigation.Child.foo"],
            [undefined, undefined],
        ]);

        const foo = query(project, "Navigation.Child.foo").signatures![0];
        equal(getLinks(foo), [[ReflectionKind.Method, "Navigation.Child.foo"]]);
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

    overloads(project, logger) {
        const foo = query(project, "foo");
        const fooComments = foo.signatures?.map((sig) =>
            Comment.combineDisplayParts(sig.comment?.summary)
        );
        equal(fooComments, ["No arg comment\n", "No arg comment\n"]);
        equal(foo.comment, undefined);

        equal(
            foo.signatures?.map((s) => s.label),
            ["NO_ARGS", "WITH_X"]
        );

        const bar = query(project, "bar");
        const barComments = bar.signatures?.map((sig) =>
            Comment.combineDisplayParts(sig.comment?.summary)
        );
        equal(barComments, ["Implementation comment", "Custom comment"]);
        equal(bar.comment, undefined);

        logger.expectMessage(
            'warn: The label "bad" for badLabel cannot be referenced with a declaration reference. Labels may only contain A-Z, 0-9, and _, and may not start with a number.'
        );
        logger.discardDebugMessages();
        logger.expectNoOtherMessages();
    },

    readonlyTag(project) {
        const title = query(project, "Book.title");
        const author = query(project, "Book.author");

        ok(!title.setSignature);
        ok(author.flags.isReadonly);
    },

    removeReflection(project) {
        const foo = query(project, "foo");
        project.removeReflection(foo);
        equal(
            Object.values(project.reflections).map((r) => r.name),
            ["typedoc"]
        );
    },

    seeTags(project) {
        const foo = query(project, "foo");
        equal(
            Comment.combineDisplayParts(foo.comment?.getTag("@see")?.content),
            " - Double tag\n - Second tag\n"
        );

        const bar = query(project, "bar");
        equal(
            Comment.combineDisplayParts(bar.comment?.getTag("@see")?.content),
            "Single tag"
        );
    },

    _searchCategoryBoosts(app) {
        app.options.setValue("searchCategoryBoosts", {
            Cat0: 0,
            Cat1: 2.0,
            Cat2: 1.5,
            CatUnused: 999,
        });
    },
    searchCategoryBoosts(project, logger) {
        const a = query(project, "A");
        const b = query(project, "B");
        const c = query(project, "C");
        equal(a.relevanceBoost, 3.0);
        equal(b.relevanceBoost, 0.0);
        equal(c.relevanceBoost, 2.0);
        logger.expectMessage(
            "warn: Not all categories specified in searchCategoryBoosts were used in the documentation." +
                " The unused categories were:\n\tCatUnused"
        );
        logger.discardDebugMessages();
        logger.expectNoOtherMessages();
    },

    _searchGroupBoosts(app) {
        app.options.setValue("searchGroupBoosts", {
            Group0: 0,
            Group1: 2.0,
            Group2: 1.5,
            GroupUnused: 999,
            Interfaces: 0.5,
        });
    },
    searchGroupBoosts(project, logger) {
        const a = query(project, "A");
        const b = query(project, "B");
        const c = query(project, "C");
        const d = query(project, "D");
        equal(a.relevanceBoost, 3.0);
        equal(b.relevanceBoost, 0.0);
        equal(c.relevanceBoost, 2.0);
        equal(d.relevanceBoost, 0.5);
        logger.expectMessage(
            "warn: Not all groups specified in searchGroupBoosts were used in the documentation." +
                " The unused groups were:\n\tGroupUnused"
        );
        logger.discardDebugMessages();
        logger.expectNoOtherMessages();
    },
};
