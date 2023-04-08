/**
 * Holds all logic used render and output the final documentation.
 *
 * The {@link Renderer} class is the central controller within this namespace. When invoked it creates
 * an instance of {@link Theme} which defines the layout of the documentation and fires a
 * series of {@link RendererEvent} events. Instances of {@link BasePlugin} can listen to these events and
 * alter the generated output.
 */
import * as fs from "fs";
import * as path from "path";

import type { Application } from "../application";
import type { Theme } from "./theme";
import { RendererEvent, PageEvent, IndexEvent } from "./events";
import type { ProjectReflection } from "../models/reflections/project";
import type { RenderTemplate, UrlMapping } from "./models/UrlMapping";
import { writeFileSync } from "../utils/fs";
import { DefaultTheme } from "./themes/default/DefaultTheme";
import { RendererComponent } from "./components";
import { Component, ChildableComponent } from "../utils/component";
import { BindOption, EventHooks } from "../utils";
import { loadHighlighter } from "../utils/highlighter";
import type { Theme as ShikiTheme } from "shiki";
import { Reflection } from "../models";
import type { JsxElement } from "../utils/jsx.elements";
import type { DefaultThemeRenderContext } from "./themes/default/DefaultThemeRenderContext";
import { clearSeenIconCache } from "./themes/default/partials/icon";
import { validateStateIsClean } from "./themes/default/partials/type";

/**
 * Describes the hooks available to inject output in the default theme.
 * If the available hooks don't let you put something where you'd like, please open an issue!
 */
export interface RendererHooks {
    /**
     * Applied immediately after the opening `<head>` tag.
     */
    "head.begin": [DefaultThemeRenderContext];

    /**
     * Applied immediately before the closing `</head>` tag.
     */
    "head.end": [DefaultThemeRenderContext];

    /**
     * Applied immediately after the opening `<body>` tag.
     */
    "body.begin": [DefaultThemeRenderContext];

    /**
     * Applied immediately before the closing `</body>` tag.
     */
    "body.end": [DefaultThemeRenderContext];

    /**
     * Applied immediately before the main template.
     */
    "content.begin": [DefaultThemeRenderContext];

    /**
     * Applied immediately after the main template.
     */
    "content.end": [DefaultThemeRenderContext];

    /**
     * Applied immediately before calling `context.sidebar`.
     */
    "sidebar.begin": [DefaultThemeRenderContext];

    /**
     * Applied immediately after calling `context.sidebar`.
     */
    "sidebar.end": [DefaultThemeRenderContext];

    /**
     * Applied immediately before calling `context.pageSidebar`.
     */
    "pageSidebar.begin": [DefaultThemeRenderContext];

    /**
     * Applied immediately after calling `context.pageSidebar`.
     */
    "pageSidebar.end": [DefaultThemeRenderContext];
}

/**
 * The renderer processes a {@link ProjectReflection} using a {@link Theme} instance and writes
 * the emitted html documents to a output directory. You can specify which theme should be used
 * using the `--theme <name>` command line argument.
 *
 * {@link Renderer} is a subclass of {@link EventDispatcher} and triggers a series of events while
 * a project is being processed. You can listen to these events to control the flow or manipulate
 * the output.
 *
 *  * {@link Renderer.EVENT_BEGIN}<br>
 *    Triggered before the renderer starts rendering a project. The listener receives
 *    an instance of {@link RendererEvent}. By calling {@link RendererEvent.preventDefault} the entire
 *    render process can be canceled.
 *
 *    * {@link Renderer.EVENT_BEGIN_PAGE}<br>
 *      Triggered before a document will be rendered. The listener receives an instance of
 *      {@link PageEvent}. By calling {@link PageEvent.preventDefault} the generation of the
 *      document can be canceled.
 *
 *    * {@link Renderer.EVENT_END_PAGE}<br>
 *      Triggered after a document has been rendered, just before it is written to disc. The
 *      listener receives an instance of {@link PageEvent}. When calling
 *      {@link PageEvent.preventDefault} the the document will not be saved to disc.
 *
 *  * {@link Renderer.EVENT_END}<br>
 *    Triggered after the renderer has written all documents. The listener receives
 *    an instance of {@link RendererEvent}.
 *
 * * {@link Renderer.EVENT_PREPARE_INDEX}<br>
 *    Triggered when the JavascriptIndexPlugin is preparing the search index. Listeners receive
 *    an instance of {@link IndexEvent}.
 */
