export interface HierarchyElement {
    html: string;
    text: string;
    class: string;
    path?: string;
    kind?: number;
    parents?: HierarchyElement[];
    children?: HierarchyElement[];
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

    let baseUrl = container.dataset.base!;

    if (!baseUrl.endsWith("/")) baseUrl += "/";

    const targetPath = container.dataset.targetPath;

    const seeds = !targetPath
        ? hierarchy.slice()
        : hierarchy.filter((element) => {
              if (element.path === targetPath) {
                  element.class += " tsd-hierarchy-target";

                  element.parents?.forEach(
                      (parent) =>
                          (parent.class += " tsd-hierarchy-close-relative"),
                  );

                  element.children?.forEach(
                      (child) =>
                          (child.class += " tsd-hierarchy-close-relative"),
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

    const trees = getTrees(seeds, !targetPath);

    if (!trees.length) return;

    container
        .querySelectorAll("ul.tsd-full-hierarchy")
        ?.forEach((list) => list.remove());

    trees.forEach((tree) => {
        const list = buildList(
            tree.filter((branch) => !branch.parents?.length),
            baseUrl,
            !targetPath,
        )!;

        list.classList.add("tsd-full-hierarchy");

        container.append(list);
    });

    if (!targetPath && window.location.hash) {
        const anchor = document.getElementById(
            window.location.hash.substring(1),
        );

        if (anchor && container.contains(anchor))
            window.scrollTo(0, anchor.offsetTop);
    }
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
                parent.kind = element.kind;
                parent.children = [element];

                leaves.push(parent);

                return parent;
            })
            .filter((parent) => !!parent);

        element.children = element.children
            ?.map((child) => {
                if (child.path)
                    return hierarchy.find(({ path }) => path === child.path);

                child.class = "tsd-hierarchy-item";
                child.kind = element.kind;
                child.parents = [element];

                leaves.push(child);

                return child;
            })
            .filter((child) => !!child);
    });

    hierarchy.push(...leaves);

    hierarchy.forEach((element) => delete element.depth);

    return hierarchy;
}

function getTrees(seeds: HierarchyElement[], prune: boolean) {
    const stack = seeds.slice();

    const trees: HierarchyElement[][] = [];

    while (stack.length > 0) {
        const seed = stack.shift()!;

        let tree = findBranches(seed);

        tree.forEach((branch) => {
            const idx = stack.indexOf(branch);

            if (idx !== -1) stack.splice(idx, 1);
        });

        if (prune) {
            tree = pruneBranches(tree);

            if (tree.length <= 1) continue;
        }

        tree = sortBranches(tree);

        tree = growBranches(tree);

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

function pruneBranches(tree: HierarchyElement[]) {
    return tree.filter((branch) => {
        if (branch.path) return true;

        branch.parents?.forEach((parent) =>
            parent.children!.splice(parent.children!.indexOf(branch), 1),
        );

        branch.children?.forEach((child) =>
            child.parents!.splice(child.parents!.indexOf(branch), 1),
        );

        return false;
    });
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

function buildList(
    branches: HierarchyElement[],
    baseUrl: string,
    summary: boolean,
    reverse: boolean = true,
    renderedBranches: Set<HierarchyElement> = new Set(),
) {
    if (branches.every((branch) => renderedBranches.has(branch)))
        return undefined;

    const list = document.createElement("ul");
    list.classList.add("tsd-hierarchy");

    if (reverse) branches = branches.slice().reverse();

    branches.forEach((currentBranch) => {
        if (renderedBranches.has(currentBranch)) return;

        renderedBranches.add(currentBranch);

        const item = document.createElement("li");

        if (reverse) list.prepend(item);
        else list.append(item);

        item.className = currentBranch.class;

        if (currentBranch.text) {
            if (summary) {
                item.innerHTML += `<a id="${currentBranch.text}" class="tsd-anchor"></a>`;

                const anchor = document.createElement("a");
                anchor.href = baseUrl + currentBranch.path!;
                item.append(anchor);

                anchor.innerHTML += `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="tsd-kind-icon"><use href="#icon-${currentBranch.kind!}"></use></svg>`;
                anchor.innerHTML += `<span>${currentBranch.text}</span>`;
            } else if (item.classList.contains("tsd-hierarchy-target")) {
                item.innerHTML += `<span>${currentBranch.text}</span>`;
            } else {
                item.innerHTML += currentBranch.html;

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

        if (!currentBranch.children?.length) return;

        const childrenList = buildList(
            currentBranch.children,
            baseUrl,
            summary,
            false,
            renderedBranches,
        );

        if (childrenList) item.append(childrenList);
    });

    return list;
}
