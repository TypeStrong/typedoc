import { Component, IComponentOptions } from "../Component";

/**
 * Handles accordion dropdown behaviour.
 */
export class Accordion extends Component {
    override el!: HTMLDetailsElement;

    /**
     * Whether localStorage is available for use.
     */
    private readonly useLocalStorage =
        typeof window.localStorage !== "undefined";

    /**
     * The heading for this accordion.
     */
    private heading: HTMLElement;

    /**
     * The key by which to store this accordion's state in localStorage.
     */
    private readonly key: string;

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
        this.heading = this.el.querySelectorAll<HTMLElement>(
            ".tsd-accordion-summary"
        )[0];
        this.body = this.el.querySelectorAll<HTMLElement>(
            ".tsd-accordion-details"
        )[0];
        this.key = `tsd-accordion-${this.heading.textContent
            .replace(/\s+/g, "-")
            .toLowerCase()}`;

        if (this.useLocalStorage) {
            this.setLocalStorage(this.fromLocalStorage(), true);
        }

        this.heading.addEventListener("click", (e: MouseEvent) =>
            this.toggleVisibility(e)
        );
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
            const fullHeight = `${
                this.heading.offsetHeight + this.body.offsetHeight
            }px`;
            this.animate(currentHeight, fullHeight, true);
        });
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
    private animate(
        startHeight: string,
        endHeight: string,
        isOpening: boolean
    ) {
        if (this.animation) this.animation.cancel();

        this.animation = this.el.animate(
            {
                height: [startHeight, endHeight],
            },
            { duration: 300, easing: "ease" }
        );

        this.animation.addEventListener("finish", () =>
            this.animationEnd(isOpening, endHeight)
        );
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
        this.el.style.height = height;
        this.el.style.overflow = "visible";

        this.setLocalStorage(isOpen);
    }

    /**
     * Retrieve value from localStorage.
     */
    private fromLocalStorage(): boolean {
        return this.useLocalStorage
            ? window.localStorage[this.key] === "true"
            : this.el.open;
    }

    /**
     * Persist accordion state to local storage.
     *
     * @param value  Value to set.
     * @param force  Whether to trigger value change even if the value is identical to the previous state.
     */
    private setLocalStorage(value: boolean, force: boolean = false): void {
        if (this.fromLocalStorage() === value && !force) return;
        if (this.useLocalStorage) {
            window.localStorage[this.key] = value ? "true" : "false";
        }
        this.el.open = value;
        this.handleValueChange();
    }

    /**
     * Synchronize DOM based on stored value.
     */
    private handleValueChange(): void {
        this.fromLocalStorage() ? this.expand() : this.collapse();
    }
}
