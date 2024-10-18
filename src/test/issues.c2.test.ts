import {
    deepStrictEqual as equal,
    notDeepStrictEqual as notEqual,
    ok,
} from "assert";
import { existsSync } from "fs";
import { join } from "path";
import { clearCommentCache } from "../lib/converter/comments";
import {
    Comment,
    CommentTag,
    DeclarationReflection,
    IntrinsicType,
    LiteralType,
    type ProjectReflection,
    QueryType,
    ReferenceReflection,
    ReflectionKind,
    ReflectionSymbolId,
    ReflectionType,
    SignatureReflection,
    UnionType,
} from "../lib/models";
import type { InlineTagDisplayPart } from "../lib/models/comments/comment";
import {
    getConverter2App,
    getConverter2Base,
    getConverter2Program,
} from "./programs";
import { TestLogger } from "./TestLogger";
import {
    equalKind,
    getComment,
    getLinks,
    getSigComment,
    query,
    querySig,
} from "./utils";
import { DefaultTheme, PageEvent } from "..";

const base = getConverter2Base();
const app = getConverter2App();
const program = getConverter2Program();

function doConvert(entry: string) {
    const entryPoint = [
        join(base, `issues/${entry}.ts`),
        join(base, `issues/${entry}.d.ts`),
        join(base, `issues/${entry}.tsx`),
        join(base, `issues/${entry}.js`),
        join(base, "issues", entry, "index.ts"),
        join(base, "issues", entry, "index.js"),
    ].find(existsSync);

    ok(entryPoint, `No entry point found for ${entry}`);
    const sourceFile = program.getSourceFile(entryPoint);
    ok(sourceFile, `No source file found for ${entryPoint}`);

    app.options.setValue("entryPoints", [entryPoint]);
    clearCommentCache();
    return app.converter.convert([
        {
            displayName: entry,
            program,
            sourceFile,
        },
    ]);
}

