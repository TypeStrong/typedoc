import type { IComponentOptions } from "./Component";

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
    selector: string
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

    /**
     * Create a new Application instance.
     */
    constructor() {
        this.createComponents(document.body);
        this.ensureFocusedElementVisible();
        window.addEventListener("hashchange", () =>
            this.ensureFocusedElementVisible()
        );
    }

    /**
     * Create all components beneath the given element.
     */
    private createComponents(context: HTMLElement) {
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

        const reflAnchor = document.getElementById(location.hash.substring(1));
        if (!reflAnchor) return;

        let reflContainer = reflAnchor.parentElement!;
        while (reflContainer.tagName !== "SECTION") {
            reflContainer = reflContainer.parentElement!;
        }

        if (reflContainer.offsetParent == null) {
            this.alwaysVisibleMember = reflContainer;

            reflContainer.classList.add("always-visible");

            const warning = document.createElement("p");
            warning.classList.add("warning");
            warning.textContent =
                "This member is normally hidden due to your filter settings.";

            reflContainer.prepend(warning);
        }
    }
}
