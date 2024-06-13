import { deepStrictEqual as equal, ok } from "assert";
import {
    LiteralType,
    ReflectionKind,
    Comment,
    CommentTag,
    Reflection,
    SignatureReflection,
    type ContainerReflection,
} from "../lib/models";
import { filterMap } from "../lib/utils";
import { CommentStyle } from "../lib/utils/options/declaration";
import { TestLogger } from "./TestLogger";
import {
    getConverter2App,
    getConverter2Base,
    getConverter2Program,
} from "./programs";
import { join } from "path";
import { existsSync } from "fs";
import { clearCommentCache } from "../lib/converter/comments";
import { getComment, query, querySig } from "./utils";

type NameTree = { [name: string]: NameTree | undefined };

function buildNameTree(
    refl: ContainerReflection,
    tree: NameTree = {},
): NameTree {
    for (const child of refl.children || []) {
        tree[child.name] ||= {};
        buildNameTree(child, tree[child.name]);
    }

    return tree;
}

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
            if (p.target instanceof Reflection) {
                return [p.target.kind, p.target.getFullName()];
            }
            return [p.target?.qualifiedName];
        }
    });
}

function getLinkTexts(refl: Reflection) {
    ok(refl.comment);
    return filterMap(refl.comment.summary, (p) => {
        if (p.kind === "inline-tag" && p.tag === "@link") {
            return p.text;
        }
    });
}

const base = getConverter2Base();
const app = getConverter2App();
const program = getConverter2Program();

function convert(...entries: [string, ...string[]]) {
    const entryPoints = entries.map((entry) => {
        const entryPoint = [
            join(base, `behavior/${entry}.ts`),
            join(base, `behavior/${entry}.d.ts`),
            join(base, `behavior/${entry}.tsx`),
            join(base, `behavior/${entry}.js`),
            join(base, "behavior", entry, "index.ts"),
            join(base, "behavior", entry, "index.js"),
        ].find(existsSync);

        ok(entryPoint, `No entry point found for ${entry}`);
        const sourceFile = program.getSourceFile(entryPoint);
        ok(sourceFile, `No source file found for ${entryPoint}`);

        return { displayName: entry, program, sourceFile, entryPoint };
    });

    app.options.setValue(
        "entryPoints",
        entryPoints.map((e) => e.entryPoint),
    );
    clearCommentCache();
    return app.converter.convert(entryPoints);
}

