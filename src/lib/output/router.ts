import type { Application } from "../application.js";
import { CategoryPlugin } from "../converter/plugins/CategoryPlugin.js";
import { GroupPlugin } from "../converter/plugins/GroupPlugin.js";
import {
    type DeclarationReflection,
    ProjectReflection,
    Reflection,
    ReflectionGroup,
    ReflectionKind,
} from "../models/index.js";
import { createNormalizedUrl } from "#node-utils";
import { Option, type TypeDocOptionMap } from "../utils/index.js";
import { Slugger } from "./themes/default/Slugger.js";
import { getHierarchyRoots } from "./themes/lib.js";

/**
 * The type of page which should be rendered. This may be extended in the future.
 *
 * Note: TypeDoc any string may be used as the page kind. TypeDoc defines a few
 * described by this object.
 * @enum
 */
export const PageKind = {
    Index: "index",
    Reflection: "reflection",
    Document: "document",
    Hierarchy: "hierarchy",
    Group: "group",
} as const;
export type PageKind = (typeof PageKind)[keyof typeof PageKind] | string & {};

/**
 * A router target is something that may be linked to within a page. Notably,
 * {@link Reflection} is compatible with this interface. TypeDoc supports non-reflection
 * router targets, but does not currently create any.
 */
export type RouterTarget = {
    name: string;
    parent: RouterTarget;
} | Reflection;

export interface PageDefinition<out Model extends RouterTarget = RouterTarget> {
    readonly url: string;
    readonly kind: PageKind;
    readonly model: Model;
}

function getFullName(target: RouterTarget): string {
    if (target instanceof ProjectReflection) {
        return target.name;
    }
    const parts: string[] = [target.name];
    let current: RouterTarget = target;
    while (!(current instanceof ProjectReflection)) {
        parts.unshift(current.name);
        current = current.parent!;
    }
    return parts.join(".");
}

/**
 * Interface which routers must conform to.
 */
export interface Router {
    /**
     * Should return a list of pages which should be rendered.
     * This will be called once per render.
     */
    buildPages(project: ProjectReflection): PageDefinition[];

    /**
     * Can be used to check if the target can be linked to.
     */
    hasUrl(target: RouterTarget): boolean;

    /**
     * Get a list of all targets which can be linked to.
     * This is used for creating the search index.
     */
    getLinkTargets(): RouterTarget[];

    /**
     * Gets an anchor for this target within its containing page.
     * May be undefined if this target owns its own page.
     */
    getAnchor(refl: RouterTarget): string | undefined;

    /**
     * Returns true if the target has its own page, false if embedded within
     * another page.
     */
    hasOwnDocument(refl: RouterTarget): boolean;

    /**
     * Should return a URL which when clicked on the page containing `from`
     * takes the user to the page/anchor containing `to`.
     */
    relativeUrl(from: RouterTarget, to: RouterTarget): string;

    /**
     * Should return a URL relative to the project base. This is used for
     * determining links to items in the assets folder.
     */
    baseRelativeUrl(from: RouterTarget, target: string): string;

    /**
     * Get the full URL to the target. In TypeDoc's default router this
     * is equivalent to `relativeUrl(project, refl)`, but this might not be
     * the case for custom routers which place the project somewhere else
     * besides `index.html`.
     *
     * The URL returned by this by the frontend JS when building dynamic URLs
     * for the search, full hierarchy, and navigation components.
     */
    getFullUrl(refl: RouterTarget): string;

    /**
     * Responsible for getting a slugger for the given target. If a
     * target is not associated with a page, the slugger for the parent
     * target should be returned instead.
     */
    getSlugger(reflection: RouterTarget): Slugger;
}

/**
 * Base router class intended to make it easier to implement a router.
 *
 * Child classes need only {@link getIdealBaseName}, this class will take care
 * of the recursing through child reflections.
 * @group Routers
 */
export abstract class BaseRouter implements Router {
    extension = ".html";

    // Note: This will always contain lowercased names to avoid issues with
    // case-insensitive file systems.
    protected usedFileNames = new Set<string>();
    protected sluggers = new Map<RouterTarget, Slugger>();
    protected fullUrls = new Map<RouterTarget, string>();
    protected anchors = new Map<RouterTarget, string>();

