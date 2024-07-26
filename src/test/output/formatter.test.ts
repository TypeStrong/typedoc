import { equal } from "assert";
import {
    ConditionalType,
    IndexedAccessType,
    InferredType,
    IntersectionType,
    IntrinsicType,
    LiteralType,
    MappedType,
    NamedTupleMember,
    OptionalType,
    PredicateType,
    QueryType,
    ReferenceType,
    ReflectionType,
    RestType,
    TemplateLiteralType,
    TupleType,
    TypeContext,
    TypeOperatorType,
    UnionType,
    UnknownType,
    type SomeType,
} from "../../lib/models/types.js";
import { renderElementToText } from "../../lib/utils/jsx.js";
import { dedent } from "../utils.js";
import {
    DeclarationReflection,
    FileRegistry,
    ParameterReflection,
    ProjectReflection,
    ReflectionFlag,
    ReflectionKind,
    SignatureReflection,
    TypeParameterReflection,
} from "../../lib/models/index.js";
import {
    FormattedCodeBuilder,
    FormattedCodeGenerator,
    Wrap,
} from "../../lib/output/formatter.js";

export function renderType(type: SomeType, maxWidth = 80, startWidth = 0) {
    const builder = new FormattedCodeBuilder(() => "");
    const tree = builder.type(type, TypeContext.none);
    const generator = new FormattedCodeGenerator(maxWidth, startWidth);
    generator.node(tree, Wrap.Detect);
    return generator.toElement();
}

