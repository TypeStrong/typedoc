import { ReactElement } from "react";

/**
 *
 */
export class UrlMapping<Model = any> {
    url: string;

    model: Model;

    template: RenderTemplate<Model>;

    constructor(url: string, model: any, template: RenderTemplate<Model>) {
        this.url = url;
        this.model = model;
        this.template = template;
    }
}

export type RenderTemplate<T> = (data: T) => ReactElement | string;
