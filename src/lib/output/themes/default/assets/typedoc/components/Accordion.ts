import { Component, IComponentOptions } from "../Component.js";
import { storage } from "../utils/storage.js";

const ACCORDION_INSTANCES = new Map<string, AccordionImpl>();

class AccordionImpl {
    open: boolean;
    accordions: HTMLDetailsElement[] = [];
    key: string;

    constructor(key: string, open: boolean) {
        this.key = key;
        this.open = open;
    }

    add(accordion: HTMLDetailsElement) {
        this.accordions.push(accordion);
        accordion.open = this.open;
        accordion.addEventListener("toggle", () => {
            this.toggle(accordion.open);
        });
    }

    toggle(open: boolean) {
        for (const acc of this.accordions) {
            acc.open = open;
        }
        storage.setItem(this.key, open.toString());
    }
}

/**
 * Handles accordion dropdown behavior.
 */
export class Accordion extends Component<HTMLDetailsElement> {
    constructor(options: IComponentOptions) {
        super(options);

        const summary = this.el.querySelector("summary")!;

        // Safari is broken and doesn't let you click on a link within
        // a <summary> tag, so we have to manually handle clicks there.
        const link = summary.querySelector("a");
        if (link) {
            link.addEventListener("click", () => {
                location.assign(link.href);
            });
        }

        const key = `tsd-accordion-${
            summary.dataset.key ??
            summary.textContent!.trim().replace(/\s+/g, "-").toLowerCase()
        }`;

        let inst: AccordionImpl;
        if (ACCORDION_INSTANCES.has(key)) {
            inst = ACCORDION_INSTANCES.get(key)!;
        } else {
            const stored = storage.getItem(key);
            const open = stored ? stored === "true" : this.el.open;
            inst = new AccordionImpl(key, open);
            ACCORDION_INSTANCES.set(key, inst);
        }

        inst.add(this.el);
    }
}