    @Option("sluggerConfiguration")
    protected accessor sluggerConfiguration!: TypeDocOptionMap["sluggerConfiguration"];

    @Option("includeHierarchySummary")
    protected accessor includeHierarchySummary!: boolean;

    constructor(readonly application: Application) {}

    /**
     * Should return the base-relative desired file name for a router target.
     * This name may not be used exactly as TypeDoc will detect conflicts
     * and automatically introduce a unique identifier to the URL to resolve
     * them.
     */
    protected abstract getIdealBaseName(target: RouterTarget): string;

    buildPages(project: ProjectReflection): PageDefinition[] {
        this.usedFileNames = new Set();
        this.sluggers = new Map([
            [project, new Slugger(this.sluggerConfiguration)],
        ]);

        const pages: PageDefinition[] = [];

        if (project.readme?.length) {
            pages.push({
                url: this.getFileName("index"),
                kind: PageKind.Index,
                model: project,
            });
            pages.push({
                url: this.getFileName("modules"),
                kind: PageKind.Reflection,
                model: project,
            });
        } else {
            pages.push({
                url: this.getFileName("index"),
                kind: PageKind.Reflection,
                model: project,
            });
        }

        this.fullUrls.set(project, pages[pages.length - 1].url);

        if (this.includeHierarchySummary && getHierarchyRoots(project)) {
            pages.push({
                url: this.getFileName("hierarchy"),
                kind: PageKind.Hierarchy,
                model: project,
            });
        }

        for (const child of project.childrenIncludingDocuments || []) {
            this.buildChildPages(child, pages);
        }

        return pages;
    }

    hasUrl(target: RouterTarget): boolean {
        return this.fullUrls.has(target);
    }

    getLinkTargets(): RouterTarget[] {
        return Array.from(this.fullUrls.keys());
    }

    getAnchor(target: RouterTarget): string | undefined {
        if (!this.anchors.has(target)) {
            this.application.logger.verbose(
                `${getFullName(target)} does not have an anchor but one was requested, this is a bug in the theme`,
            );
        }
        return this.anchors.get(target);
    }

    hasOwnDocument(target: RouterTarget): boolean {
        return this.anchors.get(target) === undefined && this.hasUrl(target);
    }

    relativeUrl(from: RouterTarget, to: RouterTarget): string {
        let slashes = 0;
        while (!this.hasOwnDocument(from)) {
            // We know we must have a parent here as the Project is the only
            // root level element without a parent, and the project always has
            // an own document.
            from = from.parent as RouterTarget;
        }

        let toPage = to;
        while (!this.hasOwnDocument(toPage)) {
            toPage = toPage.parent as RouterTarget;
        }

        // We unfortunately have to special case ProjectReflection as it is
        // the model used twice for rendering. This should be changed in a
        // future version to remove this hackery.
        if (from === toPage && !(to instanceof ProjectReflection)) {
            return to === toPage ? "" : `#${this.getAnchor(to)}`;
        }

        const fromUrl = this.getFullUrl(from);
        const toUrl = this.getFullUrl(to);
        let equal = true;
        let start = 0;

        for (let i = 0; i < fromUrl.length; ++i) {
            equal = equal && fromUrl[i] === toUrl[i];
            if (fromUrl[i] === "/") {
                if (equal) {
                    start = i + 1;
                } else {
                    ++slashes;
                }
            }
        }

        // If equal is still set, we're going to a page either in
        // the same directory as this page, or a lower directory,
        // don't bother going up directories just to come back down.
        if (equal) {
            return toUrl.substring(start);
        }

        // Otherwise, go up until we get to the common directory
        // and then back down to the target path.
        return "../".repeat(slashes) + toUrl.substring(start);
    }

    baseRelativeUrl(from: RouterTarget, target: string): string {
        let slashes = 0;
        const full = this.getFullUrl(from);
        for (let i = 0; i < full.length; ++i) {
            if (full[i] === "/") ++slashes;
        }

        // #2910 avoid urls like ".././"
        if (target == "./" && slashes !== 0) {
            return "../".repeat(slashes);
        }

        return "../".repeat(slashes) + target;
    }

