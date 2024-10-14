import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import type { PageEvent } from "../../../events.js";
import { JSX } from "../../../../utils/index.js";
import {
    DeclarationReflection,
    type ProjectReflection,
    ReferenceType,
    ReflectionKind,
} from "../../../../models/index.js";

interface HierarchyElement {
    text: string;
    path?: string;
    kind?: ReflectionKind;
    parents?: HierarchyElement[];
    children?: HierarchyElement[];
    depth?: number;
}

export function hierarchyTemplate(context: DefaultThemeRenderContext, props: PageEvent<ProjectReflection>) {
    const trees = getTrees(props.project);

    return (
        <section class="tsd-panel tsd-hierarchy">
            <h4>{context.i18n.theme_hierarchy_summary()}</h4>

            {trees.map((tree) =>
                hierarchyList(
                    context,
                    tree.filter((branch) => !branch.parents?.length),
                ),
            )}
        </section>
    );
}

function getTrees(project: ProjectReflection) {
    const stack = getStack(project);

    const trees: HierarchyElement[][] = [];

    while (stack.length > 0) {
        const seed = stack.shift()!;

        let tree = findBranches(seed);

        tree.forEach((branch) => {
            const idx = stack.indexOf(branch);

            if (idx !== -1) stack.splice(idx, 1);
        });

        if (tree.length <= 1) continue;

        tree = sortBranches(tree);

        tree = growBranches(tree);

        tree = pruneBranches(tree);

        trees.push(tree);
    }

    return trees;
}

function getStack(project: ProjectReflection) {
    const stack = (project.getReflectionsByKind(ReflectionKind.ClassOrInterface) as DeclarationReflection[])
        .filter((reflection) => reflection.extendedTypes?.length || reflection.extendedBy?.length)
        .map((reflection) => ({
            // Full name should be safe here, since this list only includes classes/interfaces.
            text: reflection.getFullName(),
            path: reflection.url!,
            kind: reflection.kind,
            parents: reflection.extendedTypes
                ?.map((type) =>
                    !(type instanceof ReferenceType) || !(type.reflection instanceof DeclarationReflection)
                        ? undefined
                        : { path: type.reflection.url! },
                )
                .filter((parent) => !!parent),
            children: reflection.extendedBy
                ?.map((type) =>
                    !(type instanceof ReferenceType) || !(type.reflection instanceof DeclarationReflection)
                        ? undefined
                        : { path: type.reflection.url! },
                )
                .filter((child) => !!child),
        })) as HierarchyElement[];

    stack.forEach((element) => {
        element.parents = element.parents
            ?.map((parent) => stack.find(({ path }) => path === parent.path))
            .filter((parent) => !!parent);

        if (!element.parents?.length) delete element.parents;

        element.children = element.children
            ?.map((child) => stack.find(({ path }) => path === child.path))
            .filter((child) => !!child);

        if (!element.children?.length) delete element.children;
    });

    return stack;
}

function findBranches(branch: HierarchyElement, tree: HierarchyElement[] = [], depth: number = 0) {
    if (tree.includes(branch)) {
        branch.depth = Math.min(branch.depth!, depth);

        return tree;
    }

    tree.push(branch);

    branch.depth = depth;

    branch.parents?.forEach((parent) => findBranches(parent, tree, depth - 1));

    branch.children?.forEach((child) => findBranches(child, tree, depth + 1));

    return tree;
}

function sortBranches(tree: HierarchyElement[]) {
    tree = tree.slice();

    tree.sort((a, b) => b.text.localeCompare(a.text));

    tree.forEach((branch) => {
        branch.parents?.sort((a, b) => a.text.localeCompare(b.text));

        branch.children?.sort((a, b) => a.text.localeCompare(b.text));
    });

    const reverseTree: HierarchyElement[] = [];

    const visited: Set<HierarchyElement> = new Set();

    function visit(branch: HierarchyElement) {
        visited.add(branch);

        branch.children?.forEach((child) => !visited.has(child) && visit(child));

        reverseTree.push(branch);
    }

    tree.forEach((branch) => !visited.has(branch) && visit(branch));

    return reverseTree.reverse();
}

function growBranches(tree: HierarchyElement[]) {
    tree = tree.slice();

    const roots = tree.filter((branch) => !branch.parents?.length);

    const minDepth = Math.min(...roots.map((branch) => branch.depth!));

    roots.forEach((root) => {
        while (root.depth! > minDepth) {
            const newRoot = {
                text: "",
                children: [root],
                depth: root.depth! - 1,
            };

            root.parents = [newRoot];

            tree.splice(tree.indexOf(root), 0, newRoot);

            root = newRoot;
        }
    });

    return tree;
}

function pruneBranches(
    tree: HierarchyElement[],
    branches?: HierarchyElement[],
    seenBranches: Set<HierarchyElement> = new Set(),
) {
    if (!branches) branches = tree.filter((branch) => !branch.parents?.length).reverse();

    branches.forEach((branch) => {
        if (seenBranches.has(branch)) return;

        seenBranches.add(branch);

        branch.children = branch.children?.filter((child) => {
            if (!seenBranches.has(child)) return true;

            child.parents = child.parents?.filter((parent) => parent !== branch);

            return false;
        });

        if (!branch.children?.length) {
            delete branch.children;

            return;
        }

        pruneBranches(tree, branch.children, seenBranches);
    });

    return tree;
}

function hierarchyList(context: DefaultThemeRenderContext, branches: HierarchyElement[], isRoots: boolean = true) {
    return (
        <ul class={`tsd-hierarchy${!isRoots ? "" : " tsd-full-hierarchy"}`}>
            {branches.map((branch) => (
                <li class={branch.text ? "tsd-hierarchy-item" : "tsd-hierarchy-spacer"}>
                    {branch.text && (
                        <>
                            <a id={branch.text} class="tsd-anchor"></a>
                            <a href={branch.path}>
                                {context.icons[branch.kind!]()}
                                {branch.text}
                            </a>
                        </>
                    )}
                    {branch.children?.length ? hierarchyList(context, branch.children, false) : <></>}
                </li>
            ))}
        </ul>
    );
}
