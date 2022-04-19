import { Theme } from "../../theme";
import type { Renderer } from "../../renderer";
import {
    Reflection,
    ReflectionKind,
    ProjectReflection,
    ContainerReflection,
    DeclarationReflection,
    SignatureReflection,
} from "../../../models";
import { RenderTemplate, UrlMapping } from "../../models/UrlMapping";
import { PageEvent, RendererEvent } from "../../events";
import type { MarkedPlugin } from "../../plugins";
import { DefaultThemeRenderContext } from "./DefaultThemeRenderContext";
import { JSX } from "../../../utils";

/**
 * Defines a mapping of a {@link Models.Kind} to a template file.
 *
 * Used by {@link DefaultTheme} to map reflections to output files.
 */
interface TemplateMapping {
    /**
     * {@link DeclarationReflection.kind} this rule applies to.
     */
    kind: ReflectionKind[];

    /**
     * The name of the directory the output files should be written to.
     */
    directory: string;

    /**
     * The name of the template that should be used to render the reflection.
     */
    template: RenderTemplate<PageEvent<any>>;
}

/**
 * Default theme implementation of TypeDoc. If a theme does not provide a custom
 * {@link Theme} implementation, this theme class will be used.
 */
export class DefaultTheme extends Theme {
    /** @internal */
    markedPlugin: MarkedPlugin;
    private _renderContext?: DefaultThemeRenderContext;
    getRenderContext(_pageEvent: PageEvent<any>) {
        if (!this._renderContext) {
            this._renderContext = new DefaultThemeRenderContext(this, this.application.options);
        }
        return this._renderContext;
    }

    reflectionTemplate = (pageEvent: PageEvent<ContainerReflection>) => {
        return this.getRenderContext(pageEvent).reflectionTemplate(pageEvent);
    };
    indexTemplate = (pageEvent: PageEvent<ProjectReflection>) => {
        return this.getRenderContext(pageEvent).indexTemplate(pageEvent);
    };
    defaultLayoutTemplate = (pageEvent: PageEvent<Reflection>) => {
        return this.getRenderContext(pageEvent).defaultLayout(pageEvent);
    };

    /**
     * Mappings of reflections kinds to templates used by this theme.
     */
    private mappings: TemplateMapping[] = [
        {
            kind: [ReflectionKind.Class],
            directory: "classes",
            template: this.reflectionTemplate,
        },
        {
            kind: [ReflectionKind.Interface],
            directory: "interfaces",
            template: this.reflectionTemplate,
        },
        {
            kind: [ReflectionKind.Enum],
            directory: "enums",
            template: this.reflectionTemplate,
        },
        {
            kind: [ReflectionKind.Namespace, ReflectionKind.Module],
            directory: "modules",
            template: this.reflectionTemplate,
        },
        {
            kind: [ReflectionKind.TypeAlias],
            directory: "types",
            template: this.reflectionTemplate,
        },
        {
            kind: [ReflectionKind.Function],
            directory: "functions",
            template: this.reflectionTemplate,
        },
        {
            kind: [ReflectionKind.Variable],
            directory: "variables",
            template: this.reflectionTemplate,
        },
    ];

    static URL_PREFIX = /^(http|ftp)s?:\/\//;

    /**
     * Create a new DefaultTheme instance.
     *
     * @param renderer  The renderer this theme is attached to.
     * @param basePath  The base path of this theme.
     */
    constructor(renderer: Renderer) {
        super(renderer);
        this.markedPlugin = renderer.getComponent("marked") as MarkedPlugin;
        this.listenTo(renderer, RendererEvent.BEGIN, this.onRendererBegin, 1024);
    }

    /**
     * Map the models of the given project to the desired output files.
     *
     * @param project  The project whose urls should be generated.
     * @returns        A list of {@link UrlMapping} instances defining which models
     *                 should be rendered to which files.
     */
    getUrls(project: ProjectReflection): UrlMapping[] {
        const urls: UrlMapping[] = [];

        if (false == hasReadme(this.application.options.getValue("readme"))) {
            project.url = "index.html";
            urls.push(new UrlMapping<ContainerReflection>("index.html", project, this.reflectionTemplate));
        } else {
            project.url = "modules.html";
            urls.push(new UrlMapping<ContainerReflection>("modules.html", project, this.reflectionTemplate));
            urls.push(new UrlMapping("index.html", project, this.indexTemplate));
        }

        project.children?.forEach((child: Reflection) => {
            if (child instanceof DeclarationReflection) {
                this.buildUrls(child, urls);
            }
        });

        return urls;
    }

    /**
     * Triggered before the renderer starts rendering a project.
     *
     * @param event  An event object describing the current render operation.
     */
    private onRendererBegin(event: RendererEvent) {
        const filters = this.application.options.getValue("visibilityFilters") as Record<string, boolean>;
        for (const reflection of Object.values(event.project.reflections)) {
            if (reflection instanceof DeclarationReflection) {
                DefaultTheme.applyReflectionClasses(reflection, filters);
            }
        }
    }