@Component({ name: "renderer", internal: true, childClass: RendererComponent })
export class Renderer extends ChildableComponent<
    Application,
    RendererComponent
> {
    private themes = new Map<string, new (renderer: Renderer) => Theme>([
        ["default", DefaultTheme],
    ]);

    /** @event */
    static readonly EVENT_BEGIN_PAGE = PageEvent.BEGIN;
    /** @event */
    static readonly EVENT_END_PAGE = PageEvent.END;
    /** @event */
    static readonly EVENT_BEGIN = RendererEvent.BEGIN;
    /** @event */
    static readonly EVENT_END = RendererEvent.END;

    /** @event */
    static readonly EVENT_PREPARE_INDEX = IndexEvent.PREPARE_INDEX;

    /**
     * A list of async jobs which must be completed *before* rendering output.
     * They will be called after {@link RendererEvent.BEGIN} has fired, but before any files have been written.
     *
     * This may be used by plugins to register work that must be done to prepare output files. For example: asynchronously
     * transform markdown to HTML.
     *
     * Note: This array is cleared after calling the contained functions on each {@link Renderer.render} call.
     */
    preRenderAsyncJobs: Array<(output: RendererEvent) => Promise<void>> = [];

    /**
     * A list of async jobs which must be completed after rendering output files but before generation is considered successful.
     * These functions will be called after all documents have been written to the filesystem.
     *
     * This may be used by plugins to register work that must be done to finalize output files. For example: asynchronously
     * generating an image referenced in a render hook.
     *
     * Note: This array is cleared after calling the contained functions on each {@link Renderer.render} call.
     */
    postRenderAsyncJobs: Array<(output: RendererEvent) => Promise<void>> = [];

    /**
     * The theme that is used to render the documentation.
     */
    theme?: Theme;

    /**
     * Hooks which will be called when rendering pages.
     * Note:
     * - Hooks added during output will be discarded at the end of rendering.
     * - Hooks added during a page render will be discarded at the end of that page's render.
     *
     * See {@link RendererHooks} for a description of each available hook, and when it will be called.
     */
    hooks = new EventHooks<RendererHooks, JsxElement>();

    /** @internal */
    @BindOption("theme")
    themeName!: string;

    /** @internal */
    @BindOption("cleanOutputDir")
    cleanOutputDir!: boolean;

    /** @internal */
    @BindOption("cname")
    cname!: string;

    /** @internal */
    @BindOption("githubPages")
    githubPages!: boolean;

    /** @internal */
    @BindOption("cacheBust")
    cacheBust!: boolean;

    /** @internal */
    @BindOption("lightHighlightTheme")
    lightTheme!: ShikiTheme;

    /** @internal */
    @BindOption("darkHighlightTheme")
    darkTheme!: ShikiTheme;

    renderStartTime = -1;

    /**
     * Define a new theme that can be used to render output.
     * This API will likely be changing at some point, to allow more easily overriding parts of the theme without
     * requiring additional boilerplate.
     * @param name
     * @param theme
     */
    defineTheme(name: string, theme: new (renderer: Renderer) => Theme) {
        if (this.themes.has(name)) {
            throw new Error(`The theme "${name}" has already been defined.`);
        }
        this.themes.set(name, theme);
    }

    /**
     * Render the given project reflection to the specified output directory.
     *
     * @param project  The project that should be rendered.
     * @param outputDirectory  The path of the directory the documentation should be rendered to.
     */
    async render(
        project: ProjectReflection,
        outputDirectory: string
    ): Promise<void> {
        const momento = this.hooks.saveMomento();
        this.renderStartTime = Date.now();
        await loadHighlighter(this.lightTheme, this.darkTheme);
        this.application.logger.verbose(
            `Renderer: Loading highlighter took ${
                Date.now() - this.renderStartTime
            }ms`
        );
        if (
            !this.prepareTheme() ||
            !(await this.prepareOutputDirectory(outputDirectory))
        ) {
            return;
        }

        const output = new RendererEvent(
            RendererEvent.BEGIN,
            outputDirectory,
            project
        );
        output.urls = this.theme!.getUrls(project);

        this.trigger(output);

        await Promise.all(this.preRenderAsyncJobs.map((job) => job(output)));
        this.preRenderAsyncJobs = [];

        if (!output.isDefaultPrevented) {
            this.application.logger.verbose(
                `There are ${output.urls.length} pages to write.`
            );
            output.urls.forEach((mapping: UrlMapping) => {
                clearSeenIconCache();
                this.renderDocument(...output.createPageEvent(mapping));
                validateStateIsClean(mapping.url);
            });

            await Promise.all(
                this.postRenderAsyncJobs.map((job) => job(output))
            );
            this.postRenderAsyncJobs = [];

            this.trigger(RendererEvent.END, output);
        }

        this.theme = void 0;
        this.hooks.restoreMomento(momento);
    }

    /**
     * Render a single page.
     *
     * @param page An event describing the current page.
     * @return TRUE if the page has been saved to disc, otherwise FALSE.
     */
    private renderDocument(
        template: RenderTemplate<PageEvent<Reflection>>,
        page: PageEvent<Reflection>
    ) {
        const momento = this.hooks.saveMomento();
        this.trigger(PageEvent.BEGIN, page);
        if (page.isDefaultPrevented) {
            this.hooks.restoreMomento(momento);
            return false;
        }

        if (page.model instanceof Reflection) {
            page.contents = this.theme!.render(page, template);
        } else {
            throw new Error("Should be unreachable");
        }

        this.trigger(PageEvent.END, page);
        this.hooks.restoreMomento(momento);

        if (page.isDefaultPrevented) {
            return false;
        }

        try {
            writeFileSync(page.filename, page.contents);
        } catch (error) {
            this.application.logger.error(`Could not write ${page.filename}`);
        }
    }

    /**
     * Ensure that a theme has been setup.
     *
     * If a the user has set a theme we try to find and load it. If no theme has
     * been specified we load the default theme.
     *
     * @returns TRUE if a theme has been setup, otherwise FALSE.
     */
    private prepareTheme(): boolean {
        if (!this.theme) {
            const ctor = this.themes.get(this.themeName);
            if (!ctor) {
                this.application.logger.error(
                    `The theme '${
                        this.themeName
                    }' is not defined. The available themes are: ${[
                        ...this.themes.keys(),
                    ].join(", ")}`
                );
                return false;
            } else {
                this.theme = new ctor(this);
            }
        }

        return true;
    }

    /**
     * Prepare the output directory. If the directory does not exist, it will be
     * created. If the directory exists, it will be emptied.
     *
     * @param directory  The path to the directory that should be prepared.
     * @returns TRUE if the directory could be prepared, otherwise FALSE.
     */
    private async prepareOutputDirectory(directory: string): Promise<boolean> {
        if (this.cleanOutputDir) {
            try {
                await fs.promises.rm(directory, {
                    recursive: true,
                    force: true,
                });
            } catch (error) {
                this.application.logger.warn(
                    "Could not empty the output directory."
                );
                return false;
            }
        }

        try {
            fs.mkdirSync(directory, { recursive: true });
        } catch (error) {
            this.application.logger.error(
                `Could not create output directory ${directory}.`
            );
            return false;
        }

        if (this.githubPages) {
            try {
                const text =
                    "TypeDoc added this file to prevent GitHub Pages from " +
                    "using Jekyll. You can turn off this behavior by setting " +
                    "the `githubPages` option to false.";

                fs.writeFileSync(path.join(directory, ".nojekyll"), text);
            } catch (error) {
                this.application.logger.warn(
                    "Could not create .nojekyll file."
                );
                return false;
            }
        }

        if (this.cname) {
            fs.writeFileSync(path.join(directory, "CNAME"), this.cname);
        }

        return true;
    }
}

// HACK: THIS HAS TO STAY DOWN HERE
// if you try to move it up to the top of the file, then you'll run into stuff being used before it has been defined.
import "./plugins";