describe("Issue Tests", () => {
    let logger: TestLogger;
    let convert: (name?: string) => ProjectReflection;
    let optionsSnap: { __optionSnapshot: never };

    beforeEach(function () {
        app.logger = logger = new TestLogger();
        optionsSnap = app.options.snapshot();
        const issueNumber = this.currentTest?.title.match(/#(\d+)/)?.[1];
        ok(issueNumber, "Test name must contain an issue number.");
        convert = (name = `gh${issueNumber}`) => doConvert(name);
    });

    afterEach(() => {
        app.options.restore(optionsSnap);
        logger.expectNoOtherMessages();
    });

    it("#567", () => {
        const project = convert();
        const foo = query(project, "foo");
        const sig = foo.signatures?.[0];
        ok(sig, "Missing signature");
        ok(sig.comment, "No comment for signature");
        const param = sig.parameters?.[0];
        equal(param?.name, "x");
        equal(
            Comment.combineDisplayParts(param.comment?.summary),
            "JSDoc style param name",
        );
    });

    it("#671", () => {
        const project = convert();
        const toNumber = query(project, "toNumber");
        const sig = toNumber.signatures?.[0];
        ok(sig, "Missing signatures");

        const paramComments = sig.parameters?.map((param) =>
            Comment.combineDisplayParts(param.comment?.summary),
        );
        equal(paramComments, [
            "the string to parse as a number",
            "whether to parse as an integer or float",
        ]);
    });

    it("#869", () => {
        const project = convert();
        const classFoo = project.children?.find(
            (r) => r.name === "Foo" && r.kind === ReflectionKind.Class,
        );
        ok(classFoo instanceof DeclarationReflection);
        equal(
            classFoo.children?.find((r) => r.name === "x"),
            undefined,
        );

        const nsFoo = project.children?.find(
            (r) => r.name === "Foo" && r.kind === ReflectionKind.Namespace,
        );
        ok(nsFoo instanceof DeclarationReflection);
        ok(nsFoo.children?.find((r) => r.name === "x"));
    });

    it("#941 Supports computed names ", () => {
        const project = convert();
        const obj = query(project, "Obj");
        equal(
            obj.type?.visit({
                reflection(r) {
                    return r.declaration.children?.map((c) => c.name);
                },
            }),
            ["[propertyName2]", "p1"],
        );
    });

    it("#1124", () => {
        const project = convert();
        equal(
            project.children?.length,
            1,
            "Namespace with type and value converted twice",
        );
    });

    it("#1150", () => {
        const project = convert();
        const refl = query(project, "IntersectFirst");
        equal(refl.kind, ReflectionKind.TypeAlias);
        equal(refl.type?.type, "indexedAccess");
    });

    it("#1164", () => {
        const project = convert();
        const refl = query(project, "gh1164");
        equal(
            Comment.combineDisplayParts(
                refl.signatures?.[0]?.parameters?.[0]?.comment?.summary,
            ),
            "{@link CommentedClass} Test description.",
        );
        const tag = refl.signatures?.[0]?.comment?.blockTags.find(
            (x) => x.tag === "@returns",
        );
        ok(tag);
        equal(Comment.combineDisplayParts(tag.content), "Test description.");
    });

    it("#1215", () => {
        const project = convert();
        const foo = query(project, "Foo.bar");
        ok(foo.setSignature instanceof SignatureReflection);
        equal(foo.setSignature.type?.toString(), "void");
    });

    it("#1255", () => {
        const project = convert();
        const foo = query(project, "C.foo");
        equal(Comment.combineDisplayParts(foo.comment?.summary), "Docs!");
    });

    it("#1261", () => {
        const project = convert();
        const prop = query(project, "X.prop");
        equal(
            Comment.combineDisplayParts(prop.comment?.summary),
            "The property of X.",
        );
    });

    it("#1330", () => {
        const project = convert();
        const example = query(project, "ExampleParam");
        equal(example.type?.type, "reference");
        equal(example.type.toString(), "Example");
    });

    it("#1366", () => {
        const project = convert();
        const foo = query(project, "GH1366.Foo");
        equal(foo.kind, ReflectionKind.Reference);
    });

    it("#1408", () => {
        const project = convert();
        const foo = querySig(project, "foo");
        const type = foo.typeParameters?.[0].type;
        equal(type?.toString(), "unknown[]");
    });

    it("#1436", () => {
        const project = convert();
        equal(
            project.children?.map((c) => c.name),
            ["gh1436"],
        );
    });

    it("#1449", () => {
        const project = convert();
        const refl = query(project, "gh1449").signatures?.[0];
        equal(
            refl?.typeParameters?.[0].type?.toString(),
            "[foo: any, bar?: any]",
        );
    });

    it("#1454", () => {
        const project = convert();
        const foo = querySig(project, "foo");
        equal(foo.type?.type, "reference");
        equal(foo.type.toString(), "Foo");

        const bar = querySig(project, "bar");
        equal(bar.type?.type, "reference");
        equal(bar.type.toString(), "Bar");
    });

    it("#1462", () => {
        const project = convert();
        const prop = query(project, "PROP");
        equal(prop.type?.toString(), "number");

        // Would be nice to get this to work someday
        equal(prop.comment?.summary, void 0);

        const method = query(project, "METHOD");
        equal(
            Comment.combineDisplayParts(
                method.signatures?.[0].comment?.summary,
            ),
            "method docs",
        );
    });

    it("#1481", () => {
        const project = convert();
        const signature = query(project, "GH1481.static").signatures?.[0];
        equal(
            Comment.combineDisplayParts(signature?.comment?.summary),
            "static docs",
        );
        equal(signature?.type?.toString(), "void");
    });

    it("#1483", () => {
        const project = convert();
        equal(
            query(project, "gh1483.namespaceExport").kind,
            ReflectionKind.Method,
        );
        equal(
            query(project, "gh1483_2.staticMethod").kind,
            ReflectionKind.Method,
        );
    });

    it("#1490", () => {
        const project = convert();
        const refl = query(project, "GH1490.optionalMethod");
        equal(
            Comment.combineDisplayParts(refl.signatures?.[0]?.comment?.summary),
            "With comment",
        );
    });

    it("#1509", () => {
        const project = convert();
        const pFoo = query(project, "PartialFoo.foo");
        equal(pFoo.flags.isOptional, true);

        const rFoo = query(project, "ReadonlyFoo.foo");
        equal(rFoo.flags.isReadonly, true);
        equal(rFoo.flags.isOptional, true);
    });

    it("#1514", () => {
        const project = convert();
        // Not ideal. Really we want to handle these names nicer...
        query(project, "ComputedUniqueName.[UNIQUE_SYMBOL]");
    });

    it("#1522", () => {
        app.options.setValue("categorizeByGroup", true);
        const project = convert();
        equal(
            project.groups?.map((g) => g.categories?.map((c) => c.title)),
            [["cat"]],
        );
    });

    it("#1524", () => {
        const project = convert();
        const nullableParam = query(project, "nullable").signatures?.[0]
            ?.parameters?.[0];
        equal(nullableParam?.type?.toString(), "null | string");

        const nonNullableParam = query(project, "nonNullable").signatures?.[0]
            ?.parameters?.[0];
        equal(nonNullableParam?.type?.toString(), "string");
    });

    it("#1534", () => {
        const project = convert();
        const func = query(project, "gh1534");
        equal(
            func.signatures?.[0]?.parameters?.[0]?.type?.toString(),
            "readonly [number, string]",
        );
    });

    it("#1547", () => {
        const project = convert();
        equal(
            project.children?.map((c) => c.name),
            ["Test", "ThingA", "ThingB"],
        );
    });

    it("#1552", () => {
        const project = convert();
        equal(query(project, "emptyArr").defaultValue, "[]");
        equal(query(project, "nonEmptyArr").defaultValue, "...");
        equal(query(project, "emptyObj").defaultValue, "{}");
        equal(query(project, "nonEmptyObj").defaultValue, "...");
    });

    it("#1578", () => {
        const project = convert();
        ok(query(project, "notIgnored"));
        ok(
            !project.getChildByName("ignored"),
            "Symbol re-exported from ignored file is ignored.",
        );
    });

    it("#1580", () => {
        const project = convert();
        ok(
            query(project, "B.prop").hasComment(),
            "Overwritten property with no comment should be inherited",
        );
        ok(
            query(project, "B.run").signatures?.[0]?.hasComment(),
            "Overwritten method with no comment should be inherited",
        );
    });

    it("#1624", () => {
        const project = convert();
        // #1637
        equal(query(project, "Bar.baz").kind, ReflectionKind.Property);

        equal(
            Comment.combineDisplayParts(
                query(project, "Foo.baz").comment?.summary,
            ),
            "Some property style doc.",
            "Property methods declared in interface should still allow comment inheritance",
        );
    });

    it("#1626", () => {
        const project = convert();
        const ctor = query(project, "Foo.constructor");
        equal(ctor.sources?.[0]?.line, 2);
        equal(ctor.sources[0].character, 4);
    });

    it("#1651 Handles comment discovery with expando functions ", () => {
        const project = convert();
        equal(
            project.children?.map((c) => c.name),
            ["bar"],
        );

        equal(
            project.children[0].children?.map((c) => c.name),
            ["metadata", "fn"],
        );

        const comments = [
            query(project, "bar"),
            query(project, "bar.metadata"),
            querySig(project, "bar.fn"),
            querySig(project, "bar"),
        ].map((r) => Comment.combineDisplayParts(r.comment?.summary));

        equal(comments, ["bar", "metadata", "fn", ""]);
    });

    it("#1660", () => {
        const project = convert();
        const alias = query(project, "SomeType");
        ok(alias.type instanceof QueryType);
        equal(alias.type.queryType.name, "m.SomeClass.someProp");
    });

    it("#1733", () => {
        const project = convert();
        const alias = query(project, "Foo");
        equal(alias.typeParameters?.[0].comment?.summary, [
            { kind: "text", text: "T docs" },
        ]);
        const cls = query(project, "Bar");
        equal(cls.typeParameters?.[0].comment?.summary, [
            { kind: "text", text: "T docs" },
        ]);
    });

    it("#1734", () => {
        const project = convert();
        const alias = query(project, "Foo");

        const expectedComment = new Comment();
        expectedComment.blockTags = [
            new CommentTag("@asdf", [
                { kind: "text", text: "Some example text" },
            ]),
        ];
        equal(alias.comment, expectedComment);

        logger.expectMessage("warn: Encountered an unknown block tag @asdf");
    });

    it("#1745", () => {
        app.options.setValue("categorizeByGroup", true);
        const project = convert();
        const Foo = query(project, "Foo");
        ok(Foo.type instanceof ReflectionType, "invalid type");

        const group = project.groups?.find((g) => g.title === "Type Aliases");
        ok(group, "missing group");
        const cat = group.categories?.find(
            (cat) => cat.title === "My category",
        );
        ok(cat, "missing cat");

        ok(cat.children.includes(Foo), "not included in cat");
        ok(!Foo.comment?.getTag("@category"), "has cat tag");
        ok(!Foo.type.declaration.comment?.getTag("@category"), "has cat tag 2");
        ok(
            !Foo.type.declaration.signatures?.some((s) =>
                s.comment?.getTag("@category"),
            ),
            "has cat tag 3",
        );
    });

    it("#1770", () => {
        const project = convert();
        const sym1 = query(project, "sym1");
        equal(
            Comment.combineDisplayParts(sym1.comment?.summary),
            "Docs for Sym1",
        );

        const sym2 = query(project, "sym2");
        equal(
            Comment.combineDisplayParts(sym2.comment?.summary),
            "Docs for Sym2",
        );
    });

    it("#1771", () => {
        const project = convert();
        const check = query(project, "check");
        const tag = check.comment?.summary[0] as
            | InlineTagDisplayPart
            | undefined;
        equal(tag?.kind, "inline-tag");
        equal(tag.text, "Test2.method");
        ok(
            tag.target === query(project, "Test.method"),
            "Incorrect resolution",
        );
    });

    it("#1795", () => {
        const project = convert();
        equal(
            project.children?.map((c) => c.name),
            ["default", "foo"],
        );
        ok(project.children[0].kind === ReflectionKind.Reference);
        ok(project.children[1].kind !== ReflectionKind.Reference);
    });

    it("#1804", () => {
        const project = convert();
        const foo = query(project, "foo");
        const sig = foo.signatures?.[0];
        ok(sig);
        const param = sig.parameters?.[0];
        ok(param);
        ok(param.flags.isOptional);
    });

    it("#1875", () => {
        const project = convert();
        const test = query(project, "test");
        equal(
            test.signatures?.[0].parameters?.map((p) => p.type?.toString()),
            ["typeof globalThis", "string"],
        );

        const test2 = query(project, "test2");
        equal(
            test2.signatures?.[0].parameters?.map((p) => p.type?.toString()),
            ["any", "string"],
        );
    });

    it("#1876", () => {
        const project = convert();
        const foo = query(project, "foo");
        const fooSig = foo.signatures?.[0].parameters?.[0];
        ok(fooSig);
        ok(fooSig.type instanceof UnionType);
        ok(fooSig.type.types[1] instanceof ReflectionType);
        equal(
            Comment.combineDisplayParts(
                fooSig.type.types[1].declaration.getChildByName("min")?.comment
                    ?.summary,
            ),
            "Nested",
        );

        const bar = query(project, "bar");
        const barSig = bar.signatures?.[0].parameters?.[0];
        ok(barSig);
        ok(barSig.type instanceof UnionType);
        ok(barSig.type.types[0] instanceof ReflectionType);
        ok(barSig.type.types[1] instanceof ReflectionType);
        equal(
            Comment.combineDisplayParts(
                barSig.type.types[0].declaration.getChildByName("min")?.comment
                    ?.summary,
            ),
            "Nested",
        );
        equal(
            Comment.combineDisplayParts(
                barSig.type.types[1].declaration.getChildByName("min")?.comment
                    ?.summary,
            ),
            "Nested",
        );
    });

    it("#1880", () => {
        const project = convert();
        const SomeEnum = query(project, "SomeEnum");
        equal(SomeEnum.kind, ReflectionKind.Enum);
        ok(SomeEnum.hasComment(), "Missing @enum variable comment");

        const auto = query(project, "SomeEnum.AUTO");
        ok(auto.hasComment(), "Missing @enum member comment");
    });

    it("#1896", () => {
        const project = convert();
        const Type1 = query(project, "Type1");
        const Type2 = query(project, "Type2");
        equal(Type1.type?.type, "reflection" as const);
        equal(Type2.type?.type, "reflection" as const);

        equal(Type1.comment, new Comment([{ kind: "text", text: "On Tag" }]));
        equal(
            Type2.comment,
            new Comment([{ kind: "text", text: "Some type 2." }]),
        );
    });

    it("#1898", () => {
        const project = convert();
        app.validate(project);
        logger.expectMessage(
            "warn: UnDocFn (TypeAlias), defined in */gh1898.ts, does not have any documentation",
        );
    });

    it("#1903", () => {
        const project = convert();
        equal(
            Object.values(project.reflections).map((r) => r.name),
            ["typedoc"],
        );
    });

    it("#1903b", () => {
        const project = convert("gh1903b");
        equal(
            Object.values(project.reflections).map((r) => r.name),
            ["typedoc"],
        );
    });

    it("#1907", () => {
        const project = convert();
        // gh2190 - we now skip the first package.json we encounter because it doesn't contain a name field.
        equal(project.packageName, "typedoc");
    });

    it("#1913", () => {
        const project = convert();
        const fn = query(project, "fn");

        equal(
            fn.signatures?.[0].comment,
            new Comment(
                [],
                [new CommentTag("@returns", [{ kind: "text", text: "ret" }])],
            ),
        );
    });

    it("#1927", () => {
        const project = convert();
        const ref = query(project, "Derived.getter");

        equal(
            ref.getSignature?.comment,
            new Comment([{ kind: "text", text: "Base" }]),
        );
    });

    it("#1942", () => {
        const project = convert();
        equal(query(project, "Foo.A").type, new LiteralType(0));
        equal(query(project, "Foo.B").type, new IntrinsicType("number"));
        equal(query(project, "Bar.C").type, new LiteralType("C"));
    });

    it("#1961", () => {
        const project = convert();
        equal(
            Comment.combineDisplayParts(
                query(project, "WithDocs1").comment?.summary,
            ),
            "second",
        );
    });

    it("#1962", () => {
        const project = convert();
        const foo = query(project, "foo");
        ok(foo.signatures);
        ok(project.hasComment(), "Missing module comment");
        ok(
            !foo.signatures[0].hasComment(),
            "Module comment attached to signature",
        );
    });

    it("#1963", () => {
        const project = convert();
        ok(project.hasComment(), "Missing module comment");
    });

    it("#1967", () => {
        const project = convert();
        equal(
            query(project, "abc").comment,
            new Comment(
                [],
                [
                    new CommentTag("@example", [
                        {
                            kind: "code",
                            text: "```ts\n\n```",
                        },
                    ]),
                ],
            ),
        );
    });

    it("#1968", () => {
        const project = convert();
        const comments = ["Bar.x", "Bar.y", "Bar.z"].map((n) =>
            Comment.combineDisplayParts(query(project, n).comment?.summary),
        );
        equal(comments, ["getter", "getter", "setter"]);
    });

    it("#1973", () => {
        const project = convert();
        const comments = ["A", "B"].map((n) =>
            Comment.combineDisplayParts(query(project, n).comment?.summary),
        );

        equal(comments, ["A override", "B module"]);

        const comments2 = ["A.a", "B.b"].map((n) =>
            Comment.combineDisplayParts(query(project, n).comment?.summary),
        );

        equal(comments2, ["Comment for a", "Comment for b"]);
    });

    it("#1980", () => {
        const project = convert();
        const link = query(project, "link");
        equal(
            link.comment?.summary.filter((t) => t.kind === "inline-tag"),
            [
                {
                    kind: "inline-tag",
                    tag: "@link",
                    target: "http://example.com",
                    text: "http://example.com",
                },
                {
                    kind: "inline-tag",
                    tag: "@link",
                    target: "http://example.com",
                    text: "with text",
                },
                {
                    kind: "inline-tag",
                    tag: "@link",
                    target: "http://example.com",
                    text: "jsdoc support",
                },
            ],
        );
    });

    it("#1986", () => {
        const project = convert();
        const a = query(project, "a");
        equal(
            Comment.combineDisplayParts(a.comment?.summary),
            "[[include:file.md]] this is not a link.",
        );
    });

    it("#1994", () => {
        app.options.setValue("excludeNotDocumented", true);
        const project = convert();
        for (const exp of ["documented", "documented2", "Docs.x", "Docs.y"]) {
            query(project, exp);
        }
        for (const rem of ["notDocumented", "Docs.z"]) {
            ok(!project.getChildByName(rem));
        }

        const y = query(project, "Docs.y");
        equal(y.sources?.length, 1);
        ok(y.getSignature);
        ok(!y.setSignature);
    });

    it("#1996", () => {
        const project = convert();
        const a = querySig(project, "a");
        equal(a.sources?.[0].fileName, "gh1996.ts");
        equal(a.sources[0].line, 1);
        equal(a.sources[0].character, 17);
        const b = querySig(project, "b");
        equal(b.sources?.[0].fileName, "gh1996.ts");
        equal(b.sources[0].line, 3);
        equal(b.sources[0].character, 16);
    });

    it("#2008", () => {
        const project = convert();
        const fn = query(project, "myFn");
        equal(Comment.combineDisplayParts(fn.comment?.summary), "Docs");
    });

    it("#2011", () => {
        const project = convert();
        const readable = query(project, "Readable").signatures![0];
        const type = readable.type!;
        equal(type.type, "intersection" as const);
        notEqual(type.types[0], "intersection");
        notEqual(type.types[1], "intersection");
    });

    it("#2012", () => {
        const project = convert();
        project.hasOwnDocument = true;
        const model = query(project, "model");
        const Model = query(project, "Model");
        equal(model.getAlias(), "model");
        equal(Model.getAlias(), "Model-1");
    });

    it("#2019", () => {
        const project = convert();
        const param = query(project, "A.constructor").signatures![0]
            .parameters![0];
        const prop = query(project, "A.property");

        equal(
            Comment.combineDisplayParts(param.comment?.summary),
            "Param comment",
            "Constructor parameter",
        );
        equal(
            Comment.combineDisplayParts(prop.comment?.summary),
            "Param comment",
            "Property",
        );
    });

    it("#2020", () => {
        const project = convert();
        const opt = query(project, "Options");
        equal(Comment.combineDisplayParts(opt.comment?.summary), "Desc");
        equal(
            Comment.combineDisplayParts(
                opt.getChildByName("url")?.comment?.summary,
            ),
            "Desc2",
        );
        equal(
            Comment.combineDisplayParts(
                opt.getChildByName("apiKey")?.comment?.summary,
            ),
            "Desc3",
        );
    });

    it("#2031", () => {
        const project = convert();
        const sig = query(project, "MyClass.aMethod").signatures![0];
        const summaryLink = sig.comment?.summary[0];
        ok(summaryLink?.kind === "inline-tag");
        ok(summaryLink.target);

        const paramLink = sig.parameters![0].comment?.summary[0];
        ok(paramLink?.kind === "inline-tag");
        ok(paramLink.target);
    });

    it("#2033", () => {
        const project = convert();
        const cls = project.children!.find(
            (c) => c.name === "Foo" && c.kind === ReflectionKind.Class,
        );
        ok(cls);

        const link = cls.comment?.summary[0];
        ok(link?.kind === "inline-tag");
        ok(link.target);
    });

    it("#2036", () => {
        const project = convert();
        const SingleSimpleCtor = query(project, "SingleSimpleCtor");
        const MultipleSimpleCtors = query(project, "MultipleSimpleCtors");
        const AnotherCtor = query(project, "AnotherCtor");

        equal(SingleSimpleCtor.type?.type, "reflection" as const);
        equal(MultipleSimpleCtors.type?.type, "reflection" as const);
        equal(AnotherCtor.type?.type, "reflection" as const);

        equal(SingleSimpleCtor.type.declaration.signatures?.length, 1);
        equal(MultipleSimpleCtors.type.declaration.signatures?.length, 2);
        equal(AnotherCtor.type.declaration.signatures?.length, 1);
    });

    it("#2042", () => {
        const project = convert();
        for (const [name, docs, sigDocs] of [
            ["built", "", "inner docs"],
            ["built2", "outer docs", "inner docs"],
            ["fn", "", "inner docs"],
            ["fn2", "outer docs", "inner docs"],
        ]) {
            const refl = query(project, name);
            ok(refl.signatures?.[0]);
            equal(
                Comment.combineDisplayParts(refl.comment?.summary),
                docs,
                name + " docs",
            );
            equal(
                Comment.combineDisplayParts(
                    refl.signatures[0].comment?.summary,
                ),
                sigDocs,
                name + " sig docs",
            );
        }
    });

    it("#2044", () => {
        const project = convert();
        for (const [name, ref] of [
            ["Foo", false],
            ["RenamedFoo", true],
            ["Generic", false],
            ["RenamedGeneric", true],
            ["NonGeneric", false],
        ] as const) {
            const decl = query(project, name);
            equal(decl instanceof ReferenceReflection, ref, `${name} = ${ref}`);
        }
    });

    it("#2064", () => {
        app.options.setValue("excludePrivate", false);
        const project = convert();
        query(project, "PrivateCtorDecl.x");
    });

    it("#2079", () => {
        const project = convert();
        const cap = query(project, "capitalize");
        const sig = cap.signatures![0];
        equal(sig.type?.toString(), "Capitalize<T>");
    });

    it("#2087", () => {
        const project = convert();
        const x = query(project, "Bar.x");
        equal(
            Comment.combineDisplayParts(x.comment?.summary),
            "Foo type comment",
        );
    });

    it("#2106 Handles types/values with same name ", () => {
        const project = convert();
        const balance = querySig(project, "balance");
        equal(balance.type?.type, "reference");
        equal(balance.type.reflection?.kind, ReflectionKind.Interface);

        const TypeOf = query(project, "TypeOf");
        equal(TypeOf.type?.type, "query");
        equal(TypeOf.type.queryType.reflection?.kind, ReflectionKind.Variable);
    });

    it("#2135", () => {
        const project = convert();
        const hook = query(project, "Camera.useCameraPermissions");
        equal(hook.type?.type, "reflection" as const);
        equal(Comment.combineDisplayParts(hook.comment?.summary), "One");
    });

    it("#2150", () => {
        const project = convert();
        const intFn = query(project, "FileInt.intFn");
        equal(intFn.kind, ReflectionKind.Method, "intFn interface method");
        equal(
            Comment.combineDisplayParts(intFn.signatures?.[0].comment?.summary),
            "intFn doc",
        );

        const intProp = query(project, "FileInt.intVar");
        equal(intProp.kind, ReflectionKind.Property, "intVar interface prop");
        equal(
            Comment.combineDisplayParts(intProp.comment?.summary),
            "intVar doc",
        );

        const constFn = query(project, "FileInt.constFn");
        equal(constFn.kind, ReflectionKind.Method, "constFn interface method");
        equal(
            Comment.combineDisplayParts(
                constFn.signatures?.[0].comment?.summary,
            ),
            "constFn doc",
        );

        const intFn2 = query(project, "FileClass.intFn");
        equal(intFn2.kind, ReflectionKind.Method, "intFn class method");

        const intProp2 = query(project, "FileClass.intVar");
        equal(intProp2.kind, ReflectionKind.Property, "intVar class prop");

        const constFn2 = query(project, "FileClass.constFn");
        equal(constFn2.kind, ReflectionKind.Method, "constFn class method");
        equal(
            Comment.combineDisplayParts(
                constFn2.signatures?.[0].comment?.summary,
            ),
            "constFn doc",
        );
    });

    it("#2156", () => {
        app.options.setValue("excludeNotDocumented", true);
        const project = convert();
        const foo = query(project, "foo");
        equal(foo.signatures?.length, 1);
        equal(
            Comment.combineDisplayParts(foo.comment?.summary),
            "Is documented",
        );
    });

    it("#2165 module comments on global files", () => {
        const project = convert();
        equal(
            Comment.combineDisplayParts(project.comment?.summary),
            "'module' comment",
        );
    });

    it("#2175", () => {
        const project = convert();
        const def = query(project, "default");
        equal(def.type?.type, "intrinsic");
        equal(def.type.toString(), "undefined");
    });

    it("#2200", () => {
        const project = convert();
        const Test = query(project, "Test");
        equal(Test.type?.type, "reflection" as const);
        equal(
            Test.type.declaration.getChildByName("x")?.flags.isOptional,
            true,
        );
    });

    it("#2207", () => {
        const project = convert();
        const mod = query(project, "Mod");
        equal(mod.sources?.[0].line, 1);
    });

    it("#2220", () => {
        const project = convert();
        const fn = query(project, "createAssetEmitter");
        const param = fn.signatures?.[0].parameters?.[0];
        ok(param);
        equal(param.type?.type, "query");
        equal(param.type.queryType.reflection?.name, "TypeEmitter");
    });

    it("#2222", () => {
        const project = convert();
        const example = query(project, "example");
        equal(
            Comment.combineDisplayParts(
                example.comment?.getTag("@example")?.content,
            ),
            "```ts\nlet x = `str`\n```",
        );
    });

    it("#2233", () => {
        const project = convert();
        const int = query(project, "Int");
        const cls = query(project, "IntImpl");

        for (const name of ["prop", "prop2", "method", "method2"]) {
            const intFn = int.getChildByName(name) as DeclarationReflection;
            const clsFn = cls.getChildByName(name) as DeclarationReflection;
            equal(
                clsFn.implementationOf?.reflection?.getFullName(),
                intFn.getFullName(),
                `${name} method not properly linked`,
            );

            const intTarget = intFn.signatures?.[0] || intFn;
            const clsSig =
                clsFn.signatures?.[0] ||
                clsFn.type?.visit({
                    reflection: (r) => r.declaration.signatures?.[0],
                });

            equal(
                clsSig!.implementationOf?.reflection?.getFullName(),
                intTarget.getFullName(),
                `${name} signature not properly linked`,
            );
        }
    });

    it("#2234 Handles implementationOf with symbols ", () => {
        const project = convert();
        const cm = query(project, "CharMap");
        equal(
            cm.children?.map((c) => c.name),
            ["constructor", "[iterator]", "at"],
        );

        equal(
            cm.children[1].implementationOf?.name,
            "ReadonlyCharMap.[iterator]",
        );
    });

    it("#2270 Handles http links with TS link resolution ", () => {
        const project = convert();
        const links = getLinks(query(project, "A"));
        equal(links, [
            {
                display: "Immutable",
                target: [ReflectionKind.TypeAlias, "Immutable"],
            },
            {
                display: "Immutable Objects",
                target: "https://en.wikipedia.org/wiki/Immutable_object",
            },
        ]);
    });

    it("#2290 Handles comments on interfaces with call signatures ", () => {
        const project = convert();

        equal(getComment(project, "CallSignature"), "Int comment");
        equal(getComment(project, "CallSignature2"), "Int comment");
        equal(getComment(project, "CallSignature2.prop"), "Prop comment");

        equal(
            Comment.combineDisplayParts(
                query(project, "CallSignature").signatures![0].comment?.summary,
            ),
            "Sig comment",
        );

        equal(
            Comment.combineDisplayParts(
                query(project, "CallSignature2").signatures![0].comment
                    ?.summary,
            ),
            "Sig comment",
        );
    });

    it("#2291 Does not warn on notDocumented edge case ", () => {
        app.options.setValue("validation", { notDocumented: true });
        const project = convert();
        app.validate(project);
        logger.expectNoOtherMessages();
    });

    it("#2296 Supports TS 5.0 ", () => {
        const project = convert();
        const names = query(project, "names");
        equal(names.type?.toString(), 'readonly ["Alice", "Bob", "Eve"]');

        const getNamesExactly = query(project, "getNamesExactly");
        const sig = getNamesExactly.signatures![0];
        const tp = sig.typeParameters![0];
        equal(tp.flags.isConst, true);
    });

    it("#2307 Detects source locations coming from types and prefers value declarations, ", () => {
        const project = convert();

        const getLines = (name: string) => {
            const refl = query(project, name);
            return refl.signatures?.flatMap((sig) =>
                sig.sources!.map((src) => src.line),
            );
        };

        equal(getLines("double"), [3]);
        equal(getLines("foo"), [5]);
        equal(getLines("all"), [8, 9]);
    });

    it("#2320 Uses type parameters from parent class in arrow-methods, ", () => {
        const project = convert();
        const arrow = querySig(project, "ResolvedSubclass.arrowFunction");

        equal(arrow.typeParameters![0].type?.toString(), '"one" | "two"');
    });

    it("#2336 Handles comments with nested methods ", () => {
        const project = convert();

        const outer = querySig(project, "ClassVersion.outer");
        equal(Comment.combineDisplayParts(outer.comment?.summary), "Outer");

        equal(outer.type?.type, "reflection");
        equal(
            Comment.combineDisplayParts(
                outer.type.declaration.signatures![0].comment?.summary,
            ),
            "",
        );
    });

    it("#2360 Supports nested paths with tsLinkResolution ", () => {
        const project = convert();
        const x = query(project, "x");
        const link = x.comment?.summary[0];
        equal(link?.kind, "inline-tag");
        equal(link.target, query(project, "Foo.bar"));
    });

    it("#2364 Handles duplicate declarations with @namespace ", () => {
        const project = convert();
        equal(
            project.children?.map((c) => c.name),
            ["NS", "NS2", "NS2"],
        );
        const ns = query(project, "NS");
        equal(
            ns.children?.map((c) => c.name),
            ["T", "property"],
        );
    });

    it("#2364 Gets properties when types/variables are merged with @namespace ", () => {
        const project = convert();
        const ns = project.children?.find(
            (c) => c.name == "NS2" && c.kind == ReflectionKind.Namespace,
        );
        equal(
            ns?.children?.map((c) => c.name),
            ["property"],
        );
    });

    it("#2372 Puts delegate type alias comments on the type alias ", () => {
        const project = convert();
        equal(
            getComment(project, "EventHandler"),
            "The signature for a function acting as an event handler.",
        );

        const typeSig = query(project, "EventHandler").type?.visit({
            reflection(r) {
                return r.declaration.signatures![0];
            },
        });

        equal(Comment.combineDisplayParts(typeSig?.comment?.summary), "");
    });

    it("#2384 Handles spaces in JSDoc default parameter names ", () => {
        const project = convert();
        const Typed = query(project, "Typed");
        equal(Typed.typeParameters?.length, 1);
        equal(
            Comment.combineDisplayParts(
                Typed.typeParameters[0].comment?.summary,
            ),
            "desc",
        );
    });

    it("#2389 Handles @template parameter constraints correctly, ", () => {
        const project = convert();
        const foo = query(project, "foo");
        equal(foo.signatures?.length, 1);
        equal(foo.signatures[0].typeParameters?.length, 2);

        const [T, U] = foo.signatures[0].typeParameters;
        equal(T.type?.toString(), "string");
        equal(U.type?.toString(), undefined);
    });

    // This is rather unfortunate, we need to do this so that files which include only
    // a single declare module can still have a comment on them, but it looks really
    // weird and wrong if there are multiple declare module statements in a file...
    // there's probably some nicer way of doing this that I'm not seeing right now.
    it("#2401 Uses module comment discovery on 'declare module \"foo\"' ", () => {
        const project = convert();
        equal(
            Comment.combineDisplayParts(project.comment?.summary),
            "Comment for module",
        );
    });

    it("#2414 Includes index signature comments ", () => {
        const project = convert();
        equal(
            Comment.combineDisplayParts(
                query(project, "ObjectWithIndexSignature").indexSignatures?.[0]
                    ?.comment?.summary,
            ),
            "Index comment.",
        );
    });

    it("#2430 Handles destructured object parameter defaults, ", () => {
        const project = convert();
        const Checkbox = querySig(project, "Checkbox");
        equal(Checkbox.parameters?.length, 1);
        equal(Checkbox.parameters[0].name, "props");
        const type = Checkbox.parameters[0].type;
        equal(type?.type, "reflection");
        equal(
            type.declaration.children?.map((c) => c.name),
            ["falseValue", "trueValue", "value"],
        );
        equal(
            type.declaration.children.map((c) => c.defaultValue),
            ["false", "true", undefined],
        );
    });

    it("#2436 Handles function-namespaces created with Object.assign ", () => {
        const project = convert();
        equal(query(project, "bug").kind, ReflectionKind.Function);
        const foo = query(project, "bug.foo");
        const bar = query(project, "bug.bar");
        // It'd be kind of nice if foo became a method, but the symbol only has
        // a Property flag, and there are other nicer ways to formulate this that do.
        equal(foo.kind, ReflectionKind.Property, "method");
        equal(bar.kind, ReflectionKind.Property, "property");
    });

    it("#2437 Does not warn due to the diamond problem in comment discovery ", () => {
        convert();
        logger.expectNoOtherMessages();
    });

    it("#2438 Handles recursive aliases without looping infinitely ", () => {
        const bad = query(convert(), "Bad");
        equal(bad.kind, ReflectionKind.Interface);
    });

    it("#2444 Handles transient symbols correctly, ", () => {
        const project = convert();
        const boolEq = query(project, "Boolean.equal");
        const numEq = query(project, "Number.equal");
        equal(boolEq.signatures![0].parameters![0].type?.toString(), "boolean");
        equal(numEq.signatures![0].parameters![0].type?.toString(), "number");
    });

    it("#2451 Handles unions created due to union within intersection, ", () => {
        const project = convert();

        const is = querySig(project, "FooA.is");
        equal(is.type?.toString(), "this is Foo & Object");
    });

    it("#2466 Does not care about conversion order for @link resolution, ", () => {
        const project = convert();

        const Two = query(project, "Two");
        equal(getLinks(Two), [
            {
                display: "method1",
                target: [ReflectionKind.Method, "Two.method1"],
            },
        ]);

        const Three = query(project, "Three");
        equal(getLinks(Three), [
            {
                display: "method2",
                target: [ReflectionKind.Method, "Three.method2"],
            },
        ]);
    });

    it("#2476 Creates a separate namespace for `declare namespace` case ", () => {
        const project = convert();

        equal(
            project.children?.map((c) => [c.name, c.kind]),
            [
                ["test", ReflectionKind.Namespace],
                ["test", ReflectionKind.Function],
            ],
        );

        equal(
            project.children[0].children?.map((c) => c.name),
            ["Options"],
        );
    });

    it("#2478 Creates a separate namespace for `declare namespace` case with variables ", () => {
        const project = convert();

        equal(
            project.children?.map((c) => [c.name, c.kind]),
            [
                ["test", ReflectionKind.Namespace],
                ["test", ReflectionKind.Function],
            ],
        );

        equal(
            project.children[0].children?.map((c) => c.name),
            ["Options"],
        );
    });

    it("#2495 Does not crash when rendering recursive hierarchy, ", () => {
        const project = convert();

        const theme = new DefaultTheme(app.renderer);
        const page = new PageEvent(project);
        page.project = project;
        const context = theme.getRenderContext(page);
        context.hierarchyTemplate(page);
    });

    it("#2496 Correctly cleans up references to functions ", () => {
        app.options.setValue("excludeNotDocumented", true);
        convert();
    });

    it("#2502 Sorts literal numeric unions when converting a type, ", () => {
        const project = convert();
        const refl = query(project, "Test");
        equal(refl.type?.toString(), "1 | 2 | 3");
    });

    it("#2507 Handles an infinitely recursive type, ", () => {
        const project = convert();
        const type = querySig(project, "fromPartial").typeParameters![0].type;

        // function fromPartial<I extends Value & {
        //     values: Value[] & (Value & {
        //         values: Value[] & (Value & {
        //             values: Value[] & (Value & {
        //                 values: Value[] & (Value & {
        //                     ...;
        //                 })[];
        //             })[];
        //         })[];
        //     })[];
        // }>(object: I): void
        equal(type?.toString(), "Value & Object");
    });

    it("#2508 Handles constructed references to enumeration types, ", () => {
        const project = convert();
        const refl = query(project, "Bar.color");
        equal(refl.type?.type, "reference");
        equal(refl.type.toString(), "Color");
        equal(refl.type.reflection?.id, query(project, "Color").id);
    });

    it("#2509 Does not duplicate comments due to signatures being present, ", () => {
        const project = convert();
        const cb = query(project, "Int.cb");
        equal(Comment.combineDisplayParts(cb.comment?.summary), "Cb");
        equal(cb.type?.type, "reflection");
        equal(cb.type.declaration.signatures![0].comment, undefined);

        const nested = query(project, "Int.nested");
        equal(nested.type?.type, "reflection");
        const cb2 = nested.type.declaration.children![0];
        equal(Comment.combineDisplayParts(cb2.comment?.summary), "Cb2");
        equal(cb2.type?.type, "reflection");
        equal(cb2.type.declaration.signatures![0].comment, undefined);
    });

    it("#2521 Specifying comment on variable still inherits signature comments, ", () => {
        const project = convert();

        equal(getComment(project, "fooWithoutComment"), "");
        equal(getSigComment(project, "fooWithoutComment", 0), "Overload 1");
        equal(getSigComment(project, "fooWithoutComment", 1), "Overload 2");

        equal(getComment(project, "fooWithComment"), "New comment.");
        equal(getSigComment(project, "fooWithComment", 0), "Overload 1");
        equal(getSigComment(project, "fooWithComment", 1), "Overload 2");
    });

    it("#2545 discovers comments from non-exported 'parent' methods", () => {
        const project = convert();

        equal(getSigComment(project, "Child.notAbstract"), "notAbstract docs");
        equal(
            getSigComment(project, "Child.notAbstract2"),
            "notAbstract2 docs",
        );
        equal(getSigComment(project, "Child.isAbstract"), "isAbstract docs");
        equal(
            getComment(project, "Child.abstractProperty"),
            "abstractProperty docs",
        );

        // #2084
        equal(
            querySig(project, "Bar.isInternal").comment?.hasModifier(
                "@internal",
            ),
            true,
        );
    });

    it("#2552 Ignores @license and @import comments, ", () => {
        const project = convert();
        equal(
            Comment.combineDisplayParts(project.comment?.summary),
            "This is an awesome module.",
        );
        equal(getComment(project, "something"), "");
    });

    it("#2553 Does not warn about documented constructor signature type aliases, ", () => {
        const project = convert();
        app.validate(project);
        logger.expectNoOtherMessages();
    });

    it("#2574 default export", () => {
        const project = convert();
        const sig = querySig(project, "usesDefaultExport");
        const param = sig.parameters?.[0];
        ok(param, "Missing parameter");
        equal(param.name, "param", "Incorrect parameter name");
        equal(
            param.type?.type,
            "reference",
            "Parameter is not a reference type",
        );
        equal(param.type.name, "DefaultExport", "Incorrect reference name");
        equal(param.type.qualifiedName, "default", "Incorrect qualified name");
    });

    it("#2574 not default export", () => {
        const project = convert();
        const sig = querySig(project, "usesNonDefaultExport");
        const param = sig.parameters?.[0];
        ok(param, "Missing parameter");
        equal(param.name, "param", "Incorrect parameter name");
        equal(
            param.type?.type,
            "reference",
            "Parameter is not a reference type",
        );
        equal(param.type.name, "NotDefaultExport", "Incorrect reference name");
        equal(
            param.type.qualifiedName,
            "NotDefaultExport",
            "Incorrect qualified name",
        );
    });

    it("#2582 nested @namespace", () => {
        const project = convert();

        equalKind(query(project, "f32"), ReflectionKind.Namespace);
        equalKind(query(project, "f32.a"), ReflectionKind.Namespace);
        equalKind(query(project, "f32.a.member"), ReflectionKind.Variable);
        equalKind(query(project, "f32.a.fn"), ReflectionKind.Function);
        equalKind(query(project, "f32.b"), ReflectionKind.Namespace);
        equalKind(query(project, "f32.b.member"), ReflectionKind.Reference); // Somewhat odd, but not wrong...
        equalKind(query(project, "f32.b.fn"), ReflectionKind.Function);

        equal(getComment(project, "f32"), "f32 comment");
        equal(getComment(project, "f32.a"), "A comment");
        equal(getComment(project, "f32.a.member"), "Member comment");
        equal(getComment(project, "f32.a.fn"), "Fn comment");
        equal(getComment(project, "f32.b"), "B comment");
    });

    it("#2585 supports comments on union members", () => {
        const project = convert();
        const Foo = query(project, "Foo");
        equal(Foo.type?.type, "union");

        equal(Foo.type.elementSummaries?.length, 2);
        equal(Foo.type.elementSummaries.map(Comment.combineDisplayParts), [
            "Doc of foo1.",
            "Doc of foo2.",
        ]);
    });

    it("#2587 comment on shorthand property declaration", () => {
        const project = convert();

        const sig = querySig(project, "foo");
        equal(sig.type?.type, "reflection");
        const x = sig.type.declaration.getChildByName("x");
        ok(x);

        equal(
            Comment.combineDisplayParts(x.comment?.summary),
            "Shorthand comment",
        );
    });

    it("#2603 handles @author tag", () => {
        const project = convert();
        const x = query(project, "x");
        equal(
            x.comment?.getTag("@author"),
            new CommentTag("@author", [{ kind: "text", text: "Ian Awesome" }]),
        );

        logger.expectNoOtherMessages();
    });

    it("#2611 can suppress warnings from comments in declaration files", () => {
        convert();
        logger.expectMessage(
            "warn: Encountered an unknown block tag @tagThatIsNotDefined",
        );
        logger.expectNoOtherMessages();
        logger.reset();

        app.options.setValue("suppressCommentWarningsInDeclarationFiles", true);
        convert();
        logger.expectNoOtherMessages();
    });

    it("#2614 supports @since tag", () => {
        const project = convert();
        const foo = querySig(project, "foo");
        equal(
            foo.comment?.getTag("@since"),
            new CommentTag("@since", [{ kind: "text", text: "1.0.0" }]),
        );

        logger.expectNoOtherMessages();
    });

    it("#2631 handles CRLF line endings in frontmatter", () => {
        const project = convert();
        equal(
            project.documents?.map((d) => d.name),
            ["Windows Line Endings"],
        );
    });

    it("#2634 handles @hidden on function implementations", () => {
        const project = convert();
        equal(project.children?.map((c) => c.name) || [], []);
    });

    it("#2636 does not treat parameters as class properties", () => {
        const project = convert();
        const sig = querySig(project, "B.constructor");
        equal(sig.parameters?.length, 1);
    });

    it("#2638 empty markdown file", () => {
        const project = convert();
        equal(
            project.documents?.map((d) => d.content),
            [[]],
        );
    });

    it("#2644 allows comments on signature parents to count for being documented", () => {
        app.options.setValue("validation", { notDocumented: true });
        const project = convert();
        app.validate(project);
        logger.expectNoOtherMessages();
    });

    it("#2681 reports warnings on @link tags which resolve to a type not included in the documentation", () => {
        const project = convert();
        app.options.setValue("validation", false);
        app.options.setValue("validation", { invalidLink: true });
        app.validate(project);
        logger.expectMessage(
            'warn: Failed to resolve link to "Generator" in comment for bug',
        );
    });

    it("#2683 supports @param on parameters with functions", () => {
        const project = convert();
        const action = querySig(project, "action");
        const callback = action.parameters![0];
        equal(
            Comment.combineDisplayParts(callback.comment?.summary),
            "Param comment",
        );

        equal(callback.type?.type, "reflection");
        const data = callback.type.declaration.signatures![0].parameters![0];
        equal(Comment.combineDisplayParts(data?.comment?.summary), "Data");

        const action2 = querySig(project, "action2");
        const callback2 = action2.parameters![0];
        equal(
            Comment.combineDisplayParts(callback2.comment?.summary),
            "Param comment2",
        );

        equal(callback2.type?.type, "reflection");
        const data2 = callback2.type.declaration.signatures![0].parameters![0];
        // Overwritten by the @param on the wrapping signature, so we never
        // had a chance to copy the data's @param to the parameter.
        equal(data2.comment, undefined);
    });

    it("#2693 handles the @abstract tag", () => {
        const project = convert();
        ok(query(project, "Foo.foo").flags.isAbstract);
        ok(!querySig(project, "Foo.foo").flags.isAbstract);
        ok(query(project, "Foo.x").flags.isAbstract);

        ok(query(project, "Bar.foo").flags.isAbstract);
        ok(!querySig(project, "Bar.foo").flags.isAbstract);
        ok(query(project, "Bar.x").flags.isAbstract);
    });

    it("#2698 handles this parameters present in type but not node", () => {
        const project = convert();
        const animator = querySig(project, "animator");
        equal(
            animator.parameters?.map((p) => p.name),
            ["this", "numSpins", "direction"],
        );

        equal(
            animator.parameters.map((p) => p.defaultValue),
            [undefined, "2", '"counterclockwise"'],
        );
    });

    it("#2700a correctly parses links to global properties", () => {
        const project = convert();
        app.options.setValue("validation", {
            invalidLink: true,
            notDocumented: false,
            notExported: false,
        });

        app.validate(project);
        logger.expectMessage(
            'warn: Failed to resolve link to "Map.size | size user specified" in comment for abc',
        );
        logger.expectMessage(
            'warn: Failed to resolve link to "Map.size user specified" in comment for abc',
        );
        logger.expectMessage(
            'warn: Failed to resolve link to "Map.size" in comment for abc',
        );

        const abc = query(project, "abc");
        const link = abc.comment?.summary.find((c) => c.kind === "inline-tag");
        ok(link?.target instanceof ReflectionSymbolId);
    });

    it("#2700b respects user specified link text when resolving external links", () => {
        const project = convert();

        const abc = query(project, "abc");
        ok(abc.comment);

        const resolvers = app.converter["_externalSymbolResolvers"].slice();
        app.converter.addUnknownSymbolResolver(() => {
            return {
                target: "https://typedoc.org",
                caption: "resolver caption",
            };
        });
        app.converter.resolveLinks(abc.comment, abc);
        app.converter["_externalSymbolResolvers"] = resolvers;

        equal(getLinks(abc), [
            { display: "size user specified", target: "https://typedoc.org" },
            { display: "user specified", target: "https://typedoc.org" },
            { display: "resolver caption", target: "https://typedoc.org" },
        ]);
    });

    it("#2721 handles bigint literals in default values", () => {
        const project = convert();
        equal(query(project, "big").defaultValue, "123n");
        equal(query(project, "neg").defaultValue, "-123n");
    });

    it("#2725 respects symbol IDs when resolving links with user configured resolver", () => {
        app.options.setValue("externalSymbolLinkMappings", {
            typescript: {
                "ts.Node": "https://typescriptlang.org",
            },
        });
        const project = convert();
        equal(getLinks(query(project, "node")), [
            { display: "Node", target: "https://typescriptlang.org" },
        ]);
    });
});
