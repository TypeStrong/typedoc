import { Theme } from "../../theme.js";
import type { Renderer } from "../../renderer.js";
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
    ReferenceReflection,
} from "../../../models/index.js";
import { type RenderTemplate, UrlMapping } from "../../models/UrlMapping.js";
import type { PageEvent } from "../../events.js";
import type { MarkedPlugin } from "../../plugins/index.js";
import { DefaultThemeRenderContext } from "./DefaultThemeRenderContext.js";
import { filterMap, JSX, Option, type TypeDocOptionMap } from "../../../utils/index.js";
import { classNames, getDisplayName, getHierarchyRoots, toStyleClass } from "../lib.js";
import { icons } from "./partials/icon.js";
import { Slugger } from "./Slugger.js";
import { createNormalizedUrl } from "../../../utils/html.js";

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

export class DefaultTheme extends Theme {
    // Note: This will always contain lowercased names to avoid issues with
    // case-insensitive file systems.
    usedFileNames = new Set<string>();

    @Option("sluggerConfiguration")
    private accessor sluggerConfiguration!: TypeDocOptionMap["sluggerConfiguration"];

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
        this.markedPlugin = renderer.markedPlugin;
    }

    /**
     * Map the models of the given project to the desired output files.
     *
     * @param project  The project whose urls should be generated.
     * @returns        A list of {@link UrlMapping} instances defining which models
     *                 should be rendered to which files.
     */
    getUrls(project: ProjectReflection): UrlMapping[] {
        this.usedFileNames = new Set();
        const urls: UrlMapping[] = [];
        this.setSlugger(project, new Slugger(this.sluggerConfiguration));

        if (!project.readme?.length) {
            project.url = "index.html";
            urls.push(new UrlMapping<ContainerReflection>("index.html", project, this.reflectionTemplate));
        } else {
            project.url = "modules.html";
            urls.push(new UrlMapping("modules.html", project, this.reflectionTemplate));
            urls.push(new UrlMapping("index.html", project, this.indexTemplate));
        }

        if (this.application.options.getValue("includeHierarchySummary") && getHierarchyRoots(project).length) {
            urls.push(new UrlMapping("hierarchy.html", project, this.hierarchyTemplate));
        }

        project.childrenIncludingDocuments?.forEach((child) => this.buildUrls(child, urls));

        return urls;
    }

    /**
     * @param reflection  The reflection the url should be generated for.
     */
    getFileName(reflection: Reflection): string {
        const parts = [createNormalizedUrl(reflection.name)];
        while (reflection.parent && !reflection.parent.isProject()) {
            reflection = reflection.parent;
            parts.unshift(createNormalizedUrl(reflection.name));
        }

        const baseName = parts.join(".");
        const lowerBaseName = baseName.toLocaleLowerCase();
        if (this.usedFileNames.has(lowerBaseName)) {
            let index = 1;
            while (this.usedFileNames.has(`${lowerBaseName}-${index}`)) {
                ++index;
            }

            this.usedFileNames.add(`${lowerBaseName}-${index}`);
            return `${baseName}-${index}.html`;
        }

        this.usedFileNames.add(lowerBaseName);
        return `${baseName}.html`;
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
                const url = [mapping.directory, this.getFileName(reflection)].join("/");
                urls.push(new UrlMapping(url, reflection, mapping.template));
                this.setSlugger(reflection, new Slugger(this.sluggerConfiguration));

                reflection.url = url;
                reflection.hasOwnDocument = true;
            }

            reflection.traverse((child) => {
                if (child.isDeclaration() || child.isDocument()) {
                    this.buildUrls(child, urls);
                } else {
                    this.applyAnchorUrl(child, reflection);
                }
                return true;
            });
        } else if (reflection.parent) {
            this.applyAnchorUrl(reflection, reflection.parent);
        }

        return urls;
    }

    render(page: PageEvent<Reflection>, template: RenderTemplate<PageEvent<Reflection>>): string {
        const templateOutput = this.defaultLayoutTemplate(page, template);
        return "<!DOCTYPE html>" + JSX.renderElement(templateOutput) + "\n";
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
        ): NavigationElement | undefined {
            if (opts.excludeReferences && element instanceof ReferenceReflection) {
                return;
            }

            const children = getNavigationElements(element);
            if (element instanceof ReflectionCategory || element instanceof ReflectionGroup) {
                if (!children?.length) {
                    return;
                }

                return {
                    text: element.title,
                    children,
                };
            }

            return {
                text: getDisplayName(element),
                path: element.url,
                kind: element.kind & ReflectionKind.Project ? undefined : element.kind,
                class: classNames({ deprecated: element.isDeprecated() }, theme.getReflectionClasses(element)),
                children: children?.length ? children : undefined,
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
                return filterMap(parent.children, toNavigation);
            }

            if (parent instanceof ReflectionGroup) {
                if (shouldShowCategories(parent.owningReflection, opts) && parent.categories) {
                    return filterMap(parent.categories, toNavigation);
                }
                return filterMap(parent.children, toNavigation);
            }

            if (leaves.includes(parent.getFullName())) {
                return;
            }

            if (!parent.kindOf(ReflectionKind.MayContainDocuments)) {
                return;
            }

            if (parent.isDocument()) {
                return filterMap(parent.children, toNavigation);
            }

            if (!parent.kindOf(ReflectionKind.SomeModule | ReflectionKind.Project)) {
                // Tricky: Non-module children don't show up in the navigation pane,
                //   but any documents added by them should.
                return filterMap(parent.documents, toNavigation);
            }

            if (parent.categories && shouldShowCategories(parent, opts)) {
                return filterMapWithNoneCollection(parent.categories);
            }

            if (parent.groups && shouldShowGroups(parent, opts)) {
                return filterMapWithNoneCollection(parent.groups);
            }

            if (opts.includeFolders && parent.childrenIncludingDocuments?.some((child) => child.name.includes("/"))) {
                return deriveModuleFolders(parent.childrenIncludingDocuments);
            }

            return filterMap(parent.childrenIncludingDocuments, toNavigation);
        }

        function filterMapWithNoneCollection(reflection: ReflectionGroup[] | ReflectionCategory[]) {
            const none = reflection.find((x) => x.title.toLocaleLowerCase() === "none");
            const others = reflection.filter((x) => x.title.toLocaleLowerCase() !== "none");

            const mappedOthers = filterMap(others, toNavigation);

            if (none) {
                const noneMappedChildren = filterMap(none.children, toNavigation);
                return [...noneMappedChildren, ...mappedOthers];
            }

            return mappedOthers;
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
            for (const child of children.filter((c) => c.hasOwnDocument)) {
                const nav = toNavigation(child);
                if (nav) {
                    const parts = child.name.split("/");
                    const collection = resolveOrCreateParents(parts);
                    nav.text = parts[parts.length - 1];
                    collection.push(nav);
                }
            }

            // Now merge single-possible-paths together so we don't have folders in our navigation
            // which contain only another single folder.
            if (opts.compactFolders) {
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
            }

            return result;
        }
    }

    /**
     * Generate an anchor url for the given reflection and all of its children.
     *
     * @param reflection  The reflection an anchor url should be created for.
     * @param container   The nearest reflection having an own document.
     */
    applyAnchorUrl(reflection: Reflection, container: Reflection) {
        if (
            !(reflection instanceof DeclarationReflection) &&
            !(reflection instanceof SignatureReflection) &&
            !(reflection instanceof TypeParameterReflection)
        ) {
            return;
        }

        // We support linking to reflections for types directly contained within an export
        // but not any deeper. This is because TypeDoc may or may not render the type details
        // for a property depending on whether or not it is deemed useful, and defining a link
        // which might not be used may result in a link being generated which isn't valid. #2808.
        // This should be kept in sync with the renderingChildIsUseful function.
        if (
            reflection.kindOf(ReflectionKind.TypeLiteral) &&
            (!reflection.parent?.kindOf(ReflectionKind.SomeExport) ||
                (reflection.parent as DeclarationReflection).type?.type !== "reflection")
        ) {
            return;
        }

        if (
            (!reflection.url || !DefaultTheme.URL_PREFIX.test(reflection.url)) &&
            !reflection.kindOf(ReflectionKind.TypeLiteral)
        ) {
            let refl: Reflection | undefined = reflection;
            const parts = [refl.name];
            while (refl.parent && refl.parent !== container && !(reflection.parent instanceof ProjectReflection)) {
                refl = refl.parent;
                // Avoid duplicate names for signatures
                // BREAKING: In 0.28, also add !refl.kindOf(ReflectionKind.TypeLiteral) to this check to improve anchor
                // generation by omitting useless __type prefixes.
                if (parts[0] !== refl.name) {
                    parts.unshift(refl.name);
                }
            }

            const anchor = this.getSlugger(reflection).slug(parts.join("."));

            reflection.url = container.url! + "#" + anchor;
            reflection.anchor = anchor;
            reflection.hasOwnDocument = false;
        }

        reflection.traverse((child) => {
            this.applyAnchorUrl(child, container);
            return true;
        });
    }
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
