import { Theme } from "../../theme.js";
import type { Renderer } from "../../renderer.js";
import {
    type ContainerReflection,
    type DeclarationReflection,
    type DocumentReflection,
    type ProjectReflection,
    ReferenceReflection,
    type Reflection,
    ReflectionCategory,
    ReflectionGroup,
    ReflectionKind,
} from "../../../models/index.js";
import { type RenderTemplate } from "../../models/UrlMapping.js";
import type { PageEvent } from "../../events.js";
import type { MarkedPlugin } from "../../plugins/index.js";
import { DefaultThemeRenderContext } from "./DefaultThemeRenderContext.js";
import { getIcons, type Icons } from "./partials/icon.js";
import { createNormalizedUrl, filterMap, JSX } from "#utils";
import { classNames, getDisplayName, toStyleClass } from "../lib.js";
import { PageKind, type Router } from "../../router.js";

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

    /** @internal */
    markedPlugin: MarkedPlugin;

    router: Router;

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
    icons: Icons;

    ContextClass = DefaultThemeRenderContext;

    getRenderContext(pageEvent: PageEvent<Reflection>) {
        return new this.ContextClass(this.router, this, pageEvent, this.application.options);
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

    getReflectionClasses(reflection: Reflection) {
        const filters = this.application.options.getValue("visibilityFilters") as Record<string, boolean>;
        return getReflectionClasses(reflection, filters);
    }

    /**
     * Create a new DefaultTheme instance.
     *
     * @param renderer  The renderer this theme is attached to.
     */
    constructor(renderer: Renderer) {
        super(renderer);
        this.icons = getIcons();
        this.markedPlugin = renderer.markedPlugin;
        this.router = renderer.router!;
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

    render(page: PageEvent<Reflection>): string {
        const template = {
            [PageKind.Index]: this.indexTemplate,
            [PageKind.Document]: this.documentTemplate,
            [PageKind.Hierarchy]: this.hierarchyTemplate,
            [PageKind.Reflection]: this.reflectionTemplate,
        }[page.pageKind] as RenderTemplate<PageEvent<Reflection>>;

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
        const router = this.router;
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
                path: router.getFullUrl(element),
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
            for (const child of children.filter((c) => router.hasOwnDocument(c))) {
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
}

function getReflectionClasses(reflection: Reflection, filters: Record<string, boolean>) {
    const classes = new Set<string>();

    // Filter classes should match up with the settings function in
    // partials/navigation.tsx.
    for (const key of Object.keys(filters)) {
        if (key === "inherited") {
            if (reflection.flags.isInherited) {
                classes.add("tsd-is-inherited");
            }
        } else if (key === "protected") {
            if (reflection.flags.isProtected) {
                classes.add("tsd-is-protected");
            }
        } else if (key === "private") {
            if (reflection.flags.isPrivate) {
                classes.add("tsd-is-private");
            }
        } else if (key === "external") {
            if (reflection.flags.isExternal) {
                classes.add("tsd-is-external");
            }
        } else if (key.startsWith("@")) {
            if (key === "@deprecated") {
                if (reflection.isDeprecated()) {
                    classes.add(toStyleClass(`tsd-is-${key.substring(1)}`));
                }
            } else if (
                reflection.comment?.hasModifier(key as `@${string}`) ||
                reflection.comment?.getTag(key as `@${string}`)
            ) {
                classes.add(toStyleClass(`tsd-is-${key.substring(1)}`));
            } else if (reflection.isDeclaration()) {
                const ownSignatures = reflection.getNonIndexSignatures();
                // Check methods and accessors, find common tags, elevate
                if (
                    ownSignatures.length &&
                    ownSignatures.every(
                        (refl) =>
                            refl.comment?.hasModifier(key as `@${string}`) || refl.comment?.getTag(key as `@${string}`),
                    )
                ) {
                    classes.add(toStyleClass(`tsd-is-${key.substring(1)}`));
                }
            }
        }
    }

    return Array.from(classes).join(" ");
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
