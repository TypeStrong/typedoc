/**
 * Holds all logic used render and output the final documentation.
 *
 * The {@link Renderer} class is the central controller within this namespace. When invoked it creates
 * an instance of {@link BaseTheme} which defines the layout of the documentation and fires a
 * series of {@link RendererEvent} events. Instances of {@link BasePlugin} can listen to these events and
 * alter the generated output.
 */

import * as Path from "path";
import * as fs from "fs";

import { Application } from "../application";
import { Theme } from "./theme";
import { RendererEvent, PageEvent } from "./events";
import { ProjectReflection } from "../models/reflections/project";
import { UrlMapping } from "./models/UrlMapping";
import { remove, writeFileSync } from "../utils/fs";
import { DefaultTheme } from "./themes/default/DefaultTheme";
import { RendererComponent } from "./components";
import { Component, ChildableComponent } from "../utils/component";
import { BindOption } from "../utils";
import { loadHighlighter } from "../utils/highlighter";
import { Theme as ShikiTheme } from "shiki";

/**
 * The renderer processes a {@link ProjectReflection} using a {@link BaseTheme} instance and writes
 * the emitted html documents to a output directory. You can specify which theme should be used
 * using the ```--theme <name>``` command line argument.
 *
 * Subclasses of {@link BasePlugin} that have registered themselves in the [[Renderer.PLUGIN_CLASSES]]
 * will be automatically initialized. Most of the core functionality is provided as separate plugins.
 *
 * {@link Renderer} is a subclass of {@link EventDispatcher} and triggers a series of events while
 * a project is being processed. You can listen to these events to control the flow or manipulate
 * the output.
 *
 *  * [[Renderer.EVENT_BEGIN]]<br>
 *    Triggered before the renderer starts rendering a project. The listener receives
 *    an instance of {@link RendererEvent}. By calling [[RendererEvent.preventDefault]] the entire
 *    render process can be canceled.
 *
 *    * [[Renderer.EVENT_BEGIN_PAGE]]<br>
 *      Triggered before a document will be rendered. The listener receives an instance of
 *      {@link PageEvent}. By calling [[PageEvent.preventDefault]] the generation of the
 *      document can be canceled.
 *
 *    * [[Renderer.EVENT_END_PAGE]]<br>
 *      Triggered after a document has been rendered, just before it is written to disc. The
 *      listener receives an instance of {@link PageEvent}. When calling
 *      [[PageEvent.preventDefault]] the the document will not be saved to disc.
 *
 *  * [[Renderer.EVENT_END]]<br>
 *    Triggered after the renderer has written all documents. The listener receives
 *    an instance of {@link RendererEvent}.
 */
@Component({ name: "renderer", internal: true, childClass: RendererComponent })
export class Renderer extends ChildableComponent<
    Application,
    RendererComponent
> {
    /**
     * The theme that is used to render the documentation.
     */
    theme?: Theme;

    @BindOption("theme")
    themeName!: string;

    @BindOption("disableOutputCheck")
    disableOutputCheck!: boolean;

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
            console.log(error);
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
            const themeName = this.themeName;
            let path = Path.resolve(themeName);
            if (!fs.existsSync(path)) {
                path = Path.join(Renderer.getThemeDirectory(), themeName);
                if (!fs.existsSync(path)) {
                    this.application.logger.error(
                        `The theme ${themeName} could not be found.`
                    );
                    return false;
                }
            }

            const filename = Path.join(path, "theme.js");
            if (!fs.existsSync(filename)) {
                this.theme = this.addComponent(
                    "theme",
                    new DefaultTheme(this, path)
                );
            } else {
                try {
                    /* eslint-disable */
                    const themeClass =
                        typeof require(filename) === "function"
                            ? require(filename)
                            : require(filename).default;
                    /* eslint-enable */

                    this.theme = this.addComponent(
                        "theme",
                        new themeClass(this, path)
                    );
                } catch (err) {
                    throw new Error(
                        `Exception while loading "${filename}". You must export a \`new Theme(renderer, basePath)\` compatible class.\n` +
                            err
                    );
                }
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
        if (fs.existsSync(directory)) {
            if (!fs.statSync(directory).isDirectory()) {
                this.application.logger.error(
                    `The output target "${directory}" exists but it is not a directory.`
                );
                return false;
            }

            if (this.disableOutputCheck) {
                return true;
            }

            if (fs.readdirSync(directory).length === 0) {
                return true;
            }

            // Theme must be set as this is only called after the theme is created.
            if (!this.theme!.isOutputDirectory(directory)) {
                this.application.logger.error(
                    `The output directory "${directory}" exists but does not seem to be a documentation generated by TypeDoc.\n` +
                        "Make sure this is the right target directory, delete the folder and rerun TypeDoc."
                );
                return false;
            }

            try {
                await remove(directory);
            } catch (error) {
                this.application.logger.warn(
                    "Could not empty the output directory."
                );
            }
        }

        if (!fs.existsSync(directory)) {
            try {
                fs.mkdirSync(directory, { recursive: true });
            } catch (error) {
                this.application.logger.error(
                    `Could not create output directory ${directory}`
                );
                return false;
            }
        }

        return true;
    }

    // This exists so that the resources can get the directory
    // without importing this file. Normally, I'd just directly
    // get the path, but typedoc-plugin-markdown overrides the
    // static version, and I don't need to break that yet...
    getDefaultTheme() {
        return Renderer.getDefaultTheme();
    }

    /**
     * Return the path containing the themes shipped with TypeDoc.
     *
     * @returns The path to the theme directory.
     */
    static getThemeDirectory(): string {
        return resolve(__dirname, "./themes/bin");
    }

    /**
     * Return the path to the default theme.
     *
     * @returns The path to the default theme.
     */
    static getDefaultTheme(): string {
        return Path.join(Renderer.getThemeDirectory(), "default");
    }
}

import "./plugins";
import { resolve } from "path";
import { Reflection } from "../models";
