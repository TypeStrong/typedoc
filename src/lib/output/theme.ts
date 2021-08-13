import type { Renderer } from "./renderer";
import type { ProjectReflection } from "../models/reflections/project";
import type { UrlMapping } from "./models/UrlMapping";
import type { NavigationItem } from "./models/NavigationItem";
import { RendererComponent } from "./components";
import { Component } from "../utils/component";
import type { PageEvent } from "./events";
import type { Reflection } from "../models";

/**
 * Base class of all themes.
 *
 * The theme class controls which files will be created through the {@link BaseTheme.getUrls}
 * function. It returns an array of {@link UrlMapping} instances defining the target files, models
 * and templates to use. Additionally themes can subscribe to the events emitted by
 * {@link Renderer} to control and manipulate the output process.
 */
@Component({ name: "theme", internal: true })
export abstract class Theme extends RendererComponent {
    /**
     * Create a new BaseTheme instance.
     *
     * @param renderer  The renderer this theme is attached to.
     */
    constructor(renderer: Renderer) {
        super(renderer);
    }

    /**
     * Map the models of the given project to the desired output files.
     * It is assumed that with the project structure:
     * ```text
     * A
     * |- B
     *    |- C
     * ```
     * If `B` has a UrlMapping, then `A` also has a UrlMapping, and `C` may or
     * may not have a UrlMapping. If `B` does not have a UrlMapping, then `A`
     * may or may not have a UrlMapping, but `C` must not have a UrlMapping.
     *
     * @param project The project whose urls should be generated.
     * @returns A list of {@link UrlMapping} instances defining which models
     * should be rendered to which files.
     */
    abstract getUrls(project: ProjectReflection): UrlMapping[];

    /**
     * Create a navigation structure for the given project.
     *
     * A navigation is a tree structure consisting of {@link NavigationItem} nodes. This
     * function should return the root node of the desired navigation tree.
     *
     * The {@link NavigationPlugin} will call this hook before a project will be rendered.
     * The plugin will update the state of the navigation tree and pass it to the
     * templates.
     *
     * @param project  The project whose navigation should be generated.
     * @returns        The root navigation item.
     */
    abstract getNavigation(project: ProjectReflection): NavigationItem;

    /**
     * Renders the provided page to a string, which will be written to disk by the {@link Renderer}
     */
    abstract render(page: PageEvent<Reflection>): string;
}
