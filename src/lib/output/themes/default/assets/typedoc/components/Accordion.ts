import {Component, IComponentOptions} from "../Component";

/**
 * Handles index dropdown behaviour.
 */
export class Accordion extends Component {

    /**
     * The heading for this accordion.
     */
    private heading: HTMLHeadingElement;

    /**
     * The body to display when the accordion is expanded.
     */
    private body: HTMLElement;

    constructor(options: IComponentOptions) {
        super(options);
        this.heading = this.el.getElementsByClassName("tsd-index-heading")[0];
        this.body = this.el.getElementsByClassName("tsd-index-list")[0];

        this.body.setAttribute("data-expanded-height", this.body.clientHeight);
        this.body.style.maxHeight = "0px";

        this.heading.addEventListener("click", () => this.toggleVisibility());
        this.heading.addEventListener("keypress", (e: KeyboardEvent) => this.handleKeyPress(e));
    }

    private toggleVisibility() {
        // Animation wizardry because CSS doesn't support transitioning to/from "height: auto"
        if (this.body.classList.contains("expanded")) {
            this.body.style.maxHeight = "0px";
        } else {
            this.body.style.maxHeight = this.body.getAttribute("data-expanded-height") + "px";
        }
        this.body.classList.toggle("expanded");
        this.heading.querySelector("svg").classList.toggle("chevron-expanded");
        this.heading.setAttribute(
            "aria-expanded",
            this.heading.ariaExpanded === "true" ? false : true
        );
        this.body.setAttribute(
            "aria-hidden",
            this.body.ariaHidden === "true" ? false : true
        );
    }

    private handleKeyPress(event: KeyboardEvent) {
        if (event.key === "Enter" || event.key === "Spacebar" || event.key === " ") {
            this.toggleVisibility();
        }
    }
}
