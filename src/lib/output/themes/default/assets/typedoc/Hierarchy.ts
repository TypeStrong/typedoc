export interface HierarchyElement {
    html: string;
    text: string;
    path?: string;
    parents?: HierarchyElement[];
    children?: HierarchyElement[];
    class: string;
    depth?: number;
}

declare global {
    interface Window {
        // Base64 encoded data url, gzipped, JSON encoded HierarchyElement[]
        hierarchyData?: string;
    }
}

export function initHierarchy() {
    const script = document.getElementById("tsd-hierarchy-script");
    if (!script) return;

    script.addEventListener("load", buildHierarchy);
    buildHierarchy();
}

async function buildHierarchy() {
    const container = document.getElementById("tsd-hierarchy-container");
    if (!container || !window.hierarchyData) return;

    const res = await fetch(window.hierarchyData);
    const data = await res.arrayBuffer();
    const json = new Blob([data])
        .stream()
        .pipeThrough(new DecompressionStream("gzip"));

    const hierarchy = loadJson(await new Response(json).json());
    let baseUrl = container.dataset.base;
    const targetPath = container.dataset.targetPath;

    if (!hierarchy.length || !baseUrl || !targetPath) return;

    if (!baseUrl.endsWith("/")) baseUrl += "/";

    const seeds = hierarchy.filter((element) => {
        if (element.path === targetPath) {
            element.class += " tsd-hierarchy-target";

            element.parents?.forEach(
                (parent) => (parent.class += " tsd-hierarchy-close-relative"),
            );

            element.children?.forEach(
                (child) => (child.class += " tsd-hierarchy-close-relative"),
            );

            return true;
        }

        if (
            !element.parents?.some(({ path }) => path === targetPath) &&
            !element.children?.some(({ path }) => path === targetPath)
        ) {
            element.class += " tsd-hierarchy-distant-relative";

            return false;
        }

        return false;
    });

    const trees = getTrees(seeds);

    if (!trees.length) return;

    container
        .querySelectorAll("ul.tsd-full-hierarchy")
        ?.forEach((list) => list.remove());

    trees.forEach((tree) => {
        const list = buildList(
            tree.filter((branch) => !branch.parents?.length),
            baseUrl,
        )!;

        list.classList.add("tsd-full-hierarchy");

        container.append(list);
    });
}

function loadJson(hierarchy: HierarchyElement[]) {
    const leaves: HierarchyElement[] = [];

    hierarchy.forEach((element) => {
        element.class = "tsd-hierarchy-item";

        element.parents = element.parents
            ?.map((parent) => {
                if (parent.path)
                    return hierarchy.find(({ path }) => path === parent.path);

                parent.class = "tsd-hierarchy-item";
                parent.children = [element];

                leaves.push(parent);

                return parent;
            })
            .filter((parent) => !!parent);

        if (!element.parents?.length) delete element.parents;

        element.children = element.children
            ?.map((child) => {
                if (child.path)
                    return hierarchy.find(({ path }) => path === child.path);

                child.class = "tsd-hierarchy-item";
                child.parents = [element];

                leaves.push(child);

                return child;
            })
            .filter((child) => !!child);

        if (!element.children?.length) delete element.children;
    });

    hierarchy.push(...leaves);

    hierarchy.forEach((element) => delete element.depth);

    return hierarchy;
}

function getTrees(seeds: HierarchyElement[]) {
    const stack = seeds.slice();

    const trees: HierarchyElement[][] = [];

    while (stack.length > 0) {
        const seed = stack.shift()!;

        let tree = findBranches(seed);

        tree.forEach((branch) => {
            const idx = stack.indexOf(branch);

            if (idx !== -1) stack.splice(idx, 1);
        });

        tree = sortBranches(tree);

        tree = growBranches(tree);

        tree = pruneBranches(tree);

        trees.push(tree);
    }

    return trees;
}

function findBranches(
    branch: HierarchyElement,
    tree: HierarchyElement[] = [],
    depth: number = 0,
) {
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

        branch.children?.forEach(
            (child) => !visited.has(child) && visit(child),
        );

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
                html: "",
                text: "",
                children: [root],
                class: "tsd-hierarchy-spacer",
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
    if (!branches)
        branches = tree.filter((branch) => !branch.parents?.length).reverse();

    branches.forEach((branch) => {
        if (seenBranches.has(branch)) return;

        seenBranches.add(branch);

        branch.children = branch.children?.filter((child) => {
            if (!seenBranches.has(child)) return true;

            child.parents = child.parents?.filter(
                (parent) => parent !== branch,
            );

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

function buildList(
    branches: HierarchyElement[],
    baseUrl: string,
    isRoots: boolean = true,
) {
    if (!branches.length) return undefined;

    const list = document.createElement("ul");
    list.classList.add("tsd-hierarchy");

    if (!isRoots) list.classList.add("tsd-full-hierarchy");

    branches.forEach((branch) => {
        const item = document.createElement("li");
        item.className = branch.class;
        list.append(item);

        if (branch.text) {
            if (item.classList.contains("tsd-hierarchy-target")) {
                item.innerHTML += `<span>${branch.text}</span>`;
            } else {
                item.innerHTML += branch.html;

                const anchors = item.querySelectorAll("a");

                anchors.forEach((anchor) => {
                    const href = anchor.getAttribute("href");

                    if (
                        typeof href !== "string" ||
                        /^[a-zA-Z]+:\/\//.test(href)
                    )
                        return;

                    anchor.setAttribute("href", baseUrl + href);
                });
            }
        }

        if (!branch.children?.length) return;

        const childrenList = buildList(branch.children, baseUrl, false);

        if (childrenList) item.append(childrenList);
    });

    return list;
}
