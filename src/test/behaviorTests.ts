import { deepStrictEqual as equal, ok } from "assert";
import {
    DeclarationReflection,
    ProjectReflection,
    ReflectionKind,
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
        equal(SomeEnumLike.kind, ReflectionKind.Variable);
        const SomeEnumLikeTagged = query(project, "SomeEnumLikeTagged");
        equal(SomeEnumLikeTagged.kind, ReflectionKind.Enum);
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
    overloads(project) {
        const foo = query(project, "foo");
        equal(foo.signatures?.length, 2);

        equal(foo.signatures[0].comment?.summary, "Implementation comment");
        equal(foo.signatures[0].comment?.tags, []);

        equal(foo.signatures[1].comment?.summary, "Overrides summary");
        equal(foo.signatures[1].comment?.tags, []);
        equal(
            foo.signatures[1].parameters?.[0].comment?.summary.trim(),
            "docs for x"
        );

        equal(foo.comment, undefined);
    },
};
