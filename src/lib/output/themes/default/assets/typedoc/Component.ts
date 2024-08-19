import { Application } from "./Application.js";

export interface IComponentOptions {
    app: Application;
    el: HTMLElement;
}

/**
 * TypeDoc component class.
 */
export class Component<E extends HTMLElement = HTMLElement> {
    protected el: E;
    protected app: Application;

    constructor(options: IComponentOptions) {
        this.el = options.el as E;
        this.app = options.app;
    }
}
