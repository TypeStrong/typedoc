import { Theme } from "../../theme";
import type { Renderer } from "../../renderer";
import {
    ReflectionKind,
    ProjectReflection,
    type ContainerReflection,
    DeclarationReflection,
    type Reflection,
    SignatureReflection,
    ReflectionCategory,
    ReflectionGroup,
    TypeParameterReflection,
    type DocumentReflection,
} from "../../../models";
import { type RenderTemplate, UrlMapping } from "../../models/UrlMapping";
import type { PageEvent } from "../../events";
import type { MarkedPlugin } from "../../plugins";
import { DefaultThemeRenderContext } from "./DefaultThemeRenderContext";
import { JSX } from "../../../utils";
import { classNames, getDisplayName, getHierarchyRoots, toStyleClass } from "../lib";
import { icons } from "./partials/icon";

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

export interface NavigationElement {
    text: string;
    path?: string;
    kind?: ReflectionKind;
    class?: string;
    children?: NavigationElement[];
}

/**
 * Responsible for getting a unique anchor for elements within a page.
 */
export class Slugger {
    private seen = new Map<string, number>();

    private serialize(value: string) {
        // Extracted from marked@4.3.0
        return (
            value
                .toLowerCase()
                .trim()
                // remove html tags
                .replace(/<[!/a-z].*?>/gi, "")
                // remove unwanted chars
                .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, "")
                .replace(/\s/g, "-")
        );
    }

    slug(value: string) {
        const originalSlug = this.serialize(value);
        let slug = originalSlug;
        let count = 0;
        if (this.seen.has(slug)) {
            count = this.seen.get(originalSlug)!;
            do {
                count++;
                slug = `${originalSlug}-${count}`;
            } while (this.seen.has(slug));
        }
        this.seen.set(originalSlug, count);
        this.seen.set(slug, 0);
        return slug;
    }
}

/**
 * Default theme implementation of TypeDoc. If a theme does not provide a custom
 * {@link Theme} implementation, this theme class will be used.
 */
export class DefaultTheme extends Theme {
    /** @internal */
    markedPlugin: MarkedPlugin;

    /**
     * The icons which will actually be rendered. The source of truth lives on the theme, and
     * the {@link DefaultThemeRenderContext.icons} member will produce references to these.
     *
     * These icons will be written twice. Once to an `icons.svg` file in the assets directory
     * which will be referenced by icons on the context, and once to an `icons.js` file so that
     * references to the icons can be dynamically embedded within the page for use by the search
     * dropdown and when loading the page on `file://` urls.
     *
     * Custom themes may overwrite this entire object or individual properties on it to customize
     * the icons used within the page, however TypeDoc currently assumes that all icons are svg
     * elements, so custom themes must also use svg elements.
     */
    icons = { ...icons };

    getRenderContext(pageEvent: PageEvent<Reflection>) {
        return new DefaultThemeRenderContext(this, pageEvent, this.application.options);
    }

    documentTemplate = (pageEvent: PageEvent<DocumentReflection>) => {
        return this.getRenderContext(pageEvent).documentTemplate(pageEvent);
    };
    reflectionTemplate = (pageEvent: PageEvent<ContainerReflection>) => {
        return this.getRenderContext(pageEvent).reflectionTemplate(pageEvent);
    };
    indexTemplate = (pageEvent: PageEvent<ProjectReflection>) => {
        return this.getRenderContext(pageEvent).indexTemplate(pageEvent);
    };
    hierarchyTemplate = (pageEvent: PageEvent<ProjectReflection>) => {
        return this.getRenderContext(pageEvent).hierarchyTemplate(pageEvent);
    };
    defaultLayoutTemplate = (pageEvent: PageEvent<Reflection>, template: RenderTemplate<PageEvent<Reflection>>) => {
        return this.getRenderContext(pageEvent).defaultLayout(template, pageEvent);
    };

