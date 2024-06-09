import type { JSX } from "../../utils";
import type { PageEvent } from "../events";

export class UrlMapping<Model = any> {
    url: string;

    model: Model;

    template: RenderTemplate<PageEvent<Model>>;

    constructor(
        url: string,
        model: Model,
        template: RenderTemplate<PageEvent<Model>>,
    ) {
        this.url = url;
        this.model = model;
        this.template = template;
    }
}

/**
 * @param data the reflection to render
 * @returns either a string to be written to the file, or an element to be serialized and then written.
 */
export type RenderTemplate<T> = (data: T) => JSX.Element | string;
