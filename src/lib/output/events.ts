import * as Path from "path";

import { Event } from "../utils/events";
import type { ProjectReflection } from "../models/reflections/project";
import type { RenderTemplate, UrlMapping } from "./models/UrlMapping";
import type { DeclarationReflection } from "../models";

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
 * An event emitted when markdown is being parsed. Allows other plugins to manipulate the result.
 *
 * @see {@link PARSE}
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

/**
 * An event emitted when the search index is being prepared.
 */
export class IndexEvent extends Event {
    /**
     * Triggered on the renderer when the search index is being prepared.
     * @event
     */
    static readonly PREPARE_INDEX = "prepareIndex";

    /**
     * May be filtered by plugins to reduce the results available.
     * Additional items *should not* be added to this array.
     *
     * If you remove an index from this array, you must also remove the
     * same index from {@link searchFields}. The {@link removeResult} helper
     * will do this for you.
     */
    searchResults: DeclarationReflection[];

    /**
     * Additional search fields to be used when creating the search index.
     * `name` and `comment` may be specified to overwrite TypeDoc's search fields.
     *
     * Do not use `id` as a custom search field.
     */
    searchFields: Record<string, string>[];

    /**
     * Weights for the fields defined in `searchFields`. The default will weight
     * `name` as 10x more important than comment content.
     *
     * If a field added to {@link searchFields} is not added to this object, it
     * will **not** be searchable.
     *
     * Do not replace this object, instead, set new properties on it for custom search
     * fields added by your plugin.
     */
    readonly searchFieldWeights: Record<string, number> = {
        name: 10,
        comment: 1,
    };

    /**
     * Remove a search result by index.
     */
    removeResult(index: number) {
        this.searchResults.splice(index, 1);
        this.searchFields.splice(index, 1);
    }

    constructor(name: string, searchResults: DeclarationReflection[]) {
        super(name);
        this.searchResults = searchResults;
        this.searchFields = Array.from(
            { length: this.searchResults.length },
            () => ({})
        );
    }
}
