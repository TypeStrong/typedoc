import * as Path from "path";

import type { ProjectReflection } from "../models/reflections/project";
import type { RenderTemplate, UrlMapping } from "./models/UrlMapping";
import type {
    DeclarationReflection,
    DocumentReflection,
    Reflection,
    ReflectionKind,
} from "../models";

/**
 * An event emitted by the {@link Renderer} class at the very beginning and
 * ending of the entire rendering process.
 *
 * @see {@link Renderer.EVENT_BEGIN}
 * @see {@link Renderer.EVENT_END}
 */
export class RendererEvent {
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
    urls?: UrlMapping<Reflection>[];

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

    constructor(outputDirectory: string, project: ProjectReflection) {
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
        mapping: UrlMapping<Model>,
    ): [RenderTemplate<PageEvent<Model>>, PageEvent<Model>] {
        const event = new PageEvent<Model>(PageEvent.BEGIN, mapping.model);
        event.project = this.project;
        event.url = mapping.url;
        event.filename = Path.join(this.outputDirectory, mapping.url);
        return [mapping.template, event];
    }
}

/**
 * An event emitted by the {@link Renderer} class before and after the
 * markup of a page is rendered.
 *
 * @see {@link Renderer.EVENT_BEGIN_PAGE}
 * @see {@link Renderer.EVENT_END_PAGE}
 */
export class PageEvent<out Model = unknown> extends Event {
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
    readonly model: Model;

    /**
     * The final html content of this page.
     *
     * Should be rendered by layout templates and can be modified by plugins.
     */
    contents?: string;

    /**
     * Links to content within this page that should be rendered in the page navigation.
     * This is built when rendering the document content.
     */
    pageHeadings: Array<{
        link: string;
        text: string;
        level?: number;
        kind?: ReflectionKind;
        classes?: string;
    }> = [];

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

    constructor(name: string, model: Model) {
        super(name);
        this.model = model;
    }
}

/**
 * An event emitted when markdown is being parsed. Allows other plugins to manipulate the result.
 *
 * @see {@link MarkdownEvent.PARSE}
 */
export class MarkdownEvent {
    /**
     * The unparsed original text.
     */
    readonly originalText: string;

    /**
     * The parsed output.
     */
    parsedText: string;

    /**
     * The page that this markdown is being parsed for.
     */
    readonly page: PageEvent;

    /**
     * Triggered on the renderer when this plugin parses a markdown string.
     * @event
     */
    static readonly PARSE = "parseMarkdown";

    constructor(page: PageEvent, originalText: string, parsedText: string) {
        this.page = page;
        this.originalText = originalText;
        this.parsedText = parsedText;
    }
}

/**
 * An event emitted when the search index is being prepared.
 */
export class IndexEvent {
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
    searchResults: Array<DeclarationReflection | DocumentReflection>;

    /**
     * Additional search fields to be used when creating the search index.
     * `name`, `comment` and `document` may be specified to overwrite TypeDoc's search fields.
     *
     * Do not use `id` as a custom search field.
     */
    searchFields: Record<string, string>[];

    /**
     * Weights for the fields defined in `searchFields`. The default will weight
     * `name` as 10x more important than comment and document content.
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
        document: 1,
    };

    /**
     * Remove a search result by index.
     */
    removeResult(index: number) {
        this.searchResults.splice(index, 1);
        this.searchFields.splice(index, 1);
    }

    constructor(
        searchResults: Array<DeclarationReflection | DocumentReflection>,
    ) {
        this.searchResults = searchResults;
        this.searchFields = Array.from(
            { length: this.searchResults.length },
            () => ({}),
        );
    }
}
