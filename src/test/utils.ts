import { ok } from "assert";
import {
    Comment,
    DeclarationReflection,
    type ProjectReflection,
    Reflection,
    ReflectionKind,
    type SignatureReflection,
} from "../index.js";
import { filterMap } from "../lib/utils/index.js";
import { equal } from "assert/strict";

export function query(
    project: ProjectReflection,
    name: string,
): DeclarationReflection {
    const reflection = project.getChildByName(name);
    ok(reflection instanceof DeclarationReflection, `Failed to find ${name}`);
    return reflection;
}

export function querySig(
    project: ProjectReflection,
    name: string,
    index = 0,
): SignatureReflection {
    const decl = query(project, name);
    ok(
        decl.signatures?.length ?? 0 > index,
        `Reflection "${name}" does not contain signature`,
    );
    return decl.signatures![index];
}

export function getComment(project: ProjectReflection, name: string) {
    return Comment.combineDisplayParts(query(project, name).comment?.summary);
}

export function getSigComment(
    project: ProjectReflection,
    name: string,
    index = 0,
) {
    return Comment.combineDisplayParts(
        querySig(project, name, index).comment?.summary,
    );
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

export function equalKind(refl: Reflection, kind: ReflectionKind) {
    equal(
        refl.kind,
        kind,
        `Expected ${ReflectionKind[kind]} but got ${ReflectionKind[refl.kind]}`,
    );
}

export function dedent(text: string) {
    const lines = text.split(/\r?\n/);
    while (lines.length && lines[0].search(/\S/) === -1) {
        lines.shift();
    }
    while (lines.length && lines[lines.length - 1].search(/\S/) === -1) {
        lines.pop();
    }

    const minIndent = lines.reduce(
        (indent, line) =>
            line.length ? Math.min(indent, line.search(/\S/)) : indent,
        Infinity,
    );

    return lines.map((line) => line.substring(minIndent)).join("\n");
}
