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
     * The chevron icon next to this accordion's heading.
     */
    private icon: SVGElement;

    /**
     * The key by which to store this accordion's state in localStorage.
     */
    private readonly key: string;

    /**
     * The ongoing animation, if there is one.
     */
    private animation?: Animation;

    /**
     * The accordion's height when collapsed.
     */
    private collapsedHeight!: string;

    /**
     * The accordion's height when expanded.
     */
    private expandedHeight!: string;

    constructor(options: IComponentOptions) {
        super(options);

        this.calculateHeights();
        this.heading = this.el.querySelector(".tsd-accordion-summary")!;
        this.icon = this.heading.querySelector("svg")!;
        this.key = `tsd-accordion-${this.heading
            .textContent!.replace(/\s+/g, "-")
            .toLowerCase()}`;

        if (this.useLocalStorage) {
            this.setLocalStorage(this.fromLocalStorage(), true);
        }
        this.heading.addEventListener("click", (e: MouseEvent) =>
            this.toggleVisibility(e)
        );
        this.icon.style.transform = this.getIconRotation();
    }

    /**
     * The transform that should be applied to the chevron based on the accordion's state.
     */
    private getIconRotation(open = this.el.open) {
        return `rotate(${open ? 0 : -90}deg)`;
    }

    /**
     * Calculates the accordion's expanded and collapsed heights.
     *
     * @returns The accordion's expanded and collapsed heights.
     */
    private calculateHeights() {
        const isOpen = this.el.open;
        this.el.style.marginLeft = "-9999px";
        this.el.open = true;
        this.expandedHeight = this.el.offsetHeight + "px";
        this.el.open = false;
        this.collapsedHeight = this.el.offsetHeight + "px";
        this.el.open = isOpen;
        this.el.style.height = isOpen
            ? this.expandedHeight
            : this.collapsedHeight;
        this.el.style.marginLeft = "";
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
     * Expand the accordion.
     */
    private expand(animate = true) {
        this.el.open = true;
        this.animate(this.collapsedHeight, this.expandedHeight, {
            opening: true,
            duration: animate ? 300 : 0,
        });
    }

    /**
     * Collapse the accordion.
     */
    private collapse(animate = true) {
        this.animate(this.expandedHeight, this.collapsedHeight, {
            opening: false,
            duration: animate ? 300 : 0,
        });
    }

    /**
     * Animate the accordion between open/close state.
     *
     * @param startHeight  Height to begin at.
     * @param endHeight    Height to end at.
     * @param isOpening    Whether the accordion is opening or closing.
     * @param duration     The duration of the animation.
     */
    private animate(
        startHeight: string,
        endHeight: string,
        { opening, duration = 300 }: { opening: boolean; duration?: number }
    ) {
        if (this.animation) return;
        const animationOptions = { duration, easing: "ease" };
        this.animation = this.el.animate(
            {
                height: [startHeight, endHeight],
            },
            animationOptions
        );
        this.icon
            .animate(
                {
                    transform: [
                        this.icon.style.transform,
                        this.getIconRotation(opening),
                    ],
                },
                animationOptions
            )
            .addEventListener("finish", () => {
                this.icon.style.transform = this.getIconRotation(opening);
            });

        this.animation.addEventListener("finish", () =>
            this.animationEnd(opening)
        );
    }

    /**
     * Reset values upon animation end.
     *
     * @param isOpen  Whether the accordion is now open.
     */
    private animationEnd(isOpen: boolean) {
        this.el.open = isOpen;
        this.animation = undefined;
        this.el.style.height = "auto";
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
        this.handleValueChange(force);
    }

    /**
     * Synchronize DOM based on stored value.
     *
     * @param force  Whether to force an animation.
     */
    private handleValueChange(force: boolean = false): void {
        if (this.fromLocalStorage() === this.el.open && !force) return;
        this.fromLocalStorage() ? this.expand(false) : this.collapse(false);
    }
}
