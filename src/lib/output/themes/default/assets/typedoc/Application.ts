import type { IComponentOptions } from "./Component.js";
import { storage } from "./utils/storage.js";

declare global {
    interface Window {
        translations: {
            copy: string;
            copied: string;
            normally_hidden: string;
            hierarchy_expand: string;
            hierarchy_collapse: string;
            search_index_not_available: string;
            search_no_results_found_for_0: string;

            // Kind strings for icons
            folder: string;
            [k: `kind_${number}`]: string;
        };
        TypeDoc: {
            disableWritingLocalStorage: () => void;
            disableLocalStorage: () => void;
            enableLocalStorage: () => void;
        };
    }
}

window.TypeDoc ||= {
    disableWritingLocalStorage() {
        storage.disableWritingLocalStorage();
    },
    disableLocalStorage: () => {
        storage.disable();
    },
    enableLocalStorage: () => {
        storage.enable();
    },
};

// For debugging with a watch build
window.translations ||= {
    copy: "Copy",
    copied: "Copied!",
    normally_hidden: "This member is normally hidden due to your filter settings.",
    hierarchy_expand: "Expand",
    hierarchy_collapse: "Collapse",
    search_index_not_available: "The search index is not available",
    search_no_results_found_for_0: "No results found for {0}",

    folder: "Folder",
    kind_1: "Project",
    kind_2: "Module",
    kind_4: "Namespace",
    kind_8: "Enumeration",
    kind_16: "Enumeration Member",
    kind_32: "Variable",
    kind_64: "Function",
    kind_128: "Class",
    kind_256: "Interface",
    kind_512: "Constructor",
    kind_1024: "Property",
    kind_2048: "Method",
    kind_4096: "Call Signature",
    kind_8192: "Index Signature",
    kind_16384: "Constructor Signature",
    kind_32768: "Parameter",
    kind_65536: "Type Literal",
    kind_131072: "Type Parameter",
    kind_262144: "Accessor",
    kind_524288: "Get Signature",
    kind_1048576: "Set Signature",
    kind_2097152: "Type Alias",
    kind_4194304: "Reference",
    kind_8388608: "Document",
};

/**
 * Component definition.
 */
export interface IComponent {
    constructor: new (options: IComponentOptions) => unknown;
    selector: string;
}

/**
 * List of all known components.
 */
const components: IComponent[] = [];

/**
 * Register a new component.
 */
export function registerComponent(
    constructor: IComponent["constructor"],
    selector: string,
) {
    components.push({
        selector: selector,
        constructor: constructor,
    });
}

/**
 * TypeDoc application class.
 */
export class Application {
    alwaysVisibleMember: HTMLElement | null = null;
    constructor() {
        this.createComponents(document.body);
        this.ensureFocusedElementVisible();
        this.listenForCodeCopies();
        window.addEventListener("hashchange", () => this.ensureFocusedElementVisible());

        // We're on a *really* slow network connection and the inline JS
        // has already made the page display.
        if (!document.body.style.display) {
            this.ensureFocusedElementVisible();
            this.updateIndexVisibility();
            this.scrollToHash();
        }
    }

    /**
     * Create all components beneath the given element.
     */
    public createComponents(context: HTMLElement) {
        components.forEach((c) => {
            context.querySelectorAll<HTMLElement>(c.selector).forEach((el) => {
                if (!el.dataset["hasInstance"]) {
                    new c.constructor({ el, app: this });
                    el.dataset["hasInstance"] = String(true);
                }
            });
        });
    }

    public filterChanged() {
        this.ensureFocusedElementVisible();
    }

    public showPage() {
        if (!document.body.style.display) return;
        document.body.style.removeProperty("display");
        this.ensureFocusedElementVisible();
        this.updateIndexVisibility();
        this.scrollToHash();
    }

    public scrollToHash() {
        // Because we hid the entire page until the navigation loaded or we hit a timeout,
        // we have to manually resolve the url hash here.
        if (location.hash) {
            const reflAnchor = document.getElementById(
                location.hash.substring(1),
            );
            if (!reflAnchor) return;
            reflAnchor.scrollIntoView({ behavior: "instant", block: "start" });
        }
    }

