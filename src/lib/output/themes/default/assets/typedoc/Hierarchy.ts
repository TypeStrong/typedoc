import { decompressJson } from "./utils/decompress";

declare global {
    interface Window {
        // Base64 encoded data url, gzipped, JSON encoded JsonHierarchy
        hierarchyData?: string;
    }
}

interface JsonHierarchyElement {
    name: string;
    kind: number;
    url: string;
    children?: number[];
    uniqueNameParents?: number[];
    class: string;
}

interface JsonHierarchy {
    // ids of root instances
    roots: number[];
    reflections: Record<number, JsonHierarchyElement>;
}

let BASE_URL = document.documentElement.dataset.base!;
if (!BASE_URL.endsWith("/")) BASE_URL += "/";

export function initHierarchy() {
    if (document.querySelector(".tsd-full-hierarchy")) {
        initFullHierarchy();
    } else if (document.querySelector(".tsd-hierarchy")) {
        initPartialHierarchy();
    }
}

function initFullHierarchy() {
    document.addEventListener("click", (event) => {
        let target = event.target as HTMLElement;
        while (target.parentElement && target.parentElement.tagName != "LI") {
            target = target.parentElement;
        }

        if (target.dataset.dropdown) {
            target.dataset.dropdown = String(
                target.dataset.dropdown !== "true",
            );
        }
    });

    const hierarchyRefs = new Map<string, HTMLElement>();
    const duplicates = new Set<string>();

    for (const el of document.querySelectorAll<HTMLElement>(
        ".tsd-full-hierarchy [data-refl]",
    )) {
        const children = el.querySelector("ul");

        if (hierarchyRefs.has(el.dataset.refl!)) {
            duplicates.add(el.dataset.refl!);
        } else if (children) {
            hierarchyRefs.set(el.dataset.refl!, children);
        }
    }

    for (const dup of duplicates) {
        addExpandButton(dup);
    }

    function addExpandButton(reflId: string) {
        const expanded = hierarchyRefs
            .get(reflId)!
            .cloneNode(true) as HTMLElement;
        expanded.querySelectorAll("[id]").forEach((el) => {
            el.removeAttribute("id");
        });
        expanded
            .querySelectorAll<HTMLElement>("[data-dropdown]")
            .forEach((el) => {
                el.dataset.dropdown = "false";
            });

        for (const owner of document.querySelectorAll(
            `[data-refl="${reflId}"]`,
        )) {
            const icon = makeIcon();
            const ul = owner.querySelector("ul");
            owner.insertBefore(icon, ul);
            icon.dataset.dropdown = String(!!ul);

            if (!ul) {
                owner.appendChild(expanded.cloneNode(true));
            }
        }
    }
}

function initPartialHierarchy() {
    const script = document.getElementById("tsd-hierarchy-script");
    if (!script) return;

    script.addEventListener("load", buildHierarchyToggle);
    buildHierarchyToggle();
}

async function buildHierarchyToggle() {
    const container = document.querySelector<HTMLElement>(
        ".tsd-panel.tsd-hierarchy:has(h4 a)",
    );
    if (!container || !window.hierarchyData) return;

    const baseReflId = +container.dataset.refl!;
    const hierarchy: JsonHierarchy = await decompressJson(window.hierarchyData);

    const collapsedHierarchy = container.querySelector("ul")!;
    const expandedHierarchy = document.createElement("ul");
    expandedHierarchy.classList.add("tsd-hierarchy");
    buildExpandedHierarchy(expandedHierarchy, hierarchy, baseReflId);

    // No point in showing the expand button if it will be the same content.
    // It won't be the exact same innerHTML due to links being generated less
    // intelligently here than in the theme (though they still go to the same place)
    // but if there are the same number of elements in the hierarchy, there's
    // no point.
    if (
        collapsedHierarchy.querySelectorAll("li").length ==
        expandedHierarchy.querySelectorAll("li").length
    ) {
        return;
    }

    const expandCollapseButton = document.createElement("span");
    expandCollapseButton.classList.add("tsd-hierarchy-toggle");
    expandCollapseButton.textContent = window.translations.hierarchy_expand;
    container
        .querySelector("h4 a")
        ?.insertAdjacentElement("afterend", expandCollapseButton);
    expandCollapseButton.insertAdjacentText("beforebegin", ", ");
    expandCollapseButton.addEventListener("click", () => {
        if (
            expandCollapseButton.textContent ===
            window.translations.hierarchy_expand
        ) {
            collapsedHierarchy.insertAdjacentElement(
                "afterend",
                expandedHierarchy,
            );
            collapsedHierarchy.remove();
            expandCollapseButton.textContent =
                window.translations.hierarchy_collapse;
        } else {
            expandedHierarchy.insertAdjacentElement(
                "afterend",
                collapsedHierarchy,
            );
            expandedHierarchy.remove();
            expandCollapseButton.textContent =
                window.translations.hierarchy_expand;
        }
    });
}

function buildExpandedHierarchy(
    container: HTMLElement,
    hierarchy: JsonHierarchy,
    id: number,
) {
    // Figure out which roots contain the target ID
    const roots = hierarchy.roots.filter((root) =>
        rootContainsElement(hierarchy, root, id),
    );

    for (const root of roots) {
        container.appendChild(followHierarchy(hierarchy, root, id)!);
    }
}

function followHierarchy(
    hierarchy: JsonHierarchy,
    id: number,
    targetId: number,
    seen = new Set(),
): HTMLElement | undefined {
    if (seen.has(id)) return;
    seen.add(id);

    const item = hierarchy.reflections[id];
    const container = document.createElement("li");
    container.classList.add("tsd-hierarchy-item");

    if (id === targetId) {
        const text = container.appendChild(document.createElement("span"));
        text.textContent = item.name;
        text.classList.add("tsd-hierarchy-target");
    } else {
        for (const parent of item.uniqueNameParents || []) {
            const parentItem = hierarchy.reflections[parent];
            const link = container.appendChild(document.createElement("a"));
            link.textContent = parentItem.name;
            link.href = BASE_URL + parentItem.url;
            link.className = parentItem.class + " tsd-signature-type";
            container.append(document.createTextNode("."));
        }
        const link = container.appendChild(document.createElement("a"));
        link.textContent = hierarchy.reflections[id].name;
        link.href = BASE_URL + item.url;
        link.className = item.class + " tsd-signature-type";
    }

    if (item.children) {
        const ul = container.appendChild(document.createElement("ul"));
        ul.classList.add("tsd-hierarchy");
        for (const child of item.children) {
            const h = followHierarchy(hierarchy, child, targetId, seen);
            if (h) ul.appendChild(h);
        }
    }

    seen.delete(id);
    return container;
}

function rootContainsElement(
    hierarchy: JsonHierarchy,
    rootId: number,
    id: number,
) {
    if (rootId === id) {
        return true;
    }

    const seen = new Set<JsonHierarchyElement>();
    const queue = [hierarchy.reflections[rootId]];
    while (queue.length) {
        const item = queue.pop()!;
        if (seen.has(item)) continue;
        seen.add(item);

        for (const child of item.children || []) {
            if (child === id) {
                return true;
            }
            queue.push(hierarchy.reflections[child]);
        }
    }

    return false;
}

function makeIcon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.innerHTML = `<use href="#icon-chevronDown"></use>`;
    return svg;
}
