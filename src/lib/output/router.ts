import type { Application } from "../application.js";
import {
    type DeclarationReflection,
    ReflectionKind,
    type ProjectReflection,
    type Reflection,
} from "../models/index.js";
import { createNormalizedUrl } from "../utils/html.js";
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
 * TypeDoc's default router implementation.
 */
export class DefaultRouter implements Router {
    // Note: This will always contain lowercased names to avoid issues with
    // case-insensitive file systems.
    protected usedFileNames = new Set<string>();
    protected sluggers = new Map<Reflection, Slugger>();
    protected fullUrls = new Map<Reflection, string>();
    protected anchors = new Map<Reflection, string>();

    @Option("sluggerConfiguration")
    private accessor sluggerConfiguration!: TypeDocOptionMap["sluggerConfiguration"];

    @Option("includeHierarchySummary")
    private accessor includeHierarchySummary!: boolean;

    constructor(readonly application: Application) {}

    extension = "html";

    directories = new Map<ReflectionKind, [dir: string, kind: PageKind]>([
        [ReflectionKind.Class, ["classes", PageKind.Reflection]],
        [ReflectionKind.Interface, ["interfaces", PageKind.Reflection]],
        [ReflectionKind.Enum, ["enums", PageKind.Reflection]],
        [ReflectionKind.Namespace, ["modules", PageKind.Reflection]],
        [ReflectionKind.Module, ["modules", PageKind.Reflection]],
        [ReflectionKind.TypeAlias, ["types", PageKind.Reflection]],
        [ReflectionKind.Function, ["functions", PageKind.Reflection]],
        [ReflectionKind.Variable, ["variables", PageKind.Reflection]],
        [ReflectionKind.Document, ["documents", PageKind.Document]],
    ]);

    buildPages(project: ProjectReflection): PageDefinition[] {
        this.usedFileNames = new Set();
        this.sluggers = new Map([
            [project, new Slugger(this.sluggerConfiguration)],
        ]);

        const pages: PageDefinition[] = [];

        if (project.readme?.length) {
            pages.push({
                url: `index.${this.extension}`,
                kind: PageKind.Index,
                model: project,
            });
            pages.push({
                url: `modules.${this.extension}`,
                kind: PageKind.Reflection,
                model: project,
            });
        } else {
            pages.push({
                url: `index.${this.extension}`,
                kind: PageKind.Reflection,
                model: project,
            });
        }

        this.fullUrls.set(project, pages[pages.length - 1].url);

        if (this.includeHierarchySummary && getHierarchyRoots(project)) {
            pages.push({
                url: `hierarchy.${this.extension}`,
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

        if (equal) {
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

    protected buildChildPages(
        reflection: Reflection,
        outPages: PageDefinition[],
    ): void {
        const mapping = this.directories.get(reflection.kind);

        if (mapping) {
            const url = [mapping[0], this.getFileName(reflection)].join("/");
            this.fullUrls.set(reflection, url);
            this.sluggers.set(
                reflection,
                new Slugger(this.sluggerConfiguration),
            );

            outPages.push({
                kind: PageKind.Reflection,
                model: reflection,
                url,
            });

            reflection.traverse((child) => {
                if (child.isDeclaration() || child.isDocument()) {
                    this.buildChildPages(child, outPages);
                } else {
                    this.buildAnchors(child, reflection);
                }
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

    protected getFileName(reflection: Reflection): string {
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
            return `${baseName}-${index}.${this.extension}`;
        }

        this.usedFileNames.add(lowerBaseName);
        return `${baseName}.${this.extension}`;
    }
}
