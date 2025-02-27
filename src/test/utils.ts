import { ok } from "assert";
import {
    Comment,
    DeclarationReflection,
    type ProjectReflection,
    Reflection,
    ReflectionKind,
    type SignatureReflection,
    TraverseProperty,
} from "../index.js";
import { filterMap } from "#utils";
import { equal } from "assert/strict";
import type { SomeReflection } from "../lib/models/variant.js";

export function query(
    project: ProjectReflection,
    name: string,
): DeclarationReflection {
    let refl: SomeReflection | undefined = project;
    const parts = name.split(".");

    for (let i = 0; i < parts.length; ++i) {
        if (!refl) break;
        if (refl.isReference()) {
            refl = refl.getTargetReflectionDeep() as SomeReflection;
        }

        if (refl.isDocument()) {
            throw new Error("Found document");
        }

        if (refl.isProject()) {
            refl = refl.getChildByName([parts[i]]) as
                | SomeReflection
                | undefined;
            continue;
        }

        if (refl.type?.type === "reflection") {
            refl = refl.type.declaration.getChildByName([parts[i]]) as
                | SomeReflection
                | undefined;
            continue;
        }

        refl = refl.getChildByName([parts[i]]) as SomeReflection | undefined;
    }

    ok(
        refl instanceof DeclarationReflection,
        `Failed to find ${name}\n${project.toStringHierarchy()}`,
    );
    return refl;
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

interface ReflectionTree {
    [name: string]: ReflectionTree;
}

export function reflToTree(refl: Reflection) {
    const result: ReflectionTree = {};

    refl.traverse((refl, prop) => {
        if (prop == TraverseProperty.Children) {
            if (refl.name in result) {
                result[`${ReflectionKind[refl.kind]}:${refl.name}`] = reflToTree(refl);
            } else {
                result[refl.name] = reflToTree(refl);
            }
        }
        return true;
    });

    return result;
}