    getFullUrl(target: RouterTarget): string {
        const url = this.fullUrls.get(target);
        if (!url) {
            throw new Error(
                `Tried to get a URL of a router target ${getFullName(target)} which did not receive a URL`,
            );
        }

        return url;
    }

    getSlugger(target: RouterTarget): Slugger {
        if (this.sluggers.has(target)) {
            return this.sluggers.get(target)!;
        }
        // A slugger should always be defined at least for the project
        return this.getSlugger(target.parent as RouterTarget);
    }

    /**
     * Should the page kind to use if a reflection should have its own rendered
     * page in the output. Note that once `undefined` is returned, children of
     * that reflection will not have their own document.
     */
    protected getPageKind(target: RouterTarget): PageKind | undefined {
        if (target instanceof ReflectionGroup) {
            return PageKind.Group;
        }

        if (!(target instanceof Reflection)) {
            return undefined;
        }

        const pageReflectionKinds = ReflectionKind.Class |
            ReflectionKind.Interface |
            ReflectionKind.Enum |
            ReflectionKind.Module |
            ReflectionKind.Namespace |
            ReflectionKind.TypeAlias |
            ReflectionKind.Function |
            ReflectionKind.Variable;
        const documentReflectionKinds = ReflectionKind.Document;

        if (target.kindOf(pageReflectionKinds)) {
            return PageKind.Reflection;
        }

        if (target.kindOf(documentReflectionKinds)) {
            return PageKind.Document;
        }
    }

    protected buildChildPages(
        target: RouterTarget,
        outPages: PageDefinition[],
    ): void {
        const kind = this.getPageKind(target);
        if (kind) {
            const idealName = this.getIdealBaseName(target);
            const actualName = this.getFileName(idealName);
            this.fullUrls.set(target, actualName);
            this.sluggers.set(
                target,
                new Slugger(this.sluggerConfiguration),
            );

            outPages.push({
                kind,
                model: target,
                url: actualName,
            });

            if (target instanceof Reflection) {
                target.traverse((child) => {
                    this.buildChildPages(child, outPages);
                    return true;
                });
            }
        } else {
            this.buildAnchors(target, target.parent!);
        }
    }

    protected buildAnchors(
        target: RouterTarget,
        pageTarget: RouterTarget,
    ): void {
        if (!(target instanceof Reflection) || !(pageTarget instanceof Reflection)) {
            return;
        }

        if (
            !target.isDeclaration() &&
            !target.isSignature() &&
            !target.isTypeParameter()
        ) {
            return;
        }

        // We support linking to reflections for types directly contained within an export
        // but not any deeper. This is because TypeDoc may or may not render the type details
        // for a property depending on whether or not it is deemed useful, and defining a link
        // which might not be used may result in a link being generated which isn't valid. #2808.
        // This should be kept in sync with the renderingChildIsUseful function.
        if (
            target.kindOf(ReflectionKind.TypeLiteral) &&
            (!target.parent?.kindOf(ReflectionKind.SomeExport) ||
                (target.parent as DeclarationReflection).type?.type !==
                    "reflection")
        ) {
            return;
        }

        if (!target.kindOf(ReflectionKind.TypeLiteral)) {
            let refl: Reflection | undefined = target;
            const parts = [refl.name];
            while (refl.parent && refl.parent !== pageTarget) {
                refl = refl.parent;
                // Avoid duplicate names for signatures and useless __type in anchors
                if (
                    !refl.kindOf(
                        ReflectionKind.TypeLiteral |
                            ReflectionKind.FunctionOrMethod,
                    )
                ) {
                    parts.unshift(refl.name);
                }
            }

            const anchor = this.getSlugger(pageTarget).slug(
                parts.join("."),
            );

            this.fullUrls.set(
                target,
                this.fullUrls.get(pageTarget)! + "#" + anchor,
            );
            this.anchors.set(target, anchor);
        }

        target.traverse((child) => {
            this.buildAnchors(child, pageTarget);
            return true;
        });
    }

