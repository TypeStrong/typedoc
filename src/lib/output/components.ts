import * as Path from "path";

import { Component, AbstractComponent } from "../utils/component";
import type {
    ProjectReflection,
    Reflection,
} from "../models/reflections/index";
import type { Renderer } from "./renderer";
import { RendererEvent, PageEvent } from "./events";
import { Option } from "../utils";

export { Component };

export abstract class RendererComponent extends AbstractComponent<
    Renderer,
    {}
> {}

/**
 * A plugin for the renderer that reads the current render context.
 */
export abstract class ContextAwareRendererComponent extends RendererComponent {
    /**
     * The project that is currently processed.
     */
    protected project?: ProjectReflection;

    /**
     * The reflection that is currently processed.
     */
    protected page?: PageEvent<Reflection>;

    /**
     * The url of the document that is being currently generated.
     * Set when a page begins rendering.
     *
     * Defaulted to '.' so that tests don't have to set up events.
     */
    private location = ".";

    /**
     * Regular expression to test if a string looks like an external url.
     */
    protected urlPrefix = /^(http|ftp)s?:\/\//;

    private get hostedBaseUrl() {
        const url = this.application.options.getValue("hostedBaseUrl");
        return !url || url.endsWith("/") ? url : url + "/";
    }

    @Option("useHostedBaseUrlForAbsoluteLinks")
    private accessor useHostedBaseUrlForAbsoluteLinks!: boolean;

    /**
     * Create a new ContextAwareRendererPlugin instance.
     *
     * @param renderer  The renderer this plugin should be attached to.
     */
    protected override initialize() {
        this.owner.on(RendererEvent.BEGIN, this.onBeginRenderer.bind(this));
        this.owner.on(PageEvent.BEGIN, this.onBeginPage.bind(this));
        this.owner.on(RendererEvent.END, () =>
            this.absoluteToRelativePathMap.clear(),
        );
    }

    private absoluteToRelativePathMap = new Map<string, string>();

    /**
     * Transform the given absolute path into a relative path.
     *
     * @param absolute  The absolute path to transform.
     * @returns A path relative to the document currently processed.
     */
    public getRelativeUrl(absolute: string): string {
        if (this.urlPrefix.test(absolute)) {
            return absolute;
        } else {
            const key = `${this.location}:${absolute}`;
            let path = this.absoluteToRelativePathMap.get(key);
            if (path) return path;

            if (this.useHostedBaseUrlForAbsoluteLinks) {
                path = new URL(absolute, this.hostedBaseUrl).toString();
            } else {
                path = Path.posix.relative(this.location, absolute) || ".";
            }

            this.absoluteToRelativePathMap.set(key, path);
            return path;
        }
    }

    /**
     * Triggered before the renderer starts rendering a project.
     *
     * @param event  An event object describing the current render operation.
     */
    protected onBeginRenderer(event: RendererEvent) {
        this.project = event.project;
    }

    /**
     * Triggered before a document will be rendered.
     *
     * @param page  An event object describing the current render operation.
     */
    protected onBeginPage(page: PageEvent<Reflection>) {
        this.location = Path.posix.dirname(page.url);
        this.page = page;
    }
}
