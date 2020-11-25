import * as ts from "typescript";

import { ReflectionKind } from "../../models/index";
import { getRawComment } from "./comment.js";

function hasCommentOnParentAxis(node: ts.Node): boolean {
    let currentNode: ts.Node = node;

    while (currentNode) {
        if (getRawComment(currentNode)) {
            return true;
        }

        currentNode = currentNode.parent;
    }

    return false;
}

export function shouldBeIgnoredAsNotDocumented(
    node: ts.Declaration,
    kind: ReflectionKind
): boolean {
    // never ignore modules, the project, or enum members
    if (
        kind === ReflectionKind.Module ||
        kind === ReflectionKind.Project ||
        kind === ReflectionKind.EnumMember
    ) {
        return false;
    }

    // do not ignore properties of the object types, that has comment themselves, for example
    //
    // /**
    //  * has docs
    //  */
    //  export SomeType = { prop1 : string }
    //
    // same applies to the inline types for function arguments:
    //
    // function someFunc(arg1 : { prop1 : string, prop2 : number }) {...}
    //
    // The `prop1` from above should be included in the docs, even that it has no documentation
    // Note, that this does not seem to apply to classes and interfaces - for those, even the class/interface
    // has docs, we still want to exclude the undocumented properties
    // Thankfully for object literals the kind of properties seems to be set to ReflectionKind.Variable
    if (kind === ReflectionKind.Variable && hasCommentOnParentAxis(node)) {
        return false;
    }

    const hasComment = Boolean(getRawComment(node));

    return !hasComment;
}