    /** Strip non-url safe characters from the specified string. */
    protected getUrlSafeName(name: string): string {
        return createNormalizedUrl(name);
    }

    protected getFileName(baseName: string): string {
        const lowerBaseName = baseName.toLocaleLowerCase();
        if (this.usedFileNames.has(lowerBaseName)) {
            let index = 1;
            while (this.usedFileNames.has(`${lowerBaseName}-${index}`)) {
                ++index;
            }

            this.usedFileNames.add(`${lowerBaseName}-${index}`);
            return `${baseName}-${index}${this.extension}`;
        }

        this.usedFileNames.add(lowerBaseName);
        return `${baseName}${this.extension}`;
    }
}

/**
 * Router which places reflections in folders according to their kind.
 * @group Routers
 */
export class KindRouter extends BaseRouter {
    directories = new Map<ReflectionKind, string>([
        [ReflectionKind.Class, "classes"],
        [ReflectionKind.Interface, "interfaces"],
        [ReflectionKind.Enum, "enums"],
        [ReflectionKind.Namespace, "modules"],
        [ReflectionKind.Module, "modules"],
        [ReflectionKind.TypeAlias, "types"],
        [ReflectionKind.Function, "functions"],
        [ReflectionKind.Variable, "variables"],
        [ReflectionKind.Document, "documents"],
    ]);

    protected override getIdealBaseName(target: RouterTarget): string {
        if (target instanceof Reflection) {
            const dir = this.directories.get(target.kind)!;
            const parts = [createNormalizedUrl(target.name)];
            while (target.parent && !target.parent.isProject()) {
                target = target.parent;
                parts.unshift(createNormalizedUrl(target.name));
            }

            const baseName = parts.join(".");
            return `${dir}/${baseName}`;
        }

        throw new Error("KindRouter does not support non-reflection URL targets");
    }
}

/**
 * Router which places reflections in folders according to their kind,
 * but creates each page as `/index.html` to allow for clean URLs.
 * @group Routers
 */
