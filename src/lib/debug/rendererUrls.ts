/* eslint-disable no-console */
import { join } from "node:path";
import type { Application } from "../application.js";
import { Reflection, ReflectionKind, type SomeReflection } from "../models/index.js";
import type { SerializerComponent } from "../serialization/components.js";
import type { JSONOutput } from "../serialization/index.js";
import type { Router } from "../output/index.js";

function makeSerializer(router: Router) {
    const serializer: SerializerComponent<SomeReflection> = {
        priority: 0,
        supports(x) {
            return x instanceof Reflection;
        },
        toObject(item, obj: any) {
            if (router.hasUrl(item)) {
                obj.url = router.getFullUrl(item);
                obj.hasOwnDocument = router.hasOwnDocument(item);
            }
            delete obj.sources;
            delete obj.groups;
            delete obj.categories;
            delete obj.readme;
            delete obj.content;
            obj.kind = ReflectionKind[obj.kind];
            delete obj.flags;
            delete obj.defaultValue;
            delete obj.symbolIdMap;
            delete obj.files;
            delete obj.packageName;
            delete obj.variant;
            delete obj.extendedTypes;
            delete obj.inheritedFrom;
            if (!["reflection", "reference"].includes(obj.type?.type)) {
                delete obj.type;
            }

            if (obj.comment) {
                obj.comment.summary = obj.comment.summary.filter(
                    (part: JSONOutput.CommentDisplayPart) => part.kind === "inline-tag",
                );
                obj.comment.blockTags = obj.comment.blockTags?.filter(
                    (tag: JSONOutput.CommentTag) => {
                        tag.content = tag.content.filter(
                            (part) => part.kind === "inline-tag",
                        );
                        return tag.content.length;
                    },
                );

                if (
                    !obj.comment.summary.length &&
                    !obj.comment.blockTags?.length &&
                    !obj.comment.modifierTags
                ) {
                    delete obj.comment;
                }
            }

            return obj;
        },
    };

    return serializer;
}

export function debugRendererUrls(
    app: Application,
    { json = false, logs = false } = { logs: true },
) {
    app.renderer.postRenderAsyncJobs.push(async (evt) => {
        const router = app.renderer.router!;

        if (json) {
            const serializer = makeSerializer(router);
            app.serializer.addSerializer(serializer);
            await app.generateJson(
                evt.project,
                join(evt.outputDirectory, "url_debug.json"),
            );
            app.serializer.removeSerializer(serializer);
        }

        if (logs) {
            for (const id in evt.project.reflections) {
                const refl = evt.project.reflections[id];
                console.log(
                    refl.id,
                    refl.getFullName(),
                    router.hasUrl(refl) ? router.getFullUrl(refl) : undefined,
                );
            }
        }
    });
}

export function load(app: Application) {
    debugRendererUrls(app);
}
