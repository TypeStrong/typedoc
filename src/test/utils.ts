import { ok } from "assert";
import {
    Comment,
    DeclarationReflection,
    ProjectReflection,
    Reflection,
    ReflectionKind,
} from "..";
import { filterMap } from "../lib/utils";

export function query(project: ProjectReflection, name: string) {
    const reflection = project.getChildByName(name);
    ok(reflection instanceof DeclarationReflection, `Failed to find ${name}`);
    return reflection;
}

export function getComment(project: ProjectReflection, name: string) {
    return Comment.combineDisplayParts(query(project, name).comment?.summary);
}

export function getLinks(refl: Reflection): Array<{
    display: string;
    target: undefined | string | [ReflectionKind, string];
}> {
    ok(refl.comment);
    return filterMap(refl.comment.summary, (p) => {
        if (p.kind === "inline-tag" && p.tag === "@link") {
            if (typeof p.target === "string") {
                return { display: p.tsLinkText || p.text, target: p.target };
            }
            if (p.target instanceof Reflection) {
                return {
                    display: p.tsLinkText || p.target.name,
                    target: [p.target.kind, p.target.getFullName()],
                };
            }
            return {
                display: p.tsLinkText || p.text,
                target: p.target?.getStableKey(),
            };
        }
    });
}