    /**
     * Return a url for the given reflection.
     *
     * @param reflection  The reflection the url should be generated for.
     * @param relative    The parent reflection the url generation should stop on.
     * @param separator   The separator used to generate the url.
     * @returns           The generated url.
     */
    static getUrl(reflection: Reflection, relative?: Reflection, separator = "."): string {
        let url = reflection.getAlias();

        if (reflection.parent && reflection.parent !== relative && !(reflection.parent instanceof ProjectReflection)) {
            url = DefaultTheme.getUrl(reflection.parent, relative, separator) + separator + url;
        }

        return url;
    }

    /**
     * Return the template mapping for the given reflection.
     *
     * @param reflection  The reflection whose mapping should be resolved.
     * @returns           The found mapping or undefined if no mapping could be found.
     */
    private getMapping(reflection: DeclarationReflection): TemplateMapping | undefined {
        return this.mappings.find((mapping) => reflection.kindOf(mapping.kind));
    }

    /**
     * Build the url for the the given reflection and all of its children.
     *
     * @param reflection  The reflection the url should be created for.
     * @param urls        The array the url should be appended to.
     * @returns           The altered urls array.
     */
    buildUrls(reflection: DeclarationReflection, urls: UrlMapping[]): UrlMapping[] {
        const mapping = this.getMapping(reflection);
        if (mapping) {
            if (!reflection.url || !DefaultTheme.URL_PREFIX.test(reflection.url)) {
                const url = [mapping.directory, DefaultTheme.getUrl(reflection) + ".html"].join("/");
                urls.push(new UrlMapping(url, reflection, mapping.template));

                reflection.url = url;
                reflection.hasOwnDocument = true;
            }

            reflection.traverse((child) => {
                if (child instanceof DeclarationReflection) {
                    this.buildUrls(child, urls);
                } else {
                    DefaultTheme.applyAnchorUrl(child, reflection);
                }
                return true;
            });
        } else if (reflection.parent) {
            DefaultTheme.applyAnchorUrl(reflection, reflection.parent);
        }

        return urls;
    }

    render(page: PageEvent<Reflection>): string {
        const templateOutput = this.defaultLayoutTemplate(page);
        return "<!DOCTYPE html>" + JSX.renderElement(templateOutput);
    }

    /**
     * Generate an anchor url for the given reflection and all of its children.
     *
     * @param reflection  The reflection an anchor url should be created for.
     * @param container   The nearest reflection having an own document.
     */
    static applyAnchorUrl(reflection: Reflection, container: Reflection) {
        if (!(reflection instanceof DeclarationReflection) && !(reflection instanceof SignatureReflection)) {
            return;
        }

        if (!reflection.url || !DefaultTheme.URL_PREFIX.test(reflection.url)) {
            const anchor = DefaultTheme.getUrl(reflection, container, ".");

            reflection.url = container.url + "#" + anchor;
            reflection.anchor = anchor;
            reflection.hasOwnDocument = false;
        }

        reflection.traverse((child) => {
            DefaultTheme.applyAnchorUrl(child, container);
            return true;
        });
    }

    /**
     * Generate the css classes for the given reflection and apply them to the
     * {@link DeclarationReflection.cssClasses} property.
     *
     * @param reflection  The reflection whose cssClasses property should be generated.
     */
    static applyReflectionClasses(reflection: DeclarationReflection, filters: Record<string, boolean>) {
        const classes: string[] = [];

        classes.push(DefaultTheme.toStyleClass("tsd-kind-" + ReflectionKind[reflection.kind]));

        if (reflection.parent && reflection.parent instanceof DeclarationReflection) {
            classes.push(DefaultTheme.toStyleClass(`tsd-parent-kind-${ReflectionKind[reflection.parent.kind]}`));
        }

        // Filter classes should match up with the settings function in
        // partials/navigation.tsx.
        for (const key of Object.keys(filters)) {
            if (key === "inherited") {
                if (reflection.inheritedFrom) {
                    classes.push("tsd-is-inherited");
                }
            } else if (key === "protected") {
                if (reflection.flags.isProtected) {
                    classes.push("tsd-is-protected");
                }
            } else if (key === "external") {
                if (reflection.flags.isExternal) {
                    classes.push("tsd-is-external");
                }
            } else if (key.startsWith("@")) {
                if (reflection.comment?.hasModifier(key as `@${string}`)) {
                    classes.push(DefaultTheme.toStyleClass(`tsd-is-${key.substring(1)}`));
                }
            }
        }

        reflection.cssClasses = classes.join(" ");
    }

    /**
     * Transform a space separated string into a string suitable to be used as a
     * css class, e.g. "constructor method" > "constructor-method".
     */
    static toStyleClass(str: string) {
        return str.replace(/(\w)([A-Z])/g, (_m, m1, m2) => m1 + "-" + m2).toLowerCase();
    }
}

function hasReadme(readme: string) {
    return !readme.endsWith("none");
}
