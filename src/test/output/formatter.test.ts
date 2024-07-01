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
    ProjectReflection,
    ReflectionKind,
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

    // TODO: reflection

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