describe("Behavior Tests", () => {
    let logger: TestLogger;
    let optionsSnap: { __optionSnapshot: never };

    beforeEach(() => {
        app.logger = logger = new TestLogger();
        optionsSnap = app.options.snapshot();
    });

    afterEach(() => {
        app.options.restore(optionsSnap);
        logger.expectNoOtherMessages();
    });

    it("Handles 'as const' style enums", () => {
        const project = convert("asConstEnum");
        const SomeEnumLike = query(project, "SomeEnumLike");
        equal(SomeEnumLike.kind, ReflectionKind.Variable, "SomeEnumLike");
        const SomeEnumLikeTagged = query(project, "SomeEnumLikeTagged");
        equal(
            SomeEnumLikeTagged.kind,
            ReflectionKind.Enum,
            "SomeEnumLikeTagged",
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
            "ManualEnumHelper",
        );

        const WithoutReadonly = query(project, "WithoutReadonly");
        equal(WithoutReadonly.kind, ReflectionKind.Enum, "WithoutReadonly");

        const SomeEnumLikeNumeric = query(project, "SomeEnumLikeNumeric");
        equal(
            SomeEnumLikeNumeric.kind,
            ReflectionKind.Variable,
            "SomeEnumLikeNumeric",
        );
        const SomeEnumLikeTaggedNumeric = query(
            project,
            "SomeEnumLikeTaggedNumeric",
        );
        equal(
            SomeEnumLikeTaggedNumeric.kind,
            ReflectionKind.Enum,
            "SomeEnumLikeTaggedNumeric",
        );
        const B = query(project, "SomeEnumLikeTaggedNumeric.b");
        equal(B.type, new LiteralType(1));
        equal(B.defaultValue, undefined);

        const ManualEnumNumeric = query(project, "ManualEnumNumeric");
        equal(ManualEnumNumeric.kind, ReflectionKind.Enum, "ManualEnumNumeric");

        const ManualWithoutHelperNumeric = query(
            project,
            "ManualEnumHelperNumeric",
        );
        equal(
            ManualWithoutHelperNumeric.kind,
            ReflectionKind.Enum,
            "ManualEnumHelperNumeric",
        );

        const WithoutReadonlyNumeric = query(project, "WithoutReadonlyNumeric");
        equal(
            WithoutReadonlyNumeric.kind,
            ReflectionKind.Enum,
            "WithoutReadonlyNumeric",
        );

        const WithInvalidTypeUnionMember = query(
            project,
            "WithInvalidTypeUnionMember",
        );
        equal(
            WithInvalidTypeUnionMember.kind,
            ReflectionKind.Variable,
            "WithInvalidTypeUnionMember",
        );

        const WithNumericExpression = query(project, "WithNumericExpression");
        equal(
            WithNumericExpression.kind,
            ReflectionKind.Enum,
            "WithNumericExpression",
        );
    });

    it("Handles non-jsdoc block comments", () => {
        app.options.setValue("commentStyle", CommentStyle.Block);
        const project = convert("blockComment");
        const a = query(project, "a");
        const b = query(project, "b");

        equal(Comment.combineDisplayParts(a.comment?.summary), "jsdoc block");
        equal(
            Comment.combineDisplayParts(b.comment?.summary),
            "block, but not jsdoc",
        );
    });

    it("Handles const variable namespace", () => {
        const project = convert("constNamespace");
        const someNs = query(project, "someNs");
        equal(someNs.kind, ReflectionKind.Namespace);
        equal(Comment.combineDisplayParts(someNs.comment?.summary), "ns doc");

        const a = query(project, "someNs.a");
        equal(Comment.combineDisplayParts(a.comment?.summary), "a doc");

        const b = query(project, "someNs.b");
        equal(
            Comment.combineDisplayParts(b.signatures?.[0].comment?.summary),
            "b doc",
        );
    });

    it("Should allow the user to mark a variable or function as a class with @class", () => {
        const project = convert("classTag");
        logger.expectMessage(
            `warn: BadClass is being converted as a class, but does not have any construct signatures`,
        );

        const CallableClass = query(project, "CallableClass");
        equal(CallableClass.signatures?.length, 2);
        equal(
            CallableClass.signatures.map((sig) => sig.type?.toString()),
            ["number", "string"],
        );
        equal(
            CallableClass.signatures.map((sig) => sig.flags.isStatic),
            [true, false],
        );
        equal(
            CallableClass.children?.map((child) => [
                child.name,
                ReflectionKind.singularString(child.kind),
            ]),
            [
                [
                    "constructor",
                    ReflectionKind.singularString(ReflectionKind.Constructor),
                ],
                [
                    "inst",
                    ReflectionKind.singularString(ReflectionKind.Property),
                ],
                [
                    "stat",
                    ReflectionKind.singularString(ReflectionKind.Property),
                ],
                [
                    "method",
                    ReflectionKind.singularString(ReflectionKind.Method),
                ],
            ],
        );

        equal(query(project, "CallableClass.stat").flags.isStatic, true);

        equal(
            ["VariableClass", "VariableClass.stat", "VariableClass.inst"].map(
                (name) => getComment(project, name),
            ),
            ["Variable class", "Stat docs", "Inst docs"],
        );

        equal(
            project.children?.map((c) => c.name),
            ["BadClass", "CallableClass", "VariableClass"],
        );
    });

    it("Handles const type parameters", () => {
        const project = convert("constTypeParam");
        const getNamesExactly = query(project, "getNamesExactly");
        const typeParams = getNamesExactly.signatures?.[0].typeParameters;
        equal(typeParams?.length, 1);
        equal(typeParams[0].flags.isConst, true);
    });

    it("Handles declare global 'modules'", () => {
        const project = convert("declareGlobal");
        equal(
            project.children?.map((c) => c.name),
            ["DeclareGlobal"],
        );
    });

    it("Handles duplicate heritage clauses", () => {
        const project = convert("duplicateHeritageClauses");
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
    });

    it("Handles @default tags with JSDoc compat turned on", () => {
        const project = convert("defaultTag");
        const foo = query(project, "foo");
        const tags = foo.comment?.blockTags.map((tag) => tag.content);

        equal(tags, [
            [{ kind: "code", text: "```ts\n\n```" }],
            [{ kind: "code", text: "```ts\nfn({})\n```" }],
        ]);

        logger.expectNoOtherMessages();
    });

    it("Handles @default tags with JSDoc compat turned off", () => {
        app.options.setValue("jsDocCompatibility", false);
        const project = convert("defaultTag");
        const foo = query(project, "foo");
        const tags = foo.comment?.blockTags.map((tag) => tag.content);

        equal(tags, [[], [{ kind: "text", text: "fn({})" }]]);

        logger.expectMessage(
            "warn: Encountered an unescaped open brace without an inline tag",
        );
        logger.expectMessage("warn: Unmatched closing brace");
        logger.expectNoOtherMessages();
    });

    it("Handles @defaultValue tags", () => {
        const project = convert("defaultValueTag");
        const foo = query(project, "foo");
        const tags = foo.comment?.blockTags.map((tag) => tag.content);

        equal(tags, [
            [{ kind: "code", text: "```ts\n\n```" }],
            [{ kind: "code", text: "```ts\nfn({})\n```" }],
        ]);

        logger.expectNoOtherMessages();
    });

    it("Handles @example tags with JSDoc compat turned on", () => {
        const project = convert("exampleTags");
        const foo = query(project, "foo");
        const tags = foo.comment?.blockTags.map((tag) => tag.content);
        const names = foo.comment?.blockTags.map((tag) => tag.name);

        equal(tags, [
            [{ kind: "code", text: "```ts\n// JSDoc style\ncodeHere();\n```" }],
            [
                {
                    kind: "code",
                    text: "```ts\n// JSDoc style\ncodeHere();\n```",
                },
            ],
            [
                {
                    kind: "code",
                    text: "```ts\nx.map(() => { return 1; })\n```",
                },
            ],
            [{ kind: "code", text: "```ts\n// TSDoc style\ncodeHere();\n```" }],
            [{ kind: "code", text: "```ts\n// TSDoc style\ncodeHere();\n```" }],
            [{ kind: "code", text: "```ts\noops();\n```" }],
        ]);

        equal(names, [
            undefined,
            "JSDoc specialness",
            "JSDoc with braces",
            undefined,
            "TSDoc name",
            "Bad {@link} name",
        ]);

        logger.expectMessage(
            "warn: The first line of an example tag will be taken literally as the example name, and should only contain text",
        );
        logger.expectNoOtherMessages();
    });

    it("Warns about example tags containing braces when compat options are off", () => {
        app.options.setValue("jsDocCompatibility", false);
        const project = convert("exampleTags");
        const foo = query(project, "foo");
        const tags = foo.comment?.blockTags.map((tag) => tag.content);
        const names = foo.comment?.blockTags.map((tag) => tag.name);

        equal(tags, [
            [{ kind: "text", text: "// JSDoc style\ncodeHere();" }],
            [
                {
                    kind: "text",
                    text: "// JSDoc style\ncodeHere();",
                },
            ],
            [
                {
                    kind: "text",
                    text: "x.map(() => { return 1; })",
                },
            ],
            [{ kind: "code", text: "```ts\n// TSDoc style\ncodeHere();\n```" }],
            [{ kind: "code", text: "```ts\n// TSDoc style\ncodeHere();\n```" }],
            [{ kind: "code", text: "```ts\noops();\n```" }],
        ]);

        equal(names, [
            undefined,
            "<caption>JSDoc specialness</caption>",
            "<caption>JSDoc with braces</caption>",
            undefined,
            "TSDoc name",
            "Bad {@link} name",
        ]);

        logger.expectMessage(
            "warn: Encountered an unescaped open brace without an inline tag",
        );
        logger.expectMessage("warn: Unmatched closing brace");
        logger.expectMessage(
            "warn: The first line of an example tag will be taken literally as the example name, and should only contain text",
        );
        logger.expectNoOtherMessages();
    });

    it("Handles excludeCategories", () => {
        app.options.setValue("excludeCategories", ["A", "Default"]);
        app.options.setValue("defaultCategory", "Default");
        const project = convert("excludeCategories");
        equal(
            project.children?.map((c) => c.name),
            ["c"],
        );
    });

    it("Handles excludeNotDocumentedKinds", () => {
        app.options.setValue("excludeNotDocumented", true);
        app.options.setValue("excludeNotDocumentedKinds", ["Property"]);
        const project = convert("excludeNotDocumentedKinds");
        equal(buildNameTree(project), {
            NotDoc: {
                prop: {},
            },
            identity: {},
        });
    });

    it("Handles comments on export declarations", () => {
        const project = convert("exportComments");
        const abc = query(project, "abc");
        equal(abc.kind, ReflectionKind.Variable);
        equal(Comment.combineDisplayParts(abc.comment?.summary), "abc");

        const abcRef = query(project, "abcRef");
        equal(abcRef.kind, ReflectionKind.Reference);
        equal(
            Comment.combineDisplayParts(abcRef.comment?.summary),
            "export abc",
        );

        const foo = query(project, "foo");
        equal(Comment.combineDisplayParts(foo.comment?.summary), "export foo");
    });

    it("Handles user defined external symbol links", () => {
        app.options.setValue("externalSymbolLinkMappings", {
            global: {
                Promise: "/promise",
            },
            typescript: {
                Promise: "/promise2",
            },
            "@types/markdown-it": {
                "MarkdownIt.Token":
                    "https://markdown-it.github.io/markdown-it/#Token",
                "*": "https://markdown-it.github.io/markdown-it/",
            },
        });
        const project = convert("externalSymbols");
        const p = query(project, "P");
        equal(p.comment?.summary[1], {
            kind: "inline-tag",
            tag: "@link",
            target: "/promise",
            text: "!Promise",
        });

        equal(p.type?.type, "reference" as const);
        equal(p.type.externalUrl, "/promise2");

        const m = query(project, "T");
        equal(m.type?.type, "reference" as const);
        equal(
            m.type.externalUrl,
            "https://markdown-it.github.io/markdown-it/#Token",
        );

        const s = query(project, "Pr");
        equal(s.type?.type, "reference" as const);
        equal(s.type.externalUrl, "https://markdown-it.github.io/markdown-it/");
    });

    it("Handles @group tag", () => {
        const project = convert("groupTag");
        const A = query(project, "A");
        const B = query(project, "B");
        const C = query(project, "C");
        const D = query(project, "D");

        equal(
            project.groups?.map((g) => g.title),
            ["Variables", "A", "B", "With Spaces"],
        );

        equal(
            project.groups.map((g) =>
                Comment.combineDisplayParts(g.description),
            ),
            ["Variables desc", "A description", "", "With spaces desc"],
        );

        equal(
            project.groups.map((g) => g.children),
            [[D], [A, B], [B], [C]],
        );
    });

    it("Inherits @group tag if comment is not redefined", () => {
        const project = convert("groupInheritance");
        const cls = query(project, "Cls");
        equal(
            cls.groups?.map((g) => g.title),
            ["Constructors", "Group"],
        );
        equal(
            cls.groups.map((g) => g.children),
            [[query(project, "Cls.constructor")], [query(project, "Cls.prop")]],
        );
    });

    it("Inherits @category tag if comment is not redefined", () => {
        app.options.setValue("categorizeByGroup", false);
        const project = convert("categoryInheritance");
        const cls = query(project, "Cls");
        equal(
            cls.categories?.map((g) => g.title),
            ["Cat", "Other"],
        );
        equal(
            cls.categories.map((g) =>
                Comment.combineDisplayParts(g.description),
            ),
            ["Cat desc", ""],
        );
        equal(
            cls.categories.map((g) => g.children),
            [[query(project, "Cls.prop")], [query(project, "Cls.constructor")]],
        );
    });

    it("Handles hidden accessors", () => {
        const project = convert("hiddenAccessor");
        const test = query(project, "Test");
        equal(
            test.children?.map((c) => c.name),
            ["constructor", "auto", "x", "y"],
        );
    });

    it("Handles @hideconstructor", () => {
        const project = convert("hideconstructor");

        ok(!project.getChildByName("StaticOnly.constructor"));
        ok(!!project.getChildByName("StaticOnly.notHidden"));
        ok(!project.getChildByName("IgnoredCtor.constructor"));
    });

    it("Handles simple @inheritDoc cases", () => {
        const project = convert("inheritDocBasic");
        const target = query(project, "InterfaceTarget");
        const comment = new Comment(
            [{ kind: "text", text: "Summary" }],
            [new CommentTag("@remarks", [{ kind: "text", text: "Remarks" }])],
        );
        equal(target.comment, comment);

        equal(
            Comment.combineDisplayParts(
                target.typeParameters?.[0].comment?.summary,
            ),
            "Type parameter",
        );

        const prop = query(project, "InterfaceTarget.property");
        equal(
            Comment.combineDisplayParts(prop.comment?.summary),
            "Property description",
        );

        const meth = query(project, "InterfaceTarget.someMethod");
        const example = new CommentTag("@example", [
            { kind: "code", text: "```ts\nsomeMethod(123)\n```" },
        ]);
        example.name = `This should still be present`;

        const methodComment = new Comment(
            [{ kind: "text", text: "Method description" }],
            [example],
        );
        equal(meth.signatures?.[0].comment, methodComment);
    });

    it("Handles more complicated @inheritDoc cases", () => {
        const project = convert("inheritDocJsdoc");
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
                `${name} signature`,
            );
            equal(
                refl.signatures[0].parameters?.[0].comment,
                xComment,
                `${name} parameter`,
            );
        }
    });

    it("Handles recursive @inheritDoc requests", () => {
        const project = convert("inheritDocRecursive");
        const a = query(project, "A");
        equal(a.comment?.getTag("@inheritDoc")?.name, "B");

        const b = query(project, "B");
        equal(b.comment?.getTag("@inheritDoc")?.name, "C");

        const c = query(project, "C");
        equal(c.comment?.getTag("@inheritDoc")?.name, "A");

        logger.expectMessage(
            "warn: @inheritDoc specifies a circular inheritance chain: B -> C -> A -> B",
        );
    });

    it("Handles @inheritDoc on signatures", () => {
        const project = convert("inheritDocSignature");
        const test1 = query(project, "SigRef.test1");
        equal(test1.signatures?.length, 2);
        equal(
            Comment.combineDisplayParts(test1.signatures[0].comment?.summary),
            "A",
        );
        equal(
            Comment.combineDisplayParts(test1.signatures[1].comment?.summary),
            "B",
        );

        const test2 = query(project, "SigRef.test2");
        equal(
            Comment.combineDisplayParts(test2.signatures?.[0].comment?.summary),
            "C",
        );
    });

    it("Handles @inheritDocs which produce warnings", () => {
        const project = convert("inheritDocWarnings");
        const target1 = query(project, "target1");
        equal(Comment.combineDisplayParts(target1.comment?.summary), "Source");
        equal(
            Comment.combineDisplayParts(
                target1.comment?.getTag("@remarks")?.content,
            ),
            "Remarks",
        );
        logger.expectMessage(
            "warn: Content in the summary section will be overwritten by the @inheritDoc tag in comment at ./src/test/converter2/behavior/inheritDocWarnings.ts:10",
        );

        const target2 = query(project, "target2");
        equal(Comment.combineDisplayParts(target2.comment?.summary), "Source");
        equal(
            Comment.combineDisplayParts(
                target2.comment?.getTag("@remarks")?.content,
            ),
            "Remarks",
        );
        logger.expectMessage(
            "warn: Content in the @remarks block will be overwritten by the @inheritDoc tag in comment at ./src/test/converter2/behavior/inheritDocWarnings.ts:16",
        );

        const target3 = query(project, "target3");
        ok(target3.comment?.getTag("@inheritDoc"));
        logger.expectMessage(
            'warn: Failed to find "doesNotExist" to inherit the comment from in the comment for target3',
        );

        const target4 = query(project, "target4");
        ok(target4.comment?.getTag("@inheritDoc"));
        logger.expectMessage(
            "warn: target4 tried to copy a comment from source2 with @inheritDoc, but the source has no associated comment",
        );

        logger.expectMessage(
            "warn: Declaration reference in @inheritDoc for badParse was not fully parsed and may resolve incorrectly",
        );

        logger.expectNoOtherMessages();
    });

    it("Handles line comments", () => {
        app.options.setValue("commentStyle", CommentStyle.Line);
        const project = convert("lineComment");
        const a = query(project, "a");
        const b = query(project, "b");
        const c = query(project, "c");

        equal(Comment.combineDisplayParts(a.comment?.summary), "docs");
        equal(
            Comment.combineDisplayParts(b.comment?.summary),
            "docs\nwith multiple lines",
        );
        equal(Comment.combineDisplayParts(c.comment?.summary), "");
    });

    it("Handles declaration reference link resolution", () => {
        app.options.setValue("sort", ["source-order"]);
        app.options.setValue("useTsLinkResolution", false);
        const project = convert("linkResolution");
        for (const [refl, target] of [
            ["Scoping.abc", "Scoping.abc"],
            ["Scoping.Foo", "Scoping.Foo.abc"],
            ["Scoping.Foo.abc", "Scoping.Foo.abc"],
            ["Scoping.Bar", "Scoping.abc"],
            ["Scoping.Bar.abc", "Scoping.abc"],
        ] as const) {
            equal(
                getLinks(query(project, refl)).map((x) => x[1]),
                [query(project, target).getFullName()],
            );
        }

        const links = getLinks(query(project, "Meanings"));
        equal(links, [
            [ReflectionKind.Enum, "Meanings.A"],
            [ReflectionKind.Namespace, "Meanings.A"],
            [ReflectionKind.Enum, "Meanings.A"],

            [undefined],
            [ReflectionKind.Class, "Meanings.B"],

            [ReflectionKind.Interface, "Meanings.C"],
            [ReflectionKind.TypeAlias, "Meanings.D"],
            ["Meanings.E.E", 0],
            [ReflectionKind.Variable, "Meanings.F"],

            ["Meanings.B.constructor.new B", 0],
            ["Meanings.B.constructor.new B", 0],
            ["Meanings.B.constructor.new B", 1],

            [ReflectionKind.EnumMember, "Meanings.A.A"],
            [undefined],

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
            ["URLS", "A", "Globals.A"],
        );

        equal(getLinks(query(project, "Navigation")), [
            [ReflectionKind.Method, "Navigation.Child.foo"],
            [ReflectionKind.Property, "Navigation.Child.foo"],
            [undefined],
        ]);

        const foo = query(project, "Navigation.Child.foo").signatures![0];
        equal(getLinks(foo), [[ReflectionKind.Method, "Navigation.Child.foo"]]);
    });

    it("Handles TypeScript based link resolution", () => {
        app.options.setValue("sort", ["source-order"]);
        const project = convert("linkResolutionTs");
        for (const [refl, target] of [
            ["Scoping.abc", "Scoping.abc"],
            ["Scoping.Foo", "Scoping.Foo.abc"],
            ["Scoping.Foo.abc", "Scoping.Foo.abc"],
            ["Scoping.Bar", "Scoping.abc"],
            ["Scoping.Bar.abc", "Scoping.abc"],
        ] as const) {
            equal(
                getLinks(query(project, refl)).map((x) => x[1]),
                [query(project, target).getFullName()],
            );
        }

        const links = getLinks(query(project, "Meanings"));
        equal(links, [
            [ReflectionKind.Namespace, "Meanings"],
            [ReflectionKind.Namespace, "Meanings"],
            [ReflectionKind.Namespace, "Meanings"],

            [ReflectionKind.Enum, "Meanings.A"],
            [ReflectionKind.Class, "Meanings.B"],

            [ReflectionKind.Interface, "Meanings.C"],
            [ReflectionKind.TypeAlias, "Meanings.D"],
            [ReflectionKind.Function, "Meanings.E"],
            [ReflectionKind.Variable, "Meanings.F"],

            [ReflectionKind.Class, "Meanings.B"],
            [ReflectionKind.Class, "Meanings.B"],
            [ReflectionKind.Class, "Meanings.B"],

            [ReflectionKind.EnumMember, "Meanings.A.A"],
            [ReflectionKind.Property, "Meanings.B.prop"],

            [ReflectionKind.Function, "Meanings.E"],
            [ReflectionKind.Function, "Meanings.E"],

            [ReflectionKind.Class, "Meanings.B"],
            [ReflectionKind.Class, "Meanings.B"],

            [ReflectionKind.Class, "Meanings.B"],
            [ReflectionKind.Interface, "Meanings.G"],

            [ReflectionKind.Function, "Meanings.E"],
            [ReflectionKind.Class, "Meanings.B"],
        ]);

        equal(getLinks(query(project, "URLS")), [
            "https://example.com",
            "ftp://example.com",
        ]);

        equal(
            getLinks(query(project, "Globals.A")).map((x) => x[1]),
            ["URLS", "A", "Globals.A"],
        );

        equal(getLinks(query(project, "Navigation")), [
            [ReflectionKind.Namespace, "Navigation"],
            [ReflectionKind.Property, "Navigation.Child.foo"],
            [ReflectionKind.Class, "Navigation.Child"],
        ]);

        const foo = query(project, "Navigation.Child.foo").signatures![0];
        equal(getLinks(foo), [[ReflectionKind.Method, "Navigation.Child.foo"]]);

        const localSymbolRef = query(project, "localSymbolRef");

        equal(getLinks(localSymbolRef), [
            [ReflectionKind.Variable, "A"],
            [ReflectionKind.Variable, "A"],
            [ReflectionKind.Variable, "A"],
        ]);
        equal(getLinkTexts(localSymbolRef), ["A!", "A2!", "AnotherName"]);

        equal(getLinks(query(project, "scoped")), [
            [ReflectionKind.Property, "Meanings.B.prop"],
        ]);
        equal(getLinkTexts(query(project, "scoped")), ["p"]);
    });

    it("Handles merged declarations", () => {
        const project = convert("mergedDeclarations");
        const a = query(project, "SingleCommentMultiDeclaration");
        equal(
            Comment.combineDisplayParts(a.comment?.summary),
            "Comment on second declaration",
        );

        const b = query(project, "MultiCommentMultiDeclaration");
        equal(Comment.combineDisplayParts(b.comment?.summary), "Comment 1");

        logger.expectMessage(
            "warn: MultiCommentMultiDeclaration has multiple declarations with a comment. An arbitrary comment will be used",
        );
        logger.expectMessage(
            "info: The comments for MultiCommentMultiDeclaration are declared at*",
        );
    });

    it("Handles named tuple declarations", () => {
        const project = convert("namedTupleMembers");

        equal(
            query(project, "PartiallyNamedTuple").type?.toString(),
            "[name: string, number]",
        );
        equal(
            query(project, "PartiallyNamedTuple2").type?.toString(),
            "[name?: string, number?]",
        );
        equal(
            query(project, "PartiallyNamedTupleRest").type?.toString(),
            "[name?: string, ...number[]]",
        );
        equal(
            query(project, "partiallyNamedTupleRest").type?.toString(),
            "[name?: string, ...number[]]",
        );
    });

    it("Handles overloads", () => {
        const project = convert("overloads");
        const foo = query(project, "foo");
        const fooComments = foo.signatures?.map((sig) =>
            Comment.combineDisplayParts(sig.comment?.summary),
        );
        equal(fooComments, ["No arg comment\n", "No arg comment\n"]);
        equal(foo.comment, undefined);

        equal(
            foo.signatures?.map((s) => s.comment?.label),
            ["NO_ARGS", "WITH_X"],
        );

        const bar = query(project, "bar");
        const barComments = bar.signatures?.map((sig) =>
            Comment.combineDisplayParts(sig.comment?.summary),
        );
        equal(barComments, ["", "Custom comment"]);
        equal(
            Comment.combineDisplayParts(bar.comment?.summary),
            "Implementation comment",
        );

        logger.expectMessage(
            'warn: The label "bad" for badLabel cannot be referenced with a declaration reference. Labels may only contain A-Z, 0-9, and _, and may not start with a number',
        );
        logger.expectNoOtherMessages();
    });

    it("Handles @overload tags", () => {
        const project = convert("overloadTags");
        const printValue = query(project, "printValue");
        equal(printValue.signatures?.length, 2);

        const [first, second] = printValue.signatures;

        equal(first.parameters?.length, 1);
        equal(
            Comment.combineDisplayParts(first.parameters[0].comment?.summary),
            "first docs",
        );

        equal(second.parameters?.length, 2);
        equal(
            Comment.combineDisplayParts(second.parameters[0].comment?.summary),
            "second docs",
        );
    });

    it("Handles @readonly tag", () => {
        const project = convert("readonlyTag");
        const title = query(project, "Book.title");
        const author = query(project, "Book.author");

        ok(!title.setSignature);
        ok(author.flags.isReadonly);
    });

    it("Removes all children of a reflection when the reflection is removed.", () => {
        const project = convert("removeReflection");
        project.removeReflection(query(project, "foo"));
        project.removeReflection(query(project, "nested"));
        equal(
            Object.values(project.reflections).map((r) => r.name),
            ["typedoc"],
        );
    });

    it("Handles searchCategoryBoosts", () => {
        app.options.setValue("searchCategoryBoosts", {
            Cat0: 0,
            Cat1: 2.0,
            Cat2: 1.5,
            CatUnused: 999,
        });
        const project = convert("searchCategoryBoosts");
        const a = query(project, "A");
        const b = query(project, "B");
        const c = query(project, "C");
        equal(a.relevanceBoost, 3.0);
        equal(b.relevanceBoost, 0.0);
        equal(c.relevanceBoost, 2.0);
        logger.expectMessage(
            "warn: Not all categories specified in searchCategoryBoosts were used in the documentation." +
                " The unused categories were:\n\tCatUnused",
        );
        logger.expectNoOtherMessages();
    });

    it("Handles searchGroupBoosts", () => {
        app.options.setValue("searchGroupBoosts", {
            Group0: 0,
            Group1: 2.0,
            Group2: 1.5,
            GroupUnused: 999,
            Interfaces: 0.5,
        });
        const project = convert("searchGroupBoosts");
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
                " The unused groups were:\n\tGroupUnused",
        );
        logger.expectNoOtherMessages();
    });

    it("Handles @see tags", () => {
        const project = convert("seeTags");
        const foo = query(project, "foo");
        equal(
            Comment.combineDisplayParts(foo.comment?.getTag("@see")?.content),
            " - Double tag\n - Second tag\n",
        );

        const bar = query(project, "bar");
        equal(
            Comment.combineDisplayParts(bar.comment?.getTag("@see")?.content),
            "Single tag",
        );
    });

    it("Handles type aliases marked with @interface", () => {
        const project = convert("typeAliasInterface");
        const bar = query(project, "Bar");
        equal(bar.kind, ReflectionKind.Interface);
        equal(
            bar.children?.map((c) => c.name),
            ["a", "b"],
        );

        const comments = [bar, bar.children[0], bar.children[1]].map((r) =>
            Comment.combineDisplayParts(r.comment?.summary),
        );

        equal(comments, ["Bar docs", "Bar.a docs", "Foo.b docs"]);
    });

    it("Allows specifying group sort order #2251", () => {
        app.options.setValue("groupOrder", ["B", "Variables", "A"]);
        const project = convert("groupTag");
        equal(
            project.groups?.map((g) => g.title),
            ["B", "Variables", "A", "With Spaces"],
        );
    });

    it("Supports disabling sorting of entry points #2393", () => {
        app.options.setValue("sort", ["alphabetical"]);
        const project = convert("blockComment", "asConstEnum");
        equal(
            project.children?.map((c) => c.name),
            ["asConstEnum", "blockComment"],
        );

        app.options.setValue("sortEntryPoints", false);
        const project2 = convert("blockComment", "asConstEnum");
        equal(
            project2.children?.map((c) => c.name),
            ["blockComment", "asConstEnum"],
        );
    });

    it("Respects resolution-mode when resolving types", () => {
        app.options.setValue("excludeExternals", false);
        const MergedType = query(convert("resolutionMode"), "MergedType");
        equal(
            MergedType.children?.map((child) => child.name),
            ["cjs", "esm"],
        );
    });

    it("Special cases some `this` type occurrences", () => {
        const project = convert("thisType");
        equal(query(project, "ThisClass.prop").type?.toString(), "ThisClass"); // Not special cased
        equal(
            querySig(project, "ThisClass.returnThisImplicit").type?.toString(),
            "ThisClass",
        ); // Not special cased

        equal(
            querySig(project, "ThisClass.returnThis").type?.toString(),
            "this",
        );
        equal(
            querySig(
                project,
                "ThisClass.paramThis",
            ).parameters?.[0].type?.toString(),
            "this",
        );
    });

    it("Handles renaming of destructured parameters via @param tag name inference", () => {
        const project = convert("destructuredParamRenames");

        const params = (name: string) =>
            querySig(project, name).parameters?.map((p) => p.name);

        equal(params("functionWithADestructuredParameter"), [
            "destructuredParam",
        ]);

        equal(params("functionWithADestructuredParameterAndExtraParameters"), [
            "__namedParameters",
            "extraParameter",
        ]);

        equal(
            params(
                "functionWithADestructuredParameterAndAnExtraParamDirective",
            ),
            ["__namedParameters"],
        );

        const logs = [
            'warn: The signature functionWithADestructuredParameterAndExtraParameters has an @param with name "destructuredParam", which was not used',
            'warn: The signature functionWithADestructuredParameterAndExtraParameters has an @param with name "destructuredParam.paramZ", which was not used',
            'warn: The signature functionWithADestructuredParameterAndExtraParameters has an @param with name "destructuredParam.paramG", which was not used',
            'warn: The signature functionWithADestructuredParameterAndExtraParameters has an @param with name "destructuredParam.paramA", which was not used',
            'warn: The signature functionWithADestructuredParameterAndAnExtraParamDirective has an @param with name "fakeParameter", which was not used',
            'warn: The signature functionWithADestructuredParameterAndAnExtraParamDirective has an @param with name "destructuredParam", which was not used',
            'warn: The signature functionWithADestructuredParameterAndAnExtraParamDirective has an @param with name "destructuredParam.paramZ", which was not used',
            'warn: The signature functionWithADestructuredParameterAndAnExtraParamDirective has an @param with name "destructuredParam.paramG", which was not used',
            'warn: The signature functionWithADestructuredParameterAndAnExtraParamDirective has an @param with name "destructuredParam.paramA", which was not used',
        ];
        for (const log of logs) {
            logger.expectMessage(log);
        }
        logger.expectNoOtherMessages();
    });

    it("Should not warn about recursive types", () => {
        const project = convert("refusingToRecurse");
        const schemaTypeBased = query(project, "schemaTypeBased");
        equal(schemaTypeBased.type?.toString(), "Object & Object");
        equal(
            querySig(project, "Map.getFilter").type?.toString(),
            "void | ExpressionSpecification",
        );

        logger.expectNoMessage("debug: Refusing to recurse*");
    });

    it("Handles NoInfer intrinsic type", () => {
        const project = convert("noInfer");
        const sig = querySig(project, "createStreetLight");
        equal(sig.parameters?.length, 2);
        equal(sig.parameters[0].type?.toString(), "C[]");
        equal(sig.parameters[1].type?.toString(), "NoInfer<C>");
    });

    it("Handles inferred predicate functions from TS 5.5", () => {
        const project = convert("inferredPredicates");
        const sig = querySig(project, "isNumber");
        equal(sig.type?.toString(), "x is number");
        const sig2 = querySig(project, "isNonNullish");
        equal(sig2.type?.toString(), "x is NonNullable<T>");
    });

    it("Cascades specified modifier tags to child reflections, #2056", () => {
        const project = convert("cascadedModifiers");

        const mods = (s: string) => query(project, s).comment?.modifierTags;
        const sigMods = (s: string) =>
            querySig(project, s).comment?.modifierTags;

        equal(mods("BetaStuff"), new Set(["@beta"]));
        equal(mods("BetaStuff.AlsoBeta"), new Set(["@beta"]));
        equal(mods("BetaStuff.AlsoBeta.betaFish"), new Set());
        equal(mods("BetaStuff.AlsoBeta.alphaFish"), new Set());

        equal(sigMods("BetaStuff.AlsoBeta.betaFish"), new Set(["@beta"]));
        equal(sigMods("BetaStuff.AlsoBeta.alphaFish"), new Set(["@alpha"]));

        logger.expectMessage(
            "warn: The modifier tag @alpha is mutually exclusive with @beta in the comment for mutuallyExclusive",
        );
    });
});
