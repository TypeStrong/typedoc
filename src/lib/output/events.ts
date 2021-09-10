import * as Path from "path";

import { Event } from "../utils/events";
import type { ProjectReflection } from "../models/reflections/project";
import type { RenderTemplate, UrlMapping } from "./models/UrlMapping";
import type { LegendItem } from "./plugins/LegendPlugin";

/**
 * An event emitted by the {@link Renderer} class at the very beginning and
 * ending of the entire rendering process.
 *
 * @see {@link Renderer.EVENT_BEGIN}
 * @see {@link Renderer.EVENT_END}
 */
export class RendererEvent extends Event {
    /**
     * The project the renderer is currently processing.
     */
    readonly project: ProjectReflection;

    /**
     * The path of the directory the documentation should be written to.
     */
    readonly outputDirectory: string;

    /**
     * A list of all pages that should be generated.
     *
     * This list can be altered during the {@link Renderer.EVENT_BEGIN} event.
     */
    urls?: UrlMapping[];

    /**
     * Triggered before the renderer starts rendering a project.
     * @event
     */
    static readonly BEGIN = "beginRender";

    /**
     * Triggered after the renderer has written all documents.
     * @event
     */
    static readonly END = "endRender";

    constructor(
        name: string,
        outputDirectory: string,
        project: ProjectReflection
    ) {
        super(name);
        this.outputDirectory = outputDirectory;
        this.project = project;
    }

    /**
     * Create an {@link PageEvent} event based on this event and the given url mapping.
     *
     * @internal
     * @param mapping  The mapping that defines the generated {@link PageEvent} state.
     * @returns A newly created {@link PageEvent} instance.
     */
    public createPageEvent<Model>(
        mapping: UrlMapping<Model>
    ): PageEvent<Model> {
        const event = new PageEvent<Model>(PageEvent.BEGIN);
        event.project = this.project;
        event.url = mapping.url;
        event.model = mapping.model;
        event.template = mapping.template;
        event.filename = Path.join(this.outputDirectory, mapping.url);
        return event;
    }
}

/**
 * An event emitted by the {@link Renderer} class before and after the
 * markup of a page is rendered.
 *
 * @see {@link Renderer.EVENT_BEGIN_PAGE}
 * @see {@link Renderer.EVENT_END_PAGE}
 */
export class PageEvent<Model = unknown> extends Event {
    /**
     * The project the renderer is currently processing.
     */
    project!: ProjectReflection;

    /**
     * The filename the page will be written to.
     */
    filename!: string;

    /**
     * The url this page will be located at.
     */
    url!: string;

    /**
     * The model that should be rendered on this page.
     */
    model!: Model;

    /**
     * The template that should be used to render this page.
     */
    template!: RenderTemplate<this>;

    /**
     * The legend items that are applicable for this page
     * @internal this is going away. The footer will do the logic itself.
     */
    legend?: LegendItem[][];

    /**
     * The final html content of this page.
     *
     * Should be rendered by layout templates and can be modified by plugins.
     */
    contents?: string;

    /**
     * Triggered before a document will be rendered.
     * @event
     */
    static readonly BEGIN = "beginPage";

    /**
     * Triggered after a document has been rendered, just before it is written to disc.
     * @event
     */
    static readonly END = "endPage";
}

/**
 * An event emitted by the {@link MarkedPlugin} on the {@link Renderer} after a chunk of
 * markdown has been processed. Allows other plugins to manipulate the result.
 *
 * @see {@link MarkedPlugin.EVENT_PARSE_MARKDOWN}
 */
export class MarkdownEvent extends Event {
    /**
     * The unparsed original text.
     */
    readonly originalText: string;

    /**
     * The parsed output.
     */
    parsedText: string;

    /**
     * Triggered on the renderer when this plugin parses a markdown string.
     * @event
     */
    static readonly PARSE = "parseMarkdown";

    constructor(name: string, originalText: string, parsedText: string) {
        super(name);
        this.originalText = originalText;
        this.parsedText = parsedText;
    }
}
