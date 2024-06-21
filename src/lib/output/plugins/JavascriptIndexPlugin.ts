import * as Path from "path";
import { Builder, trimmer } from "lunr";

import {
    type Comment,
    DeclarationReflection,
    DocumentReflection,
    ProjectReflection,
    type Reflection,
} from "../../models";
import { Component, RendererComponent } from "../components";
import { IndexEvent, RendererEvent } from "../events";
import { Option, writeFile } from "../../utils";
import { DefaultTheme } from "../themes/default/DefaultTheme";
import { gzip } from "zlib";
import { promisify } from "util";

const gzipP = promisify(gzip);

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
    private accessor searchComments!: boolean;

    @Option("searchInDocuments")
    private accessor searchDocuments!: boolean;

    override initialize() {
        this.owner.on(RendererEvent.BEGIN, this.onRendererBegin.bind(this));
    }

    private onRendererBegin(_event: RendererEvent) {
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

        const jsonData = JSON.stringify({
            rows,
            index,
        });
        const data = await gzipP(Buffer.from(jsonData));

        await writeFile(
            jsonFileName,
            `window.searchData = "data:application/octet-stream;base64,${data.toString(
                "base64",
            )}";`,
        );
    }

    private getCommentSearchText(reflection: Reflection) {
        if (!this.searchComments) return;

        const comments: Comment[] = [];
        if (reflection.comment) comments.push(reflection.comment);
        if (reflection.isDeclaration()) {
            reflection.signatures?.forEach(
                (s) => s.comment && comments.push(s.comment),
            );
            reflection.getSignature?.comment &&
                comments.push(reflection.getSignature.comment);
            reflection.setSignature?.comment &&
                comments.push(reflection.setSignature.comment);
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
