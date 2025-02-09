import type { Application } from "../application.js";
import { CategoryPlugin } from "../converter/plugins/CategoryPlugin.js";
import { GroupPlugin } from "../converter/plugins/GroupPlugin.js";
import {
    type DeclarationReflection,
    type ProjectReflection,
    type Reflection,
    ReflectionKind,
} from "../models/index.js";
import { createNormalizedUrl } from "#utils";
import { Option, type TypeDocOptionMap } from "../utils/index.js";
import { Slugger } from "./themes/default/Slugger.js";
import { getHierarchyRoots } from "./themes/lib.js";

/**
 * The type of page which should be rendered. This may be extended in the future.
 * @enum
 */
export const PageKind = {
    Index: "index",
    Reflection: "reflection",
    Document: "document",
    Hierarchy: "hierarchy",
} as const;
export type PageKind = (typeof PageKind)[keyof typeof PageKind];

export interface PageDefinition {
    readonly url: string;
    readonly kind: PageKind;
    readonly model: Reflection;
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
     * Can be used to check if the reflection can be linked to.
     */
    hasUrl(reflection: Reflection): boolean;

    /**
     * Get a list of all reflections which can be linked to.
     * This is used for creating the search index.
     */
    getLinkableReflections(): Reflection[];

    /**
     * Gets an anchor for this reflection within its containing page.
     * May be undefined if this reflection owns its own page.
     */
    getAnchor(refl: Reflection): string | undefined;

    /**
     * Returns true if the reflection has its own page, false if embedded within
     * another page.
     */
    hasOwnDocument(refl: Reflection): boolean;

    /**
     * Should return a URL which when clicked on the page containing `from`
     * takes the user to the page/anchor containing `to`.
     */
    relativeUrl(from: Reflection, to: Reflection): string;

    /**
     * Should return a URL relative to the project base. This is used for
     * determining links to items in the assets folder.
     */
    baseRelativeUrl(from: Reflection, target: string): string;

    /**
     * Get the full URL to the reflection. In TypeDoc's default router this
     * is equivalent to `relativeUrl(project, refl)`, but this might not be
     * the case for custom routers which place the project somewhere else
     * besides `index.html`.
     *
     * The URL returned by this by the frontend JS when building dynamic URLs
     * for the search, full hierarchy, and navigation components.
     */
    getFullUrl(refl: Reflection): string;

    /**
     * Responsible for getting a slugger for the given reflection. If a
     * reflection is not associated with a page, the slugger for the parent
     * reflection should be returned instead.
     */
    getSlugger(reflection: Reflection): Slugger;
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
    protected sluggers = new Map<Reflection, Slugger>();
    protected fullUrls = new Map<Reflection, string>();
    protected anchors = new Map<Reflection, string>();

    @Option("sluggerConfiguration")
    protected accessor sluggerConfiguration!: TypeDocOptionMap["sluggerConfiguration"];

    @Option("includeHierarchySummary")
    protected accessor includeHierarchySummary!: boolean;

    constructor(readonly application: Application) {}

    /**
     * Should return the base-relative desired file name for a reflection.
     * This name may not be used exactly as TypeDoc will detect conflicts
     * and automatically introduce a unique identifier to the URL to resolve
     * them.
     */
    protected abstract getIdealBaseName(reflection: Reflection): string;

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

    hasUrl(reflection: Reflection): boolean {
        return this.fullUrls.has(reflection);
    }

    getLinkableReflections(): Reflection[] {
        return Array.from(this.fullUrls.keys());
    }

    getAnchor(refl: Reflection): string | undefined {
        return this.anchors.get(refl);
    }

    hasOwnDocument(refl: Reflection): boolean {
        return this.anchors.get(refl) === undefined && this.hasUrl(refl);
    }

