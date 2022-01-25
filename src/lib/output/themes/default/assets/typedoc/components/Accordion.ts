import { Component, IComponentOptions } from "../Component";

/**
 * Handles accordion dropdown behaviour.
 */
export class Accordion extends Component {

    override el!: HTMLDetailsElement;
    /**
     * The heading for this accordion.
     */
    private heading: HTMLElement;

    /**
     * The body to display when the accordion is expanded.
     */
    private body: HTMLElement;

    /**
     * The ongoing animation, if there is one.
     */
    private animation?: Animation;

    constructor(options: IComponentOptions) {
        super(options);
        this.heading = this.el.querySelectorAll<HTMLElement>(".tsd-accordion-summary")[0];
        this.body = this.el.querySelectorAll<HTMLElement>(".tsd-accordion-details")[0];

        this.heading.addEventListener("click", (e: MouseEvent) => this.toggleVisibility(e));
    }

    /**
     * Triggered on accordion click.
     *
     * @param event  The emitted mouse event.
     */
    private toggleVisibility(event: MouseEvent) {
        event.preventDefault();
        this.el.style.overflow = "hidden";

        if (!this.el.open) {
            this.expand();
        } else this.collapse();
    }

    /**
     * Expand the accordion, calculating full height for a smooth animation.
     */
    private expand() {
        const currentHeight = `${this.el.offsetHeight}px`;
        this.el.style.height = currentHeight;
        this.el.open = true;
        window.requestAnimationFrame(() => {
            const fullHeight = `${this.heading.offsetHeight + this.body.offsetHeight}px`;
            console.log("heading", this.heading.offsetHeight, "body", this.body.offsetHeight)
            console.log(fullHeight);
            this.animate(currentHeight, fullHeight, true);
        })
    }

    /**
     * Collapse the accordion.
     */
    private collapse() {
        const currentHeight = `${this.el.offsetHeight}px`;
        const collapsedHeight = `${this.heading.offsetHeight}px`;
        this.animate(currentHeight, collapsedHeight, false);
    }

    /**
     * Animate the accordion between open/close state.
     *
     * @param startHeight  Height to begin at.
     * @param endHeight    Height to end at.
     * @param isOpening    Whether the accordion is opening or closing.
     */
    private animate(startHeight: string, endHeight: string, isOpening: boolean) {
        if (this.animation) this.animation.cancel();

        this.animation = this.el.animate({
            height: [startHeight, endHeight]
        }, { duration: 300, easing: "ease" });

        this.animation.addEventListener("finish", () => this.animationEnd(isOpening, endHeight));
    }

    /**
     * Reset values upon animation end.
     *
     * @param isOpen  Whether the accordion is now open.
     * @param height  The element's new height.
     */
    private animationEnd(isOpen: boolean, height: string) {
        this.el.open = isOpen;
        this.animation = undefined;
        console.log("el style", this.el.style.height);
        this.el.style.height = height;
        console.log(height);
        this.el.style.overflow = "visible";
    }
}
