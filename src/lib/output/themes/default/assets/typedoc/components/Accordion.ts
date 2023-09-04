import { Component, IComponentOptions } from "../Component";
import { storage } from "../utils/storage";

/**
 * Handles accordion dropdown behavior.
 */
export class Accordion extends Component {
    override el!: HTMLDetailsElement;

    /**
     * The heading container for this accordion.
     */
    private summary: HTMLElement;

    /**
     * The chevron icon next to this accordion's heading.
     */
    private icon: SVGElement;

    /**
     * The key by which to store this accordion's state in storage.
     */
    private readonly key: string;

    constructor(options: IComponentOptions) {
        super(options);

        this.summary = this.el.querySelector(".tsd-accordion-summary")!;
        this.icon = this.summary.querySelector("svg")!;
        this.key = `tsd-accordion-${
            this.summary.dataset.key ??
            this.summary.textContent!.trim().replace(/\s+/g, "-").toLowerCase()
        }`;

        const stored = storage.getItem(this.key);
        this.el.open = stored ? stored === "true" : this.el.open;

        this.el.addEventListener("toggle", () => this.update());

        // Safari is broken and doesn't let you click on a link within
        // a <summary> tag, so we have to manually handle clicks there.
        const link = this.summary.querySelector("a");
        if (link) {
            link.addEventListener("click", () => {
                location.assign(link.href);
            });
        }

        this.update();
    }

    private update() {
        this.icon.style.transform = `rotate(${this.el.open ? 0 : -90}deg)`;
        storage.setItem(this.key, this.el.open.toString());
    }
}
