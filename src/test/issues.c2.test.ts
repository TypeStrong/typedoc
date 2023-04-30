import {
    deepStrictEqual as equal,
    notDeepStrictEqual as notEqual,
    ok,
} from "assert";
import {
    DeclarationReflection,
    ProjectReflection,
    QueryType,
    ReflectionKind,
    SignatureReflection,
    ReflectionType,
    Comment,
    CommentTag,
    UnionType,
    LiteralType,
    IntrinsicType,
    ReferenceReflection,
} from "../lib/models";
import type { InlineTagDisplayPart } from "../lib/models/comments/comment";
import {
    getConverter2App,
    getConverter2Base,
    getConverter2Program,
} from "./programs";
import { TestLogger } from "./TestLogger";
import { clearCommentCache } from "../lib/converter/comments";
import { join } from "path";
import { existsSync } from "fs";
import type { Application } from "..";
import type { Program } from "typescript";

function doConvert(
    base: string,
    app: Application,
    program: Program,
    entry: string
) {
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

function query(project: ProjectReflection, name: string) {
    const reflection = project.getChildByName(name);
    ok(reflection instanceof DeclarationReflection, `Failed to find ${name}`);
    return reflection;
}

describe("Issue Tests", () => {
    let logger: TestLogger;
    let convert: (name?: string) => ProjectReflection;
    let optionsSnap: { __optionSnapshot: never };
    let app: Application;
    let base: string;
    let program: Program;

    before(async () => {
        base = getConverter2Base();
        app = await getConverter2App();
        program = await getConverter2Program();
    });

    beforeEach(function () {
        app.logger = logger = new TestLogger();
        optionsSnap = app.options.snapshot();
        const issueNumber = this.currentTest?.title.match(/#(\d+)/)?.[1];
        ok(issueNumber, "Test name must contain an issue number.");
        convert = (name = `gh${issueNumber}`) =>
            doConvert(base, app, program, name);
    });

    afterEach(() => {
        app.options.restore(optionsSnap);
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
            "JSDoc style param name"
        );
    });

    it("#671", () => {
        const project = convert();
        const toNumber = query(project, "toNumber");
        const sig = toNumber.signatures?.[0];
        ok(sig, "Missing signatures");

        const paramComments = sig.parameters?.map((param) =>
            Comment.combineDisplayParts(param.comment?.summary)
        );
        equal(paramComments, [
            "the string to parse as a number",
            "whether to parse as an integer or float",
        ]);
    });

    it("#869", () => {
        const project = convert();
        const classFoo = project.children?.find(
            (r) => r.name === "Foo" && r.kind === ReflectionKind.Class
        );
        ok(classFoo instanceof DeclarationReflection);
        equal(
            classFoo.children?.find((r) => r.name === "x"),
            undefined
        );

        const nsFoo = project.children?.find(
            (r) => r.name === "Foo" && r.kind === ReflectionKind.Namespace
        );
        ok(nsFoo instanceof DeclarationReflection);
        ok(nsFoo.children?.find((r) => r.name === "x"));
    });

    it("#1124", () => {
        const project = convert();
        equal(
            project.children?.length,
            1,
            "Namespace with type and value converted twice"
        );
    });

    it("#1150", () => {
        const project = convert();
        const refl = query(project, "IntersectFirst");
        equal(refl?.kind, ReflectionKind.TypeAlias);
        equal(refl.type?.type, "indexedAccess");
    });

    it("#1164", () => {
        const project = convert();
        const refl = query(project, "gh1164");
        equal(
            Comment.combineDisplayParts(
                refl.signatures?.[0]?.parameters?.[0]?.comment?.summary
            ),
            "{@link CommentedClass} Test description."
        );
        const tag = refl.signatures?.[0]?.comment?.blockTags.find(
            (x) => x.tag === "@returns"
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
            "The property of X."
        );
    });

    it("#1330", () => {
        const project = convert();
        const example = query(project, "ExampleParam");
        equal(example?.type?.type, "reference");
        equal(example.type.toString(), "Example");
    });

    it("#1366", () => {
        const project = convert();
        const foo = query(project, "GH1366.Foo");
        equal(foo.kind, ReflectionKind.Reference);
    });

    it("#1408", () => {
        const project = convert();
        const foo = query(project, "foo");
        const type = foo?.signatures?.[0]?.typeParameters?.[0].type;
        equal(type?.type, "array");
        equal(type?.toString(), "unknown[]");
    });

    it("#1436", () => {
        const project = convert();
        equal(
            project.children?.map((c) => c.name),
            ["gh1436"]
        );
    });

    it("#1449", () => {
        const project = convert();
        const refl = query(project, "gh1449").signatures?.[0];
        equal(
            refl?.typeParameters?.[0].type?.toString(),
            "[foo: any, bar?: any]"
        );
    });

    it("#1454", () => {
        const project = convert();
        const foo = query(project, "foo");
        const fooRet = foo?.signatures?.[0]?.type;
        equal(fooRet?.type, "reference");
        equal(fooRet?.toString(), "Foo");

        const bar = query(project, "bar");
        const barRet = bar?.signatures?.[0]?.type;
        equal(barRet?.type, "reference");
        equal(barRet?.toString(), "Bar");
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
                method.signatures?.[0].comment?.summary
            ),
            "method docs"
        );
    });

    it("#1481", () => {
        const project = convert();
        const signature = query(project, "GH1481.static").signatures?.[0];
        equal(
            Comment.combineDisplayParts(signature?.comment?.summary),
            "static docs"
        );
        equal(signature?.type?.toString(), "void");
    });

    it("#1483", () => {
        const project = convert();
        equal(
            query(project, "gh1483.namespaceExport").kind,
            ReflectionKind.Function
        );
        equal(
            query(project, "gh1483_2.staticMethod").kind,
            ReflectionKind.Method
        );
    });

    it("#1490", () => {
        const project = convert();
        const refl = query(project, "GH1490.optionalMethod");
        equal(
            Comment.combineDisplayParts(refl.signatures?.[0]?.comment?.summary),
            "With comment"
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
        const project = convert();
        equal(
            project.groups?.map((g) => g.categories?.map((c) => c.title)),
            [["cat"]]
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
            "readonly [number, string]"
        );
    });

    it("#1547", () => {
        const project = convert();
        equal(
            project.children?.map((c) => c.name),
            ["Test", "ThingA", "ThingB"]
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
            "Symbol re-exported from ignored file is ignored."
        );
    });

    it("#1580", () => {
        const project = convert();
        ok(
            query(project, "B.prop").hasComment(),
            "Overwritten property with no comment should be inherited"
        );
        ok(
            query(project, "B.run").signatures?.[0]?.hasComment(),
            "Overwritten method with no comment should be inherited"
        );
    });

    it("#1624", () => {
        const project = convert();
        // #1637
        equal(query(project, "Bar.baz").kind, ReflectionKind.Property);

        equal(
            Comment.combineDisplayParts(
                query(project, "Foo.baz").signatures?.[0]?.comment?.summary
            ),
            "Some property style doc.",
            "Property methods declared in interface should still allow comment inheritance"
        );
    });

    it("#1626", () => {
        const project = convert();
        const ctor = query(project, "Foo.constructor");
        equal(ctor.sources?.[0]?.line, 2);
        equal(ctor.sources?.[0]?.character, 4);
    });

    it("#1651", () => {
        const project = convert();
        equal(
            project.children?.map((c) => c.name),
            ["bar", "bar"]
        );

        equal(
            project.children[0].children?.map((c) => c.name),
            ["metadata", "fn"]
        );

        const comments = [
            project.children[0].comment?.summary,
            project.children[0].children[0].comment?.summary,
            project.children[0].children[1].signatures![0].comment?.summary,
            project.children[1].signatures![0].comment?.summary,
        ].map(Comment.combineDisplayParts);

        equal(comments, ["bar", "metadata", "fn", "bar"]);
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
        const type = alias.type;
        ok(type instanceof ReflectionType);

        const expectedComment = new Comment();
        expectedComment.blockTags = [
            new CommentTag("@asdf", [
                { kind: "text", text: "Some example text" },
            ]),
        ];
        equal(type.declaration.signatures?.[0].comment, expectedComment);
    });

    it("#1745", () => {
        const project = convert();
        const Foo = query(project, "Foo");
        ok(Foo.type instanceof ReflectionType, "invalid type");

        const group = project.groups?.find((g) => g.title === "Type Aliases");
        ok(group, "missing group");
        const cat = group.categories?.find(
            (cat) => cat.title === "My category"
        );
        ok(cat, "missing cat");

        ok(cat.children.includes(Foo), "not included in cat");
        ok(!Foo.comment?.getTag("@category"), "has cat tag");
        ok(!Foo.type.declaration.comment?.getTag("@category"), "has cat tag 2");
        ok(
            !Foo.type.declaration.signatures?.some((s) =>
                s.comment?.getTag("@category")
            ),
            "has cat tag 3"
        );
    });

    it("#1770", () => {
        const project = convert();
        const sym1 = query(project, "sym1");
        equal(
            Comment.combineDisplayParts(sym1.signatures?.[0].comment?.summary),
            "Docs for Sym1"
        );

        const sym2 = query(project, "sym2");
        equal(
            Comment.combineDisplayParts(sym2.comment?.summary),
            "Docs for Sym2"
        );
    });

    it("#1771", () => {
        const project = convert();
        const check = query(project, "check");
        const tag = check.comment?.summary[0] as
            | InlineTagDisplayPart
            | undefined;
        equal(tag?.kind, "inline-tag");
        equal(tag.text, "method");
        ok(
            tag.target === query(project, "Test.method"),
            "Incorrect resolution"
        );
    });

    it("#1795", () => {
        const project = convert();
        equal(
            project.children?.map((c) => c.name),
            ["default", "foo"]
        );
        ok(project.children![0].kind === ReflectionKind.Reference);
        ok(project.children![1].kind !== ReflectionKind.Reference);
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
            ["typeof globalThis", "string"]
        );

        const test2 = query(project, "test2");
        equal(
            test2.signatures?.[0].parameters?.map((p) => p.type?.toString()),
            ["any", "string"]
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
                    ?.summary
            ),
            "Nested"
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
                    ?.summary
            ),
            "Nested"
        );
        equal(
            Comment.combineDisplayParts(
                barSig.type.types[1].declaration.getChildByName("min")?.comment
                    ?.summary
            ),
            "Nested"
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

        equal(
            Type1.type.declaration.signatures?.[0].comment,
            new Comment([{ kind: "text", text: "On Tag" }])
        );
        equal(
            Type2.type.declaration.signatures?.[0].comment,
            new Comment([{ kind: "text", text: "Some type 2." }])
        );
    });

    it("#1898", () => {
        const project = convert();
        app.validate(project);
        logger.expectMessage(
            "warn: UnDocFn.__type, defined in */gh1898.ts, does not have any documentation."
        );
        logger.expectNoOtherMessages();
    });

    it("#1903", () => {
        const project = convert();
        equal(
            Object.values(project.reflections).map((r) => r.name),
            ["typedoc"]
        );
    });

    it("#1903b", () => {
        const project = convert("gh1903b");
        equal(
            Object.values(project.reflections).map((r) => r.name),
            ["typedoc"]
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
                [new CommentTag("@returns", [{ kind: "text", text: "ret" }])]
            )
        );
    });

    it("#1927", () => {
        const project = convert();
        const ref = query(project, "Derived.getter");

        equal(
            ref.getSignature?.comment,
            new Comment([{ kind: "text", text: "Base" }])
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
                query(project, "WithDocs1").comment?.summary
            ),
            "second"
        );
    });

    it("#1962", () => {
        const project = convert();
        const foo = query(project, "foo");
        ok(foo.signatures);
        ok(project.hasComment(), "Missing module comment");
        ok(
            !foo.signatures[0].hasComment(),
            "Module comment attached to signature"
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
                ]
            )
        );
    });

    it("#1968", () => {
        const project = convert();
        const comments = ["Bar.x", "Bar.y", "Bar.z"].map((n) =>
            Comment.combineDisplayParts(query(project, n).comment?.summary)
        );
        equal(comments, ["getter", "getter", "setter"]);
    });

    it("#1973", () => {
        const project = convert();
        const comments = ["A", "B"].map((n) =>
            Comment.combineDisplayParts(query(project, n).comment?.summary)
        );

        equal(comments, ["A override", "B module"]);

        const comments2 = ["A.a", "B.b"].map((n) =>
            Comment.combineDisplayParts(
                query(project, n).signatures![0].comment?.summary
            )
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
            ]
        );
        logger.expectNoOtherMessages();
    });

    it("#1986", () => {
        const project = convert();
        const a = query(project, "a");
        equal(
            Comment.combineDisplayParts(a.comment?.summary),
            "[[include:file.md]] this is not a link."
        );
        logger.expectNoOtherMessages();
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
        const a = query(project, "a");
        equal(a.signatures![0].sources?.[0].fileName, "gh1996.ts");
        equal(a.signatures![0].sources?.[0].line, 1);
        equal(a.signatures![0].sources?.[0].character, 17);
        const b = query(project, "b");
        equal(b.signatures![0].sources?.[0].fileName, "gh1996.ts");
        equal(b.signatures![0].sources?.[0].line, 3);
        equal(b.signatures![0].sources?.[0].character, 0);
    });

    it("#2008", () => {
        const project = convert();
        const fn = query(project, "myFn").signatures![0];
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
            "Constructor parameter"
        );
        equal(
            Comment.combineDisplayParts(prop.comment?.summary),
            "Param comment",
            "Property"
        );
    });

    it("#2020", () => {
        const project = convert();
        const opt = query(project, "Options");
        equal(Comment.combineDisplayParts(opt.comment?.summary), "Desc");
        equal(
            Comment.combineDisplayParts(
                opt.getChildByName("url")?.comment?.summary
            ),
            "Desc2"
        );
        equal(
            Comment.combineDisplayParts(
                opt.getChildByName("apiKey")?.comment?.summary
            ),
            "Desc3"
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

        logger.expectNoOtherMessages();
    });

    it("#2033", () => {
        const project = convert();
        const cls = project.children!.find(
            (c) => c.name === "Foo" && c.kind === ReflectionKind.Class
        );
        ok(cls);

        const link = cls.comment?.summary[0];
        ok(link?.kind === "inline-tag");
        ok(link.target);

        logger.expectNoOtherMessages();
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
        for (const [name, docs] of [
            ["built", "inner docs"],
            ["built2", "outer docs"],
            ["fn", "inner docs"],
            ["fn2", "outer docs"],
        ]) {
            const refl = query(project, name);
            ok(refl.signatures?.[0]);
            equal(
                Comment.combineDisplayParts(
                    refl.signatures[0].comment?.summary
                ),
                docs,
                name
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
            "Foo type comment"
        );
    });

    it("#2135", () => {
        const project = convert();
        const hook = query(project, "Camera.useCameraPermissions");
        equal(hook.type?.type, "reflection" as const);
        equal(
            Comment.combineDisplayParts(
                hook.type.declaration.signatures![0].comment?.summary
            ),
            "One"
        );
    });

    it("#2150", () => {
        const project = convert();
        const intFn = query(project, "FileInt.intFn");
        equal(intFn.kind, ReflectionKind.Method, "intFn interface method");
        equal(
            Comment.combineDisplayParts(intFn.signatures?.[0].comment?.summary),
            "intFn doc"
        );

        const intProp = query(project, "FileInt.intVar");
        equal(intProp.kind, ReflectionKind.Property, "intVar interface prop");
        equal(
            Comment.combineDisplayParts(intProp.comment?.summary),
            "intVar doc"
        );

        const constFn = query(project, "FileInt.constFn");
        equal(constFn.kind, ReflectionKind.Method, "constFn interface method");
        equal(
            Comment.combineDisplayParts(
                constFn.signatures?.[0].comment?.summary
            ),
            "constFn doc"
        );

        const intFn2 = query(project, "FileClass.intFn");
        equal(intFn2.kind, ReflectionKind.Method, "intFn class method");

        const intProp2 = query(project, "FileClass.intVar");
        equal(intProp2.kind, ReflectionKind.Property, "intVar class prop");

        const constFn2 = query(project, "FileClass.constFn");
        equal(constFn2.kind, ReflectionKind.Method, "constFn class method");
        equal(
            Comment.combineDisplayParts(
                constFn2.signatures?.[0].comment?.summary
            ),
            "constFn doc"
        );
    });

    it("#2156", () => {
        app.options.setValue("excludeNotDocumented", true);
        const project = convert();
        const foo = query(project, "foo");
        equal(foo.signatures?.length, 1);
        equal(
            Comment.combineDisplayParts(foo.signatures[0].comment?.summary),
            "Is documented"
        );
    });

    it("#2165 module comments on global files", () => {
        const project = convert();
        equal(
            Comment.combineDisplayParts(project.comment?.summary),
            "'module' comment"
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
            true
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
                example.comment?.getTag("@example")?.content
            ),
            "```ts\nlet x = `str`\n```"
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
                `${name} method not properly linked`
            );

            const intTarget = intFn.signatures?.[0] || intFn;
            const clsSig =
                clsFn.signatures?.[0] ||
                clsFn.type?.visit({
                    reflection: (r) => r.declaration.signatures?.[0],
                });

            equal(
                clsSig!.implementationOf?.reflection?.getFullName(),
                intTarget!.getFullName(),
                `${name} signature not properly linked`
            );
        }
    });

    it("Handles implementationOf with symbols #2234", () => {
        const project = convert();
        const cm = query(project, "CharMap");
        equal(
            cm.children?.map((c) => c.name),
            ["constructor", "[iterator]", "at"]
        );

        equal(
            cm.children[1].implementationOf?.name,
            "ReadonlyCharMap.[iterator]"
        );
    });
});
