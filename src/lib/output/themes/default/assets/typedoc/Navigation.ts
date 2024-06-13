export interface NavigationElement {
    text: string;
    path?: string;
    kind?: number;
    class?: string;
    children?: NavigationElement[];
}

let BASE_URL: string;

declare global {
    interface Window {
        // Base64 encoded data url, gzipped, JSON encoded NavigationElement[]
        navigationData?: string;
    }
}

export function initNav() {
    const script = document.getElementById("tsd-nav-script");
    if (!script) return;

    script.addEventListener("load", buildNav);
    buildNav();
}

async function buildNav() {
    const container = document.getElementById("tsd-nav-container");
    if (!container || !window.navigationData) return;

    const res = await fetch(window.navigationData);
    const data = await res.arrayBuffer();
    const json = new Blob([data])
        .stream()
        .pipeThrough(new DecompressionStream("gzip"));
    const nav: NavigationElement[] = await new Response(json).json();

    BASE_URL = container.dataset.base!;
    if (!BASE_URL.endsWith("/")) BASE_URL += "/";
    container.innerHTML = "";
    for (const el of nav) {
        buildNavElement(el, container, []);
    }

    window.app.createComponents(container);
    window.app.showPage();
    window.app.ensureActivePageVisible();
}

function buildNavElement(
    el: NavigationElement,
    parent: HTMLElement,
    path: string[],
) {
    const li = parent.appendChild(document.createElement("li"));

    if (el.children) {
        const fullPath = [...path, el.text];
        const details = li.appendChild(document.createElement("details"));
        details.className = el.class
            ? `${el.class} tsd-accordion`
            : "tsd-accordion";

        const summary = details.appendChild(document.createElement("summary"));
        summary.className = "tsd-accordion-summary";
        summary.dataset.key = fullPath.join("$");
        // Would be nice to not hardcode this here, if someone overwrites the chevronDown icon with an <img>
        // then this won't work... going to wait to worry about that until it actually breaks some custom theme.
        // Also very annoying that we can't encode the svg in the cache, since that gets duplicated here...
        // If that breaks someone, we probably have to get the svg element from the cached div (and include them..)
        // and clone that into place...
        summary.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><use href="#icon-chevronDown"></use></svg>`;
        addNavText(el, summary);

        const data = details.appendChild(document.createElement("div"));
        data.className = "tsd-accordion-details";
        const ul = data.appendChild(document.createElement("ul"));
        ul.className = "tsd-nested-navigation";

        for (const child of el.children) {
            buildNavElement(child, ul, fullPath);
        }
    } else {
        addNavText(el, li, el.class);
    }
}

function addNavText(
    el: NavigationElement,
    parent: HTMLElement,
    classes?: string | 0,
) {
    if (el.path) {
        const a = parent.appendChild(document.createElement("a"));
        a.href = BASE_URL + el.path; // relativity!
        if (classes) {
            a.className = classes;
        }
        if (location.pathname === a.pathname) {
            a.classList.add("current");
        }
        if (el.kind) {
            a.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="tsd-kind-icon"><use href="#icon-${el.kind}"></use></svg>`;
        }
        a.appendChild(document.createElement("span")).textContent = el.text;
    } else {
        parent.appendChild(document.createElement("span")).textContent =
            el.text;
    }
}
