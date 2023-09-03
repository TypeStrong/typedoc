import * as Path from "path";
import { Builder, trimmer } from "lunr";

import {
    Comment,
    DeclarationReflection,
    ProjectReflection,
} from "../../models";
import { Component, RendererComponent } from "../components";
import { IndexEvent, RendererEvent } from "../events";
import { Option, writeFileSync } from "../../utils";
import { DefaultTheme } from "../themes/default/DefaultTheme";

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
@Component({ name: "javascript-index" })
export class JavascriptIndexPlugin extends RendererComponent {
    @Option("searchInComments")
    accessor searchComments!: boolean;

    /**
     * Create a new JavascriptIndexPlugin instance.
     */
    override initialize() {
        this.listenTo(this.owner, RendererEvent.BEGIN, this.onRendererBegin);
    }

    /**
     * Triggered after a document has been rendered, just before it is written to disc.
     *
     * @param event  An event object describing the current render operation.
     */
    private onRendererBegin(event: RendererEvent) {
        if (!(this.owner.theme instanceof DefaultTheme)) {
            return;
        }
        if (event.isDefaultPrevented) {
            return;
        }

        const rows: SearchDocument[] = [];

        const initialSearchResults = Object.values(
            event.project.reflections,
        ).filter((refl) => {
            return (
                refl instanceof DeclarationReflection &&
                refl.url &&
                refl.name &&
                !refl.flags.isExternal
            );
        }) as DeclarationReflection[];

        const indexEvent = new IndexEvent(
            IndexEvent.PREPARE_INDEX,
            initialSearchResults,
        );

        this.owner.trigger(indexEvent);

        if (indexEvent.isDefaultPrevented) {
            return;
        }

        const builder = new Builder();
        builder.pipeline.add(trimmer);

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

            const boost = reflection.relevanceBoost ?? 1;
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
                classes: this.owner.theme.getReflectionClasses(reflection),
            };

            if (parent) {
                row.parent = parent.getFullName();
            }

            builder.add(
                {
                    name: reflection.name,
                    comment: this.getCommentSearchText(reflection),
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

        const jsonData = JSON.stringify({
            rows,
            index,
        });

        writeFileSync(
            jsonFileName,
            `window.searchData = JSON.parse(${JSON.stringify(jsonData)});`,
        );
    }

    private getCommentSearchText(reflection: DeclarationReflection) {
        if (!this.searchComments) return;

        const comments: Comment[] = [];
        if (reflection.comment) comments.push(reflection.comment);
        reflection.signatures?.forEach(
            (s) => s.comment && comments.push(s.comment),
        );
        reflection.getSignature?.comment &&
            comments.push(reflection.getSignature.comment);
        reflection.setSignature?.comment &&
            comments.push(reflection.setSignature.comment);

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
}