export class KindDirRouter extends KindRouter {
    private fixLink(link: string) {
        return link.replace(/\/index\.html(#|$)/, "/$1");
    }

    protected override buildChildPages(
        reflection: RouterTarget,
        outPages: PageDefinition[],
    ): void {
        this.extension = `/index.html`;
        return super.buildChildPages(reflection, outPages);
    }

    override getFullUrl(refl: Reflection): string {
        return this.fixLink(super.getFullUrl(refl));
    }

    override relativeUrl(from: Reflection, to: Reflection): string {
        return this.fixLink(super.relativeUrl(from, to));
    }
}

/**
 * Router which places reflections in folders according to the module structure.
 * @group Routers
 */
export class StructureRouter extends BaseRouter {
    protected override getIdealBaseName(target: RouterTarget): string {
        if (target instanceof Reflection) {
            // Special case: Modules allow slashes in their name. We actually want
            // to allow that here to mirror file structures.
            const parts = [...target.name.split("/").map(createNormalizedUrl)];
            while (target.parent && !target.parent.isProject()) {
                target = target.parent;
                parts.unshift(
                    ...target.name.split("/").map(createNormalizedUrl),
                );
            }

            // This should only happen if someone tries to break things with @module
            // I don't think it will ever occur in normal usage.
            if (parts.includes("..")) {
                throw new Error(
                    "structure router cannot be used with a project that has a name containing '..'",
                );
            }

            return parts.join("/");
        }

        throw new Error("StructureRouter does not support non-reflection URL targets");
    }
}

/**
 * Router which places reflections in folders according to the module structure,
 * but creates each page as `/index.html` to allow for clean URLs.
 * @group Routers
 */
export class StructureDirRouter extends StructureRouter {
    private fixLink(link: string) {
        return link.replace(/\/index\.html(#|$)/, "/$1");
    }

    protected override buildChildPages(
        target: RouterTarget,
        outPages: PageDefinition[],
    ): void {
        this.extension = `/index.html`;
        return super.buildChildPages(target, outPages);
    }

    override getFullUrl(refl: Reflection): string {
        return this.fixLink(super.getFullUrl(refl));
    }

    override relativeUrl(from: Reflection, to: Reflection): string {
        return this.fixLink(super.relativeUrl(from, to));
    }
}

/**
 * Router which places reflections in folders according to `@group` tags.
 * @group Routers
 */
export class GroupRouter extends BaseRouter {
    @Option("groupReferencesByType")
    private accessor groupReferencesByType!: boolean;

    private getGroup(reflection: Reflection) {
        if (reflection.isDeclaration() || reflection.isDocument()) {
            const group = GroupPlugin.getGroups(
                reflection,
                this.groupReferencesByType,
            );

            return group.values().next().value!;
        }

        throw new Error(
            "Tried to render a non declaration/document to a page, not supported by GroupRouter",
        );
    }

    protected override getIdealBaseName(target: RouterTarget): string {
        if (target instanceof Reflection) {
            const group = this.getGroup(target)
                .split("/")
                .map(createNormalizedUrl)
                .join("/");
            const parts = [createNormalizedUrl(target.name)];
            while (target.parent && !target.parent.isProject()) {
                target = target.parent;
                parts.unshift(createNormalizedUrl(target.name));
            }

            const baseName = parts.join(".");
            return `${group}/${baseName}`;
        }

        throw new Error("GroupRouter does not support non-Reflection router targets");
    }
}

/**
 * Router which places reflections in folders according to `@category` tags.
 * @group Routers
 */
export class CategoryRouter extends BaseRouter {
    @Option("defaultCategory")
    private accessor defaultCategory!: string;

    private getCategory(reflection: Reflection) {
        if (reflection.isDeclaration() || reflection.isDocument()) {
            const cats = CategoryPlugin.getCategories(reflection);
            return cats.size
                ? cats.values().next().value!
                : this.defaultCategory;
        }

        throw new Error(
            "Tried to render a non declaration/document to a page, not supported by GroupRouter",
        );
    }

    protected override getIdealBaseName(target: RouterTarget): string {
        if (target instanceof Reflection) {
            const cat = this.getCategory(target)
                .split("/")
                .map(createNormalizedUrl)
                .join("/");
            const parts = [createNormalizedUrl(target.name)];
            while (target.parent && !target.parent.isProject()) {
                target = target.parent;
                parts.unshift(createNormalizedUrl(target.name));
            }

            const baseName = parts.join(".");
            return `${cat}/${baseName}`;
        }

        throw new Error(`CategoryRouter does not support non-reflection targets`);
    }
}

/**
 * Router which places reflections in folders according to their kind,
 * and creates pages for groups within modules
 * @group Routers
 */
export class KindRouterWithGroupPages extends KindRouter {
    protected override buildChildPages(
        target: RouterTarget,
        outPages: PageDefinition[],
    ): void {
        const kind = this.getPageKind(target);
        if (kind) {
            const idealName = this.getIdealBaseName(target);
            const actualName = this.getFileName(idealName);
            this.fullUrls.set(target, actualName);
            this.sluggers.set(
                target,
                new Slugger(this.sluggerConfiguration),
            );

            outPages.push({
                kind,
                model: target,
                url: actualName,
            });

            if (target instanceof ReflectionGroup) {
                for (const child of target.children) {
                    this.buildChildPages(child, outPages);
                }
            } else if (target instanceof Reflection) {
                if (
                    target.kindOf(ReflectionKind.SomeModule | ReflectionKind.Project) &&
                    (target as DeclarationReflection).groups
                ) {
                    for (const group of (target as DeclarationReflection).groups!) {
                        this.buildChildPages(group, outPages);
                    }
                } else {
                    target.traverse((child) => {
                        this.buildChildPages(child, outPages);
                        return true;
                    });
                }
            }
        } else {
            this.buildAnchors(target, target.parent!);
        }
    }

    protected override getIdealBaseName(target: RouterTarget): string {
        if (target instanceof ReflectionGroup) {
            const parts = [createNormalizedUrl(target.name)];
            while (target.parent && target.parent.parent) {
                target = target.parent;
                parts.unshift(createNormalizedUrl(target.name));
            }

            const baseName = parts.join(".");
            return `groups/${baseName}`;
        }

        return super.getIdealBaseName(target);
    }
}