    public ensureActivePageVisible() {
        const pageLink = document.querySelector(".tsd-navigation .current");
        let iter = pageLink?.parentElement;
        while (iter && !iter.classList.contains(".tsd-navigation")) {
            // Expand parent namespaces if collapsed, and this module
            if (iter instanceof HTMLDetailsElement) {
                iter.open = true;
            }
            iter = iter.parentElement;
        }

        if (pageLink && !checkVisible(pageLink)) {
            const top = pageLink.getBoundingClientRect().top -
                document.documentElement.clientHeight / 4;
            // If we are showing three columns, this will scroll the site menu down to
            // show the page we just loaded in the navigation.
            document.querySelector(".site-menu")!.scrollTop = top;
            // If we are showing two columns
            document.querySelector(".col-sidebar")!.scrollTop = top;
        }
    }

    public updateIndexVisibility() {
        const indexAccordion = document.querySelector<HTMLDetailsElement>(".tsd-index-content");
        const oldOpen = indexAccordion?.open;
        if (indexAccordion) {
            indexAccordion.open = true;
        }

        // Hide index headings where all index items are hidden.
        // offsetParent == null checks for display: none
        document
            .querySelectorAll<HTMLElement>(".tsd-index-section")
            .forEach((el) => {
                el.style.display = "block";
                const allChildrenHidden = Array.from(
                    el.querySelectorAll<HTMLElement>(".tsd-index-link"),
                ).every((child) => child.offsetParent == null);

                el.style.display = allChildrenHidden ? "none" : "block";
            });

        if (indexAccordion) {
            indexAccordion.open = oldOpen!;
        }
    }

    /**
     * Ensures that if a user was linked to a reflection which is hidden because of filter
     * settings, that reflection is still shown.
     */
    private ensureFocusedElementVisible() {
        if (this.alwaysVisibleMember) {
            this.alwaysVisibleMember.classList.remove("always-visible");
            this.alwaysVisibleMember.firstElementChild!.remove();
            this.alwaysVisibleMember = null;
        }

        if (!location.hash) return;

        const reflAnchor = document.getElementById(location.hash.substring(1));
        if (!reflAnchor) return;

        let reflContainer = reflAnchor.parentElement!;
        while (reflContainer && reflContainer.tagName !== "SECTION") {
            reflContainer = reflContainer.parentElement!;
        }

        if (!reflContainer) {
            // This is probably a link in the readme, doesn't have a containing section
            return;
        }

        // Ensure the group this reflection is contained within is visible.
        const wasHidden = reflContainer.offsetParent == null;
        let sectionContainer = reflContainer;
        while (sectionContainer !== document.body) {
            if (sectionContainer instanceof HTMLDetailsElement) {
                sectionContainer.open = true;
            }
            sectionContainer = sectionContainer.parentElement!;
        }

        if (reflContainer.offsetParent == null) {
            this.alwaysVisibleMember = reflContainer;

            reflContainer.classList.add("always-visible");

            const warning = document.createElement("p");
            warning.classList.add("warning");
            warning.textContent = window.translations.normally_hidden;

            reflContainer.prepend(warning);
        }

        if (wasHidden) {
            reflAnchor.scrollIntoView();
        }
    }

    private listenForCodeCopies() {
        document.querySelectorAll("pre > button").forEach((button) => {
            let timeout: ReturnType<typeof setTimeout>;
            button.addEventListener("click", () => {
                if (button.previousElementSibling instanceof HTMLElement) {
                    navigator.clipboard.writeText(
                        button.previousElementSibling.innerText.trim(),
                    );
                }
                button.textContent = window.translations.copied;
                button.classList.add("visible");
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    button.classList.remove("visible");
                    timeout = setTimeout(() => {
                        button.textContent = window.translations.copy;
                    }, 100);
                }, 1000);
            });
        });
    }
}

// https://stackoverflow.com/a/5354536/7186598
function checkVisible(elm: Element) {
    const rect = elm.getBoundingClientRect();
    const viewHeight = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight,
    );
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}
