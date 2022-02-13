import { deepStrictEqual as equal, ok } from "assert";
import {
    DeclarationReflection,
    ProjectReflection,
    ReflectionKind,
    Comment,
} from "../lib/models";

function query(project: ProjectReflection, name: string) {
    const reflection = project.getChildByName(name);
    ok(reflection instanceof DeclarationReflection, `Failed to find ${name}`);
    return reflection;
}

export const behaviorTests: Record<
    string,
    (project: ProjectReflection) => void
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
    // Disabled for now, pending https://github.com/TypeStrong/typedoc/issues/1809
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
