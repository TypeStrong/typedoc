import * as Path from "path";
import lunr from "lunr";

import {
    type Comment,
    DeclarationReflection,
    DocumentReflection,
    ProjectReflection,
    type Reflection,
} from "../../models/index.js";
import { RendererComponent } from "../components.js";
import { IndexEvent, RendererEvent } from "../events.js";
import { Option, writeFile } from "../../utils/index.js";
import { DefaultTheme } from "../themes/default/DefaultTheme.js";
import type { Renderer } from "../index.js";
import { GroupPlugin } from "../../converter/plugins/GroupPlugin.js";
import { CategoryPlugin } from "../../converter/plugins/CategoryPlugin.js";
import { compressJson } from "../../utils/compress.js";

/**
 * Keep this in sync with the interface in src/lib/output/themes/default/assets/typedoc/components/Search.ts
 */
interface SearchDocument {
    kind: number;
    name: string;
    url: string;
    classes?: string;
    parent?: string;
}

/**
 * A plugin that exports an index of the project to a javascript file.
 *
 * The resulting javascript file can be used to build a simple search function.
 */
export class JavascriptIndexPlugin extends RendererComponent {
    @Option("searchInComments")
    private accessor searchComments!: boolean;

    @Option("searchInDocuments")
    private accessor searchDocuments!: boolean;

    @Option("searchGroupBoosts")
    private accessor searchGroupBoosts!: Record<string, number>;

    @Option("searchCategoryBoosts")
    private accessor searchCategoryBoosts!: Record<string, number>;

    @Option("groupReferencesByType")
    accessor groupReferencesByType!: boolean;

    private unusedGroupBoosts = new Set<string>();
    private unusedCatBoosts = new Set<string>();

    constructor(owner: Renderer) {
        super(owner);
        this.owner.on(RendererEvent.BEGIN, this.onRendererBegin.bind(this));
    }

    private onRendererBegin(_event: RendererEvent) {
        this.unusedGroupBoosts = new Set(Object.keys(this.searchGroupBoosts));
        this.unusedCatBoosts = new Set(Object.keys(this.searchCategoryBoosts));

        if (!(this.owner.theme instanceof DefaultTheme)) {
            return;
        }

        this.owner.preRenderAsyncJobs.push((event) =>
            this.buildSearchIndex(event),
        );
    }

    private async buildSearchIndex(event: RendererEvent) {
        const theme = this.owner.theme as DefaultTheme;

        const rows: SearchDocument[] = [];

        const initialSearchResults = Object.values(
            event.project.reflections,
        ).filter((refl) => {
            return (
                (refl instanceof DeclarationReflection ||
                    refl instanceof DocumentReflection) &&
                refl.url &&
                refl.name &&
                !refl.flags.isExternal
            );
        }) as Array<DeclarationReflection | DocumentReflection>;

        const indexEvent = new IndexEvent(initialSearchResults);

        this.owner.trigger(IndexEvent.PREPARE_INDEX, indexEvent);

        const builder = new lunr.Builder();
        builder.pipeline.add(lunr.trimmer);

        builder.ref("id");
        for (const [key, boost] of Object.entries(
            indexEvent.searchFieldWeights,
        )) {
            builder.field(key, { boost });
        }

        for (const reflection of indexEvent.searchResults) {
            if (!reflection.url) {
                continue;
            }

            const boost = this.getBoost(reflection);

            if (boost <= 0) {
                continue;
            }

            let parent = reflection.parent;
            if (parent instanceof ProjectReflection) {
                parent = undefined;
            }

            const row: SearchDocument = {
                kind: reflection.kind,
                name: reflection.name,
                url: reflection.url,
                classes: theme.getReflectionClasses(reflection),
            };

            if (parent) {
                row.parent = parent.getFullName();
            }

            builder.add(
                {
                    name: reflection.name,
                    comment: this.getCommentSearchText(reflection),
                    document: this.getDocumentSearchText(reflection),
                    ...indexEvent.searchFields[rows.length],
                    id: rows.length,
                },
                { boost },
            );
            rows.push(row);
        }

        const index = builder.build();

        const jsonFileName = Path.join(
            event.outputDirectory,
            "assets",
            "search.js",
        );

        const data = {
            rows,
            index,
        };
        await writeFile(
            jsonFileName,
            `window.searchData = "${await compressJson(data)}";`,
        );

        if (
            this.unusedGroupBoosts.size &&
            this.application.options.isSet("searchGroupBoosts")
        ) {
            this.application.logger.warn(
                this.application.i18n.not_all_search_group_boosts_used_0(
                    Array.from(this.unusedGroupBoosts).join("\n\t"),
                ),
            );
        }

        if (
            this.unusedCatBoosts.size &&
            this.application.options.isSet("searchCategoryBoosts")
        ) {
            this.application.logger.warn(
                this.application.i18n.not_all_search_category_boosts_used_0(
                    Array.from(this.unusedCatBoosts).join("\n\t"),
                ),
            );
        }
    }

    private getBoost(refl: DeclarationReflection | DocumentReflection): number {
        let boost = refl.relevanceBoost ?? 1;

        for (const group of GroupPlugin.getGroups(
            refl,
            this.groupReferencesByType,
            this.application.internationalization,
        )) {
            boost *= this.searchGroupBoosts[group] ?? 1;
            this.unusedGroupBoosts.delete(group);
        }

        for (const cat of CategoryPlugin.getCategories(refl)) {
            boost *= this.searchCategoryBoosts[cat] ?? 1;
            this.unusedCatBoosts.delete(cat);
        }

        return boost;
    }

    private getCommentSearchText(reflection: Reflection) {
        if (!this.searchComments) return;

        const comments: Comment[] = [];
        if (reflection.comment) comments.push(reflection.comment);
        if (reflection.isDeclaration()) {
            reflection.signatures?.forEach(
                (s) => s.comment && comments.push(s.comment),
            );
            if (reflection.getSignature?.comment) {
                comments.push(reflection.getSignature.comment);
            }
            if (reflection.setSignature?.comment) {
                comments.push(reflection.setSignature.comment);
            }
        }

        if (!comments.length) {
            return;
        }

        return comments
            .flatMap((c) => {
                return [...c.summary, ...c.blockTags.flatMap((t) => t.content)];
            })
            .map((part) => part.text)
            .join("\n");
    }

    private getDocumentSearchText(reflection: Reflection) {
        if (!this.searchDocuments) return;

        if (reflection.isDocument()) {
            return reflection.content.flatMap((c) => c.text).join("\n");
        }
    }
}