describe("Formatter", () => {
    it("Handles a literal type", () => {
        const literal = new LiteralType(123);
        const text = renderElementToText(renderType(literal));
        equal(text, "123");
    });

    it("Handles a conditional type", () => {
        const [a, b, c, d] = ["a", "b", "c", "d"].map(
            (x) => new LiteralType(x),
        );
        const cond = new ConditionalType(a, b, c, d);

        const text = renderElementToText(renderType(cond));
        equal(text, `"a" extends "b" ? "c" : "d"`);

        const wrappedText = renderElementToText(renderType(cond, 10));
        equal(
            wrappedText,
            dedent(`
            "a" extends "b"
                ? "c"
                : "d"
            `),
        );
    });

    it("Handles an indexed access type", () => {
        const [a, b] = ["object", "index"].map((x) => new LiteralType(x));
        const type = new IndexedAccessType(a, b);

        const text = renderElementToText(renderType(type));
        equal(text, `"object"["index"]`);

        const wrappedText = renderElementToText(renderType(type, 2));
        equal(wrappedText, `"object"["index"]`);
    });

    it("Handles a simple inferred type", () => {
        const [a, _b, c, d] = ["a", "b", "c", "d"].map(
            (x) => new LiteralType(x),
        );
        const inferred = new InferredType("U");
        const type = new ConditionalType(a, inferred, c, d);

        const text = renderElementToText(renderType(type));
        equal(text, `"a" extends infer U ? "c" : "d"`);
    });

    it("Handles a complex inferred type", () => {
        const [a, b, c, d] = ["a", "b", "c", "d"].map(
            (x) => new LiteralType(x),
        );
        const inferred = new InferredType("U", b);
        const type = new ConditionalType(a, inferred, c, d);

        const text = renderElementToText(renderType(type));
        equal(text, `"a" extends infer U extends "b" ? "c" : "d"`);

        const wrappedText = renderElementToText(renderType(type, 2));
        equal(
            wrappedText,
            dedent(`
            "a" extends infer U extends
                "b"
                ? "c"
                : "d"
            `),
        );
    });

    it("Handles intersection types", () => {
        const types = ["a", "b", "c", "d"].map((x) => new LiteralType(x));
        const type = new IntersectionType(types);

        const text = renderElementToText(renderType(type));
        equal(text, `"a" & "b" & "c" & "d"`);
    });

    it("Handles intrinsic types", () => {
        const type = new IntrinsicType("string");
        const text = renderElementToText(renderType(type));
        equal(text, `string`);
    });

    it("Handles mapped types", () => {
        const [a, b, c, d] = ["a", "b", "c", "d"].map(
            (x) => new LiteralType(x),
        );
        const type = new MappedType("K", a, new UnionType([c, d]), "+", "-", b);

        const text = renderElementToText(renderType(type));
        equal(text, `{ readonly [K in "a" as "b"]-?: "c" | "d" }`);

        const text2 = renderElementToText(renderType(type, 50, 8));
        equal(
            text2,
            dedent(`
                {
                    readonly [K in "a" as "b"]-?: "c" | "d"
                }
            `),
        );

        const text3 = renderElementToText(renderType(type, 40, 8));
        equal(
            text3,
            dedent(`
                {
                    readonly [K in "a" as "b"]-?:
                        | "c"
                        | "d"
                }
            `),
        );
    });

    it("Handles named tuple members", () => {
        const type = new NamedTupleMember("a", false, new LiteralType(123));

        const text = renderElementToText(renderType(type));
        equal(text, `a: 123`);

        const type2 = new NamedTupleMember("a", true, new LiteralType(123));
        const text2 = renderElementToText(renderType(type2));
        equal(text2, `a?: 123`);
    });

    it("Handles optional types", () => {
        const type = new OptionalType(new LiteralType(123));
        const text = renderElementToText(renderType(type));
        equal(text, `123?`);
    });

    it("Handles predicate types", () => {
        const type = new PredicateType("x", true);
        const text = renderElementToText(renderType(type));
        equal(text, `asserts x`);

        const type2 = new PredicateType(
            "x",
            false,
            new IntrinsicType("string"),
        );
        const text2 = renderElementToText(renderType(type2));
        equal(text2, `x is string`);
    });

    it("Handles query types", () => {
        const project = new ProjectReflection("", new FileRegistry());
        const type = new QueryType(
            ReferenceType.createBrokenReference("x", project),
        );
        const text = renderElementToText(renderType(type));
        equal(text, `typeof x`);
    });

    it("Handles a simple reference type", () => {
        const project = new ProjectReflection("", new FileRegistry());
        const type = ReferenceType.createBrokenReference("x", project);
        const text = renderElementToText(renderType(type));
        equal(text, `x`);
    });

    it("Handles a resolved reference type", () => {
        const project = new ProjectReflection("", new FileRegistry());
        const ns = new DeclarationReflection(
            "ns",
            ReflectionKind.Namespace,
            project,
        );
        const ns2 = new DeclarationReflection(
            "target", // shares name with target
            ReflectionKind.Namespace,
            project,
        );
        const target = new DeclarationReflection(
            "target",
            ReflectionKind.Variable,
            ns,
        );
        project.registerReflection(ns, undefined, undefined);
        project.registerReflection(ns2, undefined, undefined);
        project.registerReflection(target, undefined, undefined);

        const type = ReferenceType.createResolvedReference(
            "x",
            target,
            project,
        );
        const text = renderElementToText(renderType(type));
        equal(text, `ns.target`);

        target.kind = ReflectionKind.TypeParameter;
        const text2 = renderElementToText(renderType(type));
        equal(text2, `target`);
    });

    it("Handles a reference type pointing to an external url", () => {
        const project = new ProjectReflection("", new FileRegistry());
        const type = ReferenceType.createBrokenReference("x", project);
        type.externalUrl = "https://example.com";
        const text = renderElementToText(renderType(type));
        equal(text, `x`);
    });

    it("Handles a reference type targeting a type parameter", () => {
        const project = new ProjectReflection("", new FileRegistry());
        const type = ReferenceType.createBrokenReference("x", project);
        type.refersToTypeParameter = true;
        const text = renderElementToText(renderType(type));
        equal(text, `x`);
    });

    it("Handles a reference type with type arguments", () => {
        const project = new ProjectReflection("", new FileRegistry());
        const type = ReferenceType.createBrokenReference("x", project);
        type.typeArguments = [
            new LiteralType(123),
            new LiteralType(456),
            new LiteralType(789),
        ];
        const text = renderElementToText(renderType(type));
        equal(text, `x<123, 456, 789>`);

        const text2 = renderElementToText(renderType(type, 0));
        equal(
            text2,
            dedent(`
                x<
                    123,
                    456,
                    789,
                >
            `),
        );
    });

    it("Handles an index signature reflection type", () => {
        const decl = new DeclarationReflection(
            "__type",
            ReflectionKind.TypeLiteral,
        );
        decl.indexSignatures = [
            new SignatureReflection(
                "__index",
                ReflectionKind.IndexSignature,
                decl,
            ),
        ];
        decl.indexSignatures[0].type = new IntrinsicType("string");
        decl.indexSignatures[0].parameters = [
            new ParameterReflection("x", ReflectionKind.Parameter),
        ];
        decl.indexSignatures[0].parameters[0].type = new IntrinsicType(
            "number",
        );

        const type = new ReflectionType(decl);
        const text = renderElementToText(renderType(type));
        equal(text, `{ [x: number]: string }`);

        const textWrap = renderElementToText(renderType(type, 0));
        equal(
            textWrap,
            dedent(`
                {
                    [x: number]: string;
                }
            `),
        );
    });

    it("Handles single signature callback reflection types", () => {
        const decl = new DeclarationReflection(
            "__type",
            ReflectionKind.TypeLiteral,
        );
        const sig = new SignatureReflection(
            "__call",
            ReflectionKind.CallSignature,
            decl,
        );
        decl.signatures = [sig];
        sig.type = new LiteralType("str");
        sig.parameters = [
            new ParameterReflection("x", ReflectionKind.Parameter),
            new ParameterReflection("y", ReflectionKind.Parameter),
        ];
        sig.parameters[0].setFlag(ReflectionFlag.Optional);
        sig.parameters[1].setFlag(ReflectionFlag.Rest);
        sig.parameters[0].type = new IntrinsicType("string");
        sig.parameters[1].type = new IntrinsicType("number");

        const type = new ReflectionType(decl);
        const text = renderElementToText(renderType(type));
        equal(text, `(x?: string, ...y: number) => "str"`);

        const textWrap = renderElementToText(renderType(type, 0));
        equal(
            textWrap,
            dedent(`
            (
                x?: string,
                ...y: number,
            ) => "str"
            `),
        );
    });

    it("Handles abstract construct signature", () => {
        const decl = new DeclarationReflection(
            "__type",
            ReflectionKind.TypeLiteral,
        );
        const sig = new SignatureReflection(
            "__call",
            ReflectionKind.ConstructorSignature,
            decl,
        );
        sig.type = new IntrinsicType("Number");
        sig.flags.setFlag(ReflectionFlag.Abstract, true);
        decl.signatures = [sig];

        const type = new ReflectionType(decl);
        const text = renderElementToText(renderType(type));
        equal(text, `abstract new () => Number`);
    });

    it("Handles multiple signature callback reflection types", () => {
        const decl = new DeclarationReflection(
            "__type",
            ReflectionKind.TypeLiteral,
        );
        const sig = new SignatureReflection(
            "__call",
            ReflectionKind.CallSignature,
            decl,
        );
        decl.signatures = [sig, sig];
        sig.type = new LiteralType("str");
        sig.parameters = [
            new ParameterReflection("x", ReflectionKind.Parameter),
            new ParameterReflection("y", ReflectionKind.Parameter),
        ];
        sig.parameters[0].type = new IntrinsicType("string");
        sig.parameters[1].type = new IntrinsicType("number");

        const type = new ReflectionType(decl);
        const text = renderElementToText(renderType(type, 1000, 0));
        equal(
            text,
            `{ (x: string, y: number): "str"; (x: string, y: number): "str" }`,
        );

        const textWrap = renderElementToText(renderType(type, 0));
        equal(
            textWrap,
            dedent(`
            {
                (
                    x: string,
                    y: number,
                ): "str";
                (
                    x: string,
                    y: number,
                ): "str";
            }
            `),
        );
    });

    it("Handles type parameters on signatures", () => {
        const decl = new DeclarationReflection(
            "__type",
            ReflectionKind.TypeLiteral,
        );
        const sig = new SignatureReflection(
            "__call",
            ReflectionKind.CallSignature,
            decl,
        );
        const a = new TypeParameterReflection("a", sig, undefined);
        a.setFlag(ReflectionFlag.Const);
        a.type = new IntrinsicType("string");
        const b = new TypeParameterReflection("b", sig, "in out");
        const c = new TypeParameterReflection("c", sig, undefined);
        c.default = new IntrinsicType("string");
        sig.typeParameters = [a, b, c];
        decl.signatures = [sig];

        const type = new ReflectionType(decl);
        const text = renderElementToText(renderType(type));
        equal(text, `<const a extends string, in out b, c = string>() => any`);

        const textWrap = renderElementToText(renderType(type, 0));
        equal(
            textWrap,
            dedent(`
                <
                    const a extends
                        string,
                    in out b,
                    c = string,
                >() => any
            `),
        );
    });

    it("Handles simple object types", () => {
        const refl = new DeclarationReflection(
            "__type",
            ReflectionKind.TypeLiteral,
        );
        const a = new DeclarationReflection("a", ReflectionKind.Property, refl);
        a.type = new IntrinsicType("string");
        refl.addChild(a);
        const b = new DeclarationReflection("b", ReflectionKind.Property, refl);
        b.getSignature = new SignatureReflection(
            "b",
            ReflectionKind.GetSignature,
            b,
        );
        b.getSignature.type = new IntrinsicType("string");
        b.setSignature = new SignatureReflection(
            "b",
            ReflectionKind.SetSignature,
            b,
        );
        b.setSignature.type = new IntrinsicType("void");
        b.setSignature.parameters = [
            new ParameterReflection("value", ReflectionKind.Parameter),
        ];
        b.setSignature.parameters[0].type = new UnionType([
            new IntrinsicType("string"),
            new IntrinsicType("number"),
        ]);
        refl.addChild(b);

        const type = new ReflectionType(refl);
        const text = renderElementToText(renderType(type));
        equal(
            text,
            "{ a: string; get b(): string; set b(value: string | number): void }",
        );

        const textWrap = renderElementToText(renderType(type, 0));
        equal(
            textWrap,
            dedent(`
                {
                    a: string;
                    get b(): string;
                    set b(
                        value:
                            | string
                            | number,
                    ): void;
                }
            `),
        );
    });

    it("Handles get/set only properties", () => {
        const refl = new DeclarationReflection(
            "__type",
            ReflectionKind.TypeLiteral,
        );
        const a = new DeclarationReflection("a", ReflectionKind.Property, refl);
        a.getSignature = new SignatureReflection(
            "a",
            ReflectionKind.GetSignature,
            a,
        );
        a.getSignature.type = new IntrinsicType("string");
        refl.addChild(a);
        const b = new DeclarationReflection("b", ReflectionKind.Property, refl);
        b.setSignature = new SignatureReflection(
            "b",
            ReflectionKind.SetSignature,
            b,
        );
        b.setSignature.type = new IntrinsicType("void");
        b.setSignature.parameters = [
            new ParameterReflection("value", ReflectionKind.Parameter),
        ];
        b.setSignature.parameters[0].type = new UnionType([
            new IntrinsicType("string"),
            new IntrinsicType("number"),
        ]);
        refl.addChild(b);

        const type = new ReflectionType(refl);
        const text = renderElementToText(renderType(type));
        equal(text, "{ get a(): string; set b(value: string | number): void }");

        const textWrap = renderElementToText(renderType(type, 0));
        equal(
            textWrap,
            dedent(`
                {
                    get a(): string;
                    set b(
                        value:
                            | string
                            | number,
                    ): void;
                }
            `),
        );
    });

    it("Handles callable members", () => {
        const refl = new DeclarationReflection(
            "__type",
            ReflectionKind.TypeLiteral,
        );
        const a = new DeclarationReflection("a", ReflectionKind.Property, refl);
        const sig = new SignatureReflection(
            "a",
            ReflectionKind.CallSignature,
            a,
        );
        sig.type = new IntrinsicType("string");
        a.signatures = [sig, sig];
        refl.addChild(a);

        const type = new ReflectionType(refl);
        const text = renderElementToText(renderType(type));
        equal(text, "{ a(): string; a(): string }");

        const textWrap = renderElementToText(renderType(type, 0));
        equal(
            textWrap,
            dedent(`
                {
                    a(): string;
                    a(): string;
                }
            `),
        );
    });

    it("Handles rest types", () => {
        const type = new RestType(new LiteralType("x"));
        const text = renderElementToText(renderType(type));
        equal(text, `..."x"`);
    });

    it("Handles template literal types", () => {
        const type = new TemplateLiteralType("head", [
            [new LiteralType(123), "more"],
            [new LiteralType(2), ""],
        ]);
        const text = renderElementToText(renderType(type));
        equal(text, "`head${123}more${2}`");
    });

    it("Handles tuple types", () => {
        const types = Array.from({ length: 5 }, (_, i) => new LiteralType(i));
        const type = new TupleType(types);
        const text = renderElementToText(renderType(type));
        equal(text, `[0, 1, 2, 3, 4]`);

        const text2 = renderElementToText(renderType(type, 0));
        equal(
            text2,
            dedent(`
            [
                0,
                1,
                2,
                3,
                4,
            ]
        `),
        );
    });

    it("Handles type operator types", () => {
        const type = new TypeOperatorType(new LiteralType(123), "keyof");
        const text = renderElementToText(renderType(type));
        equal(text, `keyof 123`);
    });

    it("Handles a union type", () => {
        const lit = new LiteralType(123);
        const union = new UnionType([lit, lit, lit, lit, lit]);
        const text = renderElementToText(renderType(union));
        equal(text, "123 | 123 | 123 | 123 | 123");

        const wrappedText = renderElementToText(renderType(union, 10));
        equal(
            wrappedText,
            `\n    | ${union.types.map((t) => t.toString()).join("\n    | ")}`,
        );
    });

    it("Handles unknown types", () => {
        const type = new UnknownType("a | <b");
        const text = renderElementToText(renderType(type));
        equal(text, "a | <b");
    });

    it("Adds parenthesis when required", () => {
        const [a, b, c, d] = Array.from(
            { length: 4 },
            (_, i) => new LiteralType(i),
        );
        const type = new IntersectionType([
            new UnionType([a, b]),
            new UnionType([c, d]),
        ]);

        const text = renderElementToText(renderType(type));
        equal(text, "(0 | 1) & (2 | 3)");
    });
});
