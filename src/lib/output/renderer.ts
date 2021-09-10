/**
 * Holds all logic used render and output the final documentation.
 *
 * The {@link Renderer} class is the central controller within this namespace. When invoked it creates
 * an instance of {@link Theme} which defines the layout of the documentation and fires a
 * series of {@link RendererEvent} events. Instances of {@link BasePlugin} can listen to these events and
 * alter the generated output.
 */
import type * as ts from "typescript";
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
 */
@Component({ name: "renderer", internal: true, childClass: RendererComponent })
export class Renderer extends ChildableComponent<
    Application,
    RendererComponent
> {
    private themes = new Map<string, new (renderer: Renderer) => Theme>([
        ["default", DefaultTheme],
    ]);

    private unknownSymbolResolvers = new Map<
        string,
        Array<(symbol: string) => string | undefined>
    >();

    /** @event */
    static readonly EVENT_BEGIN_PAGE = PageEvent.BEGIN;
    /** @event */
    static readonly EVENT_END_PAGE = PageEvent.END;
    /** @event */
    static readonly EVENT_BEGIN = RendererEvent.BEGIN;
    /** @event */
    static readonly EVENT_END = RendererEvent.END;

    /**
     * The theme that is used to render the documentation.
     */
    theme?: Theme;

    /** @internal */
    @BindOption("theme")
    themeName!: string;

    /** @internal */
    @BindOption("cleanOutputDir")
    cleanOutputDir!: boolean;

    /** @internal */
    @BindOption("gaID")
    gaID!: string;

    /** @internal */
    @BindOption("gaSite")
    gaSite!: string;

    /** @internal */
    @BindOption("hideGenerator")
    hideGenerator!: boolean;

    /** @internal */
    @BindOption("lightHighlightTheme")
    lightTheme!: ShikiTheme;

    /** @internal */
    @BindOption("darkHighlightTheme")
    darkTheme!: ShikiTheme;

    /**
     * Define a new theme that can be used to render output.
     * This API will likely be changing in TypeDoc 0.23.
     * (sorry... changing as soon as it's introduced)
     * As it is, it provides reasonable flexibility, but doesn't give users a sufficiently
     * easy way to overwrite parts of a theme.
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
     * Adds a new resolver that the theme can used to try to figure out how to link to a symbol
     * declared by a third-party library which is not included in the documentation.
     * @param packageName the npm package name that this resolver can handle to limit which files it will be tried on.
     *   If the resolver will create links for Node builtin types, it should be set to `@types/node`.
     *   Links for builtin types live in the default lib files under `typescript`.
     * @param resolver a function that will be called to create links for a given symbol name in the registered path.
     *  If the provided name is not contained within the docs, should return `undefined`.
     * @since 0.22.0
     */
    addUnknownSymbolResolver(
        packageName: string,
        resolver: (name: string) => string | undefined
    ) {
        const existing = this.unknownSymbolResolvers.get(packageName);
        if (existing) {
            existing.push(resolver);
        } else {
            this.unknownSymbolResolvers.set(packageName, [resolver]);
        }
    }

    /**
     * Marked as internal for now. Using this requires the internal `getSymbol()` method on ReferenceType.
     * Someday that needs to be fixed so that this can be made public. ReferenceTypes really shouldn't store
     * symbols so that we don't need to keep the program around forever.
     * @internal
     */
    attemptExternalResolution(
        symbol: ts.Symbol | undefined
    ): string | undefined {
        const symbolPath = symbol?.declarations?.[0]
            ?.getSourceFile()
            .fileName.replace(/\\/g, "/");
        if (!symbolPath) {
            return;
        }
        let startIndex = symbolPath.indexOf("node_modules/");
        if (startIndex === -1) {
            return;
        }
        startIndex += "node_modules/".length;
        let stopIndex = symbolPath.indexOf("/", startIndex);
        // Scoped package, e.g. `@types/node`
        if (symbolPath[startIndex] === "@") {
            stopIndex = symbolPath.indexOf("/", stopIndex + 1);
        }

        const packageName = symbolPath.substring(startIndex, stopIndex);
        const resolvers = this.unknownSymbolResolvers.get(packageName);

        for (const resolver of resolvers || []) {
            const resolved = resolver(symbol!.name);
            if (resolved) return resolved;
        }
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
        await loadHighlighter(this.lightTheme, this.darkTheme);
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
        if (!output.isDefaultPrevented) {
            output.urls.forEach((mapping: UrlMapping) => {
                this.renderDocument(output.createPageEvent(mapping));
            });

            this.trigger(RendererEvent.END, output);
        }

        this.theme = void 0;
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
