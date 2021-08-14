/**
 * Holds all logic used render and output the final documentation.
 *
 * The {@link Renderer} class is the central controller within this namespace. When invoked it creates
 * an instance of {@link BaseTheme} which defines the layout of the documentation and fires a
 * series of {@link RendererEvent} events. Instances of {@link BasePlugin} can listen to these events and
 * alter the generated output.
 */

import * as fs from "fs";

import type { Application } from "../application";
import type { Theme } from "./theme";
import { RendererEvent, PageEvent } from "./events";
import type { ProjectReflection } from "../models/reflections/project";
import type { UrlMapping } from "./models/UrlMapping";
import { remove, writeFileSync } from "../utils/fs";
import { DefaultTheme } from "./themes/default/DefaultTheme";
import { RendererComponent } from "./components";
import { Component, ChildableComponent } from "../utils/component";
import { BindOption } from "../utils";
import { loadHighlighter } from "../utils/highlighter";
import type { Theme as ShikiTheme } from "shiki";
import { Reflection } from "../models";

/**
 * The renderer processes a {@link ProjectReflection} using a {@link BaseTheme} instance and writes
 * the emitted html documents to a output directory. You can specify which theme should be used
 * using the ```--theme <name>``` command line argument.
 *
 * Subclasses of {@link BasePlugin} that have registered themselves in the {@link Renderer.PLUGIN_CLASSES}
 * will be automatically initialized. Most of the core functionality is provided as separate plugins.
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
 */
@Component({ name: "renderer", internal: true, childClass: RendererComponent })
export class Renderer extends ChildableComponent<
    Application,
    RendererComponent
> {
    private themes = new Map<string, new (renderer: Renderer) => Theme>([
        ["default", DefaultTheme],
    ]);

    /**
     * The theme that is used to render the documentation.
     */
    theme?: Theme;

    @BindOption("theme")
    themeName!: string;

    @BindOption("cleanOutputDir")
    cleanOutputDir!: boolean;

    @BindOption("gaID")
    gaID!: string;

    @BindOption("gaSite")
    gaSite!: string;

    @BindOption("hideGenerator")
    hideGenerator!: boolean;

    @BindOption("toc")
    toc!: string[];

    @BindOption("highlightTheme")
    highlightTheme!: ShikiTheme;

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
        await loadHighlighter(this.highlightTheme);
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
        output.settings = this.application.options.getRawValues();
        output.urls = this.theme!.getUrls(project);

        this.trigger(output);
        if (!output.isDefaultPrevented) {
            output.urls.forEach((mapping: UrlMapping) => {
                this.renderDocument(output.createPageEvent(mapping));
            });

            this.trigger(RendererEvent.END, output);
        }
    }

    /**
     * Render a single page.
     *
     * @param page An event describing the current page.
     * @return TRUE if the page has been saved to disc, otherwise FALSE.
     */
    private renderDocument(page: PageEvent): boolean {
        this.trigger(PageEvent.BEGIN, page);
        if (page.isDefaultPrevented) {
            return false;
        }

        if (page.model instanceof Reflection) {
            page.contents = this.theme!.render(page as PageEvent<Reflection>);
        } else {
            throw new Error("Should be unreachable");
        }

        this.trigger(PageEvent.END, page);
        if (page.isDefaultPrevented) {
            return false;
        }

        try {
            writeFileSync(page.filename, page.contents);
        } catch (error) {
            this.application.logger.error(`Could not write ${page.filename}`);
            return false;
        }

        return true;
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
                    `The theme '${this.themeName}' is not defined`
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
                await remove(directory);
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
                `Could not create output directory ${directory}`
            );
            return false;
        }

        return true;
    }
}

// HACK: THIS HAS TO STAY DOWN HERE
// if you try to move it up to the top of the file, then you'll run into stuff being used before it has been defined.
import "./plugins";
