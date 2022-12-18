import { Application } from "./Application";

export interface IComponentOptions {
    app: Application;
    el: HTMLElement;
}

/**
 * TypeDoc component class.
 */
export class Component {
    protected el: HTMLElement;
    protected app: Application;

    constructor(options: IComponentOptions) {
        this.el = options.el;
        this.app = options.app;
    }
}