    getReflectionClasses(reflection: DeclarationReflection | DocumentReflection) {
        const filters = this.application.options.getValue("visibilityFilters") as Record<string, boolean>;
        return getReflectionClasses(reflection, filters);
    }

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
        {
            kind: [ReflectionKind.Document],
            directory: "documents",
            template: this.documentTemplate,
        },
    ];

    static URL_PREFIX = /^(http|ftp)s?:\/\//;

    /**
     * Create a new DefaultTheme instance.
     *
     * @param renderer  The renderer this theme is attached to.
     */
    constructor(renderer: Renderer) {
        super(renderer);
        this.markedPlugin = renderer.getComponent("marked") as MarkedPlugin;
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
        this.sluggers.set(project, new Slugger());

        if (!hasReadme(this.application.options.getValue("readme"))) {
            project.url = "index.html";
            urls.push(new UrlMapping<ContainerReflection>("index.html", project, this.reflectionTemplate));
        } else if (project.children?.every((child) => child.kindOf(ReflectionKind.Module))) {
            // If there are no non-module children, then there's no point in having a modules page since there
            // will be nothing on it besides the navigation, so redirect the module page to the readme page
            project.url = "index.html";
            urls.push(new UrlMapping("index.html", project, this.indexTemplate));
        } else {
            project.url = "modules.html";
            urls.push(new UrlMapping("modules.html", project, this.reflectionTemplate));
            urls.push(new UrlMapping("index.html", project, this.indexTemplate));
        }

        if (getHierarchyRoots(project).length) {
            urls.push(new UrlMapping("hierarchy.html", project, this.hierarchyTemplate));
        }

        project.childrenIncludingDocuments?.forEach((child) => this.buildUrls(child, urls));

        return urls;
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
    private getMapping(reflection: DeclarationReflection | DocumentReflection): TemplateMapping | undefined {
        return this.mappings.find((mapping) => reflection.kindOf(mapping.kind));
    }

    /**
     * Build the url for the the given reflection and all of its children.
     *
     * @param reflection  The reflection the url should be created for.
     * @param urls        The array the url should be appended to.
     * @returns           The altered urls array.
     */
    buildUrls(reflection: DeclarationReflection | DocumentReflection, urls: UrlMapping[]): UrlMapping[] {
        const mapping = this.getMapping(reflection);
        if (mapping) {
            if (!reflection.url || !DefaultTheme.URL_PREFIX.test(reflection.url)) {
                const url = [mapping.directory, DefaultTheme.getUrl(reflection) + ".html"].join("/");
                urls.push(new UrlMapping(url, reflection, mapping.template));
                this.sluggers.set(reflection, new Slugger());

                reflection.url = url;
                reflection.hasOwnDocument = true;
            }

            reflection.traverse((child) => {
                if (child.isDeclaration() || child.isDocument()) {
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

    render(page: PageEvent<Reflection>, template: RenderTemplate<PageEvent<Reflection>>): string {
        const templateOutput = this.defaultLayoutTemplate(page, template);
        return "<!DOCTYPE html>" + JSX.renderElement(templateOutput);
    }

    private _navigationCache: NavigationElement[] | undefined;

    /**
     * If implementing a custom theme, it is recommended to override {@link buildNavigation} instead.
     */
    getNavigation(project: ProjectReflection): NavigationElement[] {
        // This is ok because currently TypeDoc wipes out the theme after each render.
        // Might need to change in the future, but it's fine for now.
        if (this._navigationCache) {
            return this._navigationCache;
        }

        return (this._navigationCache = this.buildNavigation(project));
    }

    buildNavigation(project: ProjectReflection): NavigationElement[] {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const theme = this;
        const opts = this.application.options.getValue("navigation");
        const leaves = this.application.options.getValue("navigationLeaves");

        return getNavigationElements(project) || [];

        function toNavigation(
            element: ReflectionCategory | ReflectionGroup | DeclarationReflection | DocumentReflection,
        ): NavigationElement {
            if (element instanceof ReflectionCategory || element instanceof ReflectionGroup) {
                return {
                    text: element.title,
                    children: getNavigationElements(element),
                };
            }

            return {
                text: getDisplayName(element),
                path: element.url,
                kind: element.kind,
                class: classNames({ deprecated: element.isDeprecated() }, theme.getReflectionClasses(element)),
                children: getNavigationElements(element),
            };
        }

        function getNavigationElements(
            parent:
                | ReflectionCategory
                | ReflectionGroup
                | DeclarationReflection
                | ProjectReflection
                | DocumentReflection,
        ): undefined | NavigationElement[] {
            if (parent instanceof ReflectionCategory) {
                return parent.children.map(toNavigation);
            }

            if (parent instanceof ReflectionGroup) {
                if (shouldShowCategories(parent.owningReflection, opts) && parent.categories) {
                    return parent.categories.map(toNavigation);
                }
                return parent.children.map(toNavigation);
            }

            if (leaves.includes(parent.getFullName())) {
                return;
            }

            if (!parent.kindOf(ReflectionKind.MayContainDocuments)) {
                return;
            }

            if (parent.isDocument()) {
                return parent.children?.map(toNavigation);
            }

            if (!parent.kindOf(ReflectionKind.SomeModule | ReflectionKind.Project)) {
                // Tricky: Non-module children don't show up in the navigation pane,
                //   but any documents added by them should.
                return parent.documents?.map(toNavigation);
            }

            if (parent.categories && shouldShowCategories(parent, opts)) {
                return parent.categories.map(toNavigation);
            }

            if (parent.groups && shouldShowGroups(parent, opts)) {
                return parent.groups.map(toNavigation);
            }

            if (opts.includeFolders && parent.childrenIncludingDocuments?.some((child) => child.name.includes("/"))) {
                return deriveModuleFolders(parent.childrenIncludingDocuments);
            }

            return parent.childrenIncludingDocuments?.map(toNavigation);
        }

        function deriveModuleFolders(children: Array<DeclarationReflection | DocumentReflection>) {
            const result: NavigationElement[] = [];

            const resolveOrCreateParents = (
                path: string[],
                root: NavigationElement[] = result,
            ): NavigationElement[] => {
                if (path.length > 1) {
                    const inner = root.find((el) => el.text === path[0]);
                    if (inner) {
                        inner.children ||= [];
                        return resolveOrCreateParents(path.slice(1), inner.children);
                    } else {
                        root.push({
                            text: path[0],
                            children: [],
                        });
                        return resolveOrCreateParents(path.slice(1), root[root.length - 1].children);
                    }
                }

                return root;
            };

            // Note: This might end up putting a module within another module if we document
            // both foo/index.ts and foo/bar.ts.
            for (const child of children) {
                const parts = child.name.split("/");
                const collection = resolveOrCreateParents(parts);
                const nav = toNavigation(child);
                nav.text = parts[parts.length - 1];
                collection.push(nav);
            }

            // Now merge single-possible-paths together so we don't have folders in our navigation
            // which contain only another single folder.
            const queue = [...result];
            while (queue.length) {
                const review = queue.shift()!;
                queue.push(...(review.children || []));
                if (review.kind || review.path) continue;

                if (review.children?.length === 1) {
                    const copyFrom = review.children[0];
                    const fullName = `${review.text}/${copyFrom.text}`;
                    delete review.children;
                    Object.assign(review, copyFrom);
                    review.text = fullName;
                    queue.push(review);
                }
            }

            return result;
        }
    }

    private sluggers = new Map<Reflection, Slugger>();

    getSlugger(reflection: Reflection): Slugger {
        if (this.sluggers.has(reflection)) {
            return this.sluggers.get(reflection)!;
        }
        // A slugger should always be defined at least for the project
        return this.getSlugger(reflection.parent!);
    }

    /**
     * Generate an anchor url for the given reflection and all of its children.
     *
     * @param reflection  The reflection an anchor url should be created for.
     * @param container   The nearest reflection having an own document.
     */
    static applyAnchorUrl(reflection: Reflection, container: Reflection) {
        if (
            !(reflection instanceof DeclarationReflection) &&
            !(reflection instanceof SignatureReflection) &&
            !(reflection instanceof TypeParameterReflection)
        ) {
            return;
        }

        if (!reflection.url || !DefaultTheme.URL_PREFIX.test(reflection.url)) {
            const anchor = DefaultTheme.getUrl(reflection, container, ".");

            reflection.url = container.url! + "#" + anchor;
            reflection.anchor = anchor;
            reflection.hasOwnDocument = false;
        }

        reflection.traverse((child) => {
            DefaultTheme.applyAnchorUrl(child, container);
            return true;
        });
    }
}

function hasReadme(readme: string) {
    return !readme.endsWith("none");
}

function getReflectionClasses(
    reflection: DeclarationReflection | DocumentReflection,
    filters: Record<string, boolean>,
) {
    const classes: string[] = [];

    // Filter classes should match up with the settings function in
    // partials/navigation.tsx.
    for (const key of Object.keys(filters)) {
        if (key === "inherited") {
            if (reflection.flags.isInherited) {
                classes.push("tsd-is-inherited");
            }
        } else if (key === "protected") {
            if (reflection.flags.isProtected) {
                classes.push("tsd-is-protected");
            }
        } else if (key === "private") {
            if (reflection.flags.isPrivate) {
                classes.push("tsd-is-private");
            }
        } else if (key === "external") {
            if (reflection.flags.isExternal) {
                classes.push("tsd-is-external");
            }
        } else if (key.startsWith("@")) {
            if (key === "@deprecated") {
                if (reflection.isDeprecated()) {
                    classes.push(toStyleClass(`tsd-is-${key.substring(1)}`));
                }
            } else if (
                reflection.comment?.hasModifier(key as `@${string}`) ||
                reflection.comment?.getTag(key as `@${string}`)
            ) {
                classes.push(toStyleClass(`tsd-is-${key.substring(1)}`));
            }
        }
    }

    return classes.join(" ");
}

function shouldShowCategories(reflection: Reflection, opts: { includeCategories: boolean; includeGroups: boolean }) {
    if (opts.includeCategories) {
        return !reflection.comment?.hasModifier("@hideCategories");
    }
    return reflection.comment?.hasModifier("@showCategories") === true;
}

function shouldShowGroups(reflection: Reflection, opts: { includeCategories: boolean; includeGroups: boolean }) {
    if (opts.includeGroups) {
        return !reflection.comment?.hasModifier("@hideGroups");
    }
    return reflection.comment?.hasModifier("@showGroups") === true;
}
