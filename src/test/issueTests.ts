import { deepStrictEqual as equal, ok } from "assert";
import {
    DeclarationReflection,
    ProjectReflection,
    QueryType,
    ReflectionKind,
    SignatureReflection,
    ReflectionType,
    Comment,
    CommentTag,
} from "../lib/models";

function query(project: ProjectReflection, name: string) {
    const reflection = project.getChildByName(name);
    ok(reflection instanceof DeclarationReflection, `Failed to find ${name}`);
    return reflection;
}

export const issueTests: {
    [issue: string]: (project: ProjectReflection) => void;
} = {
    gh869(project) {
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
    },

    gh1124(project) {
        equal(
            project.children?.length,
            1,
            "Namespace with type and value converted twice"
        );
    },

    gh1150(project) {
        const refl = query(project, "IntersectFirst");
        equal(refl?.kind, ReflectionKind.TypeAlias);
        equal(refl.type?.type, "indexedAccess");
    },

    gh1164(project) {
        const refl = query(project, "gh1164");
        equal(
            refl.signatures?.[0]?.parameters?.[0]?.comment?.shortText,
            "{@link CommentedClass} Test description."
        );
        equal(refl.signatures?.[0]?.comment?.returns, "Test description.\n");
    },

    gh1215(project) {
        const foo = query(project, "Foo.bar");
        ok(foo.setSignature instanceof SignatureReflection);
        equal(foo.setSignature.type?.toString(), "void");
    },

    gh1255(project) {
        const foo = query(project, "C.foo");
        equal(foo.comment?.shortText, "Docs!");
    },

    gh1330(project) {
        const example = query(project, "ExampleParam");
        equal(example?.type?.type, "reference");
        equal(example.type.toString(), "Example");
    },

    gh1366(project) {
        const foo = query(project, "GH1366.Foo");
        equal(foo.kind, ReflectionKind.Reference);
    },

    gh1408(project) {
        const foo = query(project, "foo");
        const type = foo?.signatures?.[0]?.typeParameters?.[0].type;
        equal(type?.type, "array");
        equal(type?.toString(), "unknown[]");
    },

    gh1436(project) {
        equal(
            project.children?.map((c) => c.name),
            ["gh1436"]
        );
    },

    gh1449(project) {
        const refl = query(project, "gh1449").signatures?.[0];
        equal(
            refl?.typeParameters?.[0].type?.toString(),
            "[foo: any, bar?: any]"
        );
    },

    gh1454(project) {
        const foo = query(project, "foo");
        const fooRet = foo?.signatures?.[0]?.type;
        equal(fooRet?.type, "reference");
        equal(fooRet?.toString(), "Foo");

        const bar = query(project, "bar");
        const barRet = bar?.signatures?.[0]?.type;
        equal(barRet?.type, "reference");
        equal(barRet?.toString(), "Bar");
    },

    gh1462(project) {
        const prop = query(project, "PROP");
        equal(prop.type?.toString(), "number");

        // Would be nice to get this to work someday
        equal(prop.comment?.shortText, void 0);

        const method = query(project, "METHOD");
        equal(method.signatures?.[0].comment?.shortText, "method docs");
    },

    gh1481(project) {
        const signature = query(project, "GH1481.static").signatures?.[0];
        equal(signature?.comment?.shortText, "static docs");
        equal(signature?.type?.toString(), "void");
    },

    gh1483(project) {
        equal(
            query(project, "gh1483.namespaceExport").kind,
            ReflectionKind.Function
        );
        equal(
            query(project, "gh1483_2.staticMethod").kind,
            ReflectionKind.Method
        );
    },

    gh1490(project) {
        const refl = query(project, "GH1490.optionalMethod");
        equal(refl.signatures?.[0]?.comment?.shortText, "With comment");
    },

    gh1509(project) {
        const pFoo = query(project, "PartialFoo.foo");
        equal(pFoo.flags.isOptional, true);

        const rFoo = query(project, "ReadonlyFoo.foo");
        equal(rFoo.flags.isReadonly, true);
        equal(rFoo.flags.isOptional, true);
    },

    gh1514(project) {
        // Not ideal. Really we want to handle these names nicer...
        query(project, "ComputedUniqueName.[UNIQUE_SYMBOL]");
    },

    gh1522(project) {
        equal(
            project.groups?.map((g) => g.categories?.map((c) => c.title)),
            [["cat"]]
        );
    },

    gh1524(project) {
        const nullableParam = query(project, "nullable").signatures?.[0]
            ?.parameters?.[0];
        equal(nullableParam?.type?.toString(), "null | string");

        const nonNullableParam = query(project, "nonNullable").signatures?.[0]
            ?.parameters?.[0];
        equal(nonNullableParam?.type?.toString(), "string");
    },

    gh1534(project) {
        const func = query(project, "gh1534");
        equal(
            func.signatures?.[0]?.parameters?.[0]?.type?.toString(),
            "readonly [number, string]"
        );
    },

    gh1547(project) {
        equal(
            project.children?.map((c) => c.name),
            ["Test", "ThingA", "ThingB"]
        );
    },

    gh1552(project) {
        equal(query(project, "emptyArr").defaultValue, "[]");
        equal(query(project, "nonEmptyArr").defaultValue, "...");
        equal(query(project, "emptyObj").defaultValue, "{}");
        equal(query(project, "nonEmptyObj").defaultValue, "...");
    },

    gh1578(project) {
        ok(query(project, "notIgnored"));
        ok(
            !project.findReflectionByName("ignored"),
            "Symbol re-exported from ignored file is ignored."
        );
    },

    gh1580(project) {
        ok(
            query(project, "B.prop").hasComment(),
            "Overwritten property with no comment should be inherited"
        );
        ok(
            query(project, "B.run").signatures?.[0]?.hasComment(),
            "Overwritten method with no comment should be inherited"
        );
    },

    gh1624(project) {
        ok(
            query(project, "Foo.baz").signatures?.[0]?.hasComment(),
            "Property methods declared in interface should still allow comment inheritance"
        );
    },

    gh1626(project) {
        const ctor = query(project, "Foo.constructor");
        equal(ctor.sources?.[0]?.line, 2);
        equal(ctor.sources?.[0]?.character, 4);
    },

    gh1660(project) {
        const alias = query(project, "SomeType");
        ok(alias.type instanceof QueryType);
        equal(alias.type.queryType.name, "m.SomeClass.someProp");
    },

    gh1733(project) {
        const alias = query(project, "Foo");
        equal(alias.typeParameters?.[0].comment?.shortText.trim(), "T docs");
        const cls = query(project, "Bar");
        equal(cls.typeParameters?.[0].comment?.shortText.trim(), "T docs");
    },

    gh1734(project) {
        const alias = query(project, "Foo");
        const type = alias.type;
        ok(type instanceof ReflectionType);

        const expectedComment = new Comment();
        expectedComment.returns = undefined;
        expectedComment.tags = [
            new CommentTag("asdf", void 0, "Some example text\n"),
        ];
        equal(type.declaration.signatures?.[0].comment, expectedComment);
    },

    gh1745(project) {
        const Foo = query(project, "Foo");
        ok(Foo.type instanceof ReflectionType);

        const group = project.groups?.find(
            (g) => g.kind === ReflectionKind.TypeAlias
        );
        ok(group);
        const cat = group.categories?.find(
            (cat) => cat.title === "My category"
        );
        ok(cat);

        ok(cat.children.includes(Foo));
        ok(!Foo.comment?.hasTag("category"));
        ok(!Foo.type.declaration.comment?.hasTag("category"));
        ok(
            !Foo.type.declaration.signatures?.some((s) =>
                s.comment?.hasTag("category")
            )
        );
    },

    gh1795(project) {
        equal(
            project.children?.map((c) => c.name),
            ["default", "foo"]
        );
        ok(project.children![0].kind === ReflectionKind.Reference);
        ok(project.children![1].kind !== ReflectionKind.Reference);
    },

    gh1807(project) {
        const Class1 = query(project, "Class1");
        ok(!Class1.comment?.hasTag("class"));
        ok(Class1.comment?.shortText === "This is another class.");

        const Class2 = query(project, "Class2");
        ok(!Class2.comment?.hasTag("extends"));
        ok(Class2.comment?.shortText === "This is yet another class.");

        const Class3 = query(project, "Class3");
        ok(!Class3.comment?.hasTag("class"));
        ok(!Class3.comment?.hasTag("extends"));
        ok(Class3.comment?.shortText === "Some docs.");

        const Class4 = query(project, "Class4");
        ok(!Class4.comment?.hasTag("class"));
        ok(Class4.comment?.hasTag("alpha"));
        ok(Class4.comment?.shortText === "This is a different class.");

        const Class5 = query(project, "Class5");
        ok(!Class5.comment?.hasTag("class"));
        ok(Class5.comment?.hasTag("alpha"));
        ok(Class5.comment?.hasTag("remarks"));
        ok(
            Class5.comment?.getTag("remarks")?.text ===
                "\n\nThis class has insightful remarks.\n\nThey span multiple lines.\n"
        );
        ok(Class5.comment?.shortText === "This is a different class.");
    },
};