    relativeUrl(from: Reflection, to: Reflection): string {
        let slashes = 0;
        while (!this.hasOwnDocument(from)) {
            from = from.parent!;
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

        if (equal && !to.isProject()) {
            return `#${this.getAnchor(to)}`;
        }

        return "../".repeat(slashes) + toUrl.substring(start);
    }

    baseRelativeUrl(from: Reflection, target: string): string {
        let slashes = 0;
        const full = this.getFullUrl(from);
        for (let i = 0; i < full.length; ++i) {
            if (full[i] === "/") ++slashes;
        }

        return "../".repeat(slashes) + target;
    }

    getFullUrl(refl: Reflection): string {
        const url = this.fullUrls.get(refl);
        if (!url) {
            throw new Error(
                `Tried to get a URL of a reflection ${refl.getFullName()} which did not receive a URL`,
            );
        }

        return url;
    }

    getSlugger(reflection: Reflection): Slugger {
        if (this.sluggers.has(reflection)) {
            return this.sluggers.get(reflection)!;
        }
        // A slugger should always be defined at least for the project
        return this.getSlugger(reflection.parent!);
    }

    /**
     * Should the page kind to use if a reflection should have its own rendered
     * page in the output. Note that once `undefined` is returned, children of
     * that reflection will not have their own document.
     */
    protected getPageKind(reflection: Reflection): PageKind | undefined {
        const pageReflectionKinds = ReflectionKind.Class |
            ReflectionKind.Interface |
            ReflectionKind.Enum |
            ReflectionKind.Module |
            ReflectionKind.Namespace |
            ReflectionKind.TypeAlias |
            ReflectionKind.Function |
            ReflectionKind.Variable;
        const documentReflectionKinds = ReflectionKind.Document;

        if (reflection.kindOf(pageReflectionKinds)) {
            return PageKind.Reflection;
        }

        if (reflection.kindOf(documentReflectionKinds)) {
            return PageKind.Document;
        }
    }

    protected buildChildPages(
        reflection: Reflection,
        outPages: PageDefinition[],
    ): void {
        const kind = this.getPageKind(reflection);
        if (kind) {
            const idealName = this.getIdealBaseName(reflection);
            const actualName = this.getFileName(idealName);
            this.fullUrls.set(reflection, actualName);
            this.sluggers.set(
                reflection,
                new Slugger(this.sluggerConfiguration),
            );

            outPages.push({
                kind,
                model: reflection,
                url: actualName,
            });

            reflection.traverse((child) => {
                this.buildChildPages(child, outPages);
                return true;
            });
        } else {
            this.buildAnchors(reflection, reflection.parent!);
        }
    }

    protected buildAnchors(
        reflection: Reflection,
        pageReflection: Reflection,
    ): void {
        if (
            !reflection.isDeclaration() &&
            !reflection.isSignature() &&
            !reflection.isTypeParameter()
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
                (reflection.parent as DeclarationReflection).type?.type !==
                    "reflection")
        ) {
            return;
        }

        if (!reflection.kindOf(ReflectionKind.TypeLiteral)) {
            let refl: Reflection | undefined = reflection;
            const parts = [refl.name];
            while (refl.parent && refl.parent !== pageReflection) {
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

            const anchor = this.getSlugger(pageReflection).slug(
                parts.join("."),
            );

            this.fullUrls.set(
                reflection,
                this.fullUrls.get(pageReflection)! + "#" + anchor,
            );
            this.anchors.set(reflection, anchor);
        }

        reflection.traverse((child) => {
            this.buildAnchors(child, pageReflection);
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

    protected override getIdealBaseName(reflection: Reflection): string {
        const dir = this.directories.get(reflection.kind)!;
        const parts = [createNormalizedUrl(reflection.name)];
        while (reflection.parent && !reflection.parent.isProject()) {
            reflection = reflection.parent;
            parts.unshift(createNormalizedUrl(reflection.name));
        }

        const baseName = parts.join(".");
        return `${dir}/${baseName}`;
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
        reflection: Reflection,
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
    protected override getIdealBaseName(reflection: Reflection): string {
        // Special case: Modules allow slashes in their name. We actually want
        // to allow that here to mirror file structures.
        const parts = [...reflection.name.split("/").map(createNormalizedUrl)];
        while (reflection.parent && !reflection.parent.isProject()) {
            reflection = reflection.parent;
            parts.unshift(
                ...reflection.name.split("/").map(createNormalizedUrl),
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
        reflection: Reflection,
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
                this.application.internationalization,
            );

            return group.values().next().value!;
        }

        throw new Error(
            "Tried to render a non declaration/document to a page, not supported by GroupRouter",
        );
    }

    protected override getIdealBaseName(reflection: Reflection): string {
        const group = this.getGroup(reflection)
            .split("/")
            .map(createNormalizedUrl)
            .join("/");
        const parts = [createNormalizedUrl(reflection.name)];
        while (reflection.parent && !reflection.parent.isProject()) {
            reflection = reflection.parent;
            parts.unshift(createNormalizedUrl(reflection.name));
        }

        const baseName = parts.join(".");
        return `${group}/${baseName}`;
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

    protected override getIdealBaseName(reflection: Reflection): string {
        const cat = this.getCategory(reflection)
            .split("/")
            .map(createNormalizedUrl)
            .join("/");
        const parts = [createNormalizedUrl(reflection.name)];
        while (reflection.parent && !reflection.parent.isProject()) {
            reflection = reflection.parent;
            parts.unshift(createNormalizedUrl(reflection.name));
        }

        const baseName = parts.join(".");
        return `${cat}/${baseName}`;
    }
}
