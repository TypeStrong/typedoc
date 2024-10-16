import * as Path from "path";
import { Component, RendererComponent } from "../components";
import { RendererEvent } from "../events";
import { JSX, writeFile } from "../../utils";
import { DefaultTheme } from "../themes/default/DefaultTheme";
import { gzip } from "zlib";
import { promisify } from "util";
import {
    DeclarationReflection,
    ReferenceType,
    ReflectionKind,
    type Reflection,
} from "../../models";
import { UrlMapping } from "../models/UrlMapping";

const gzipP = promisify(gzip);

export interface HierarchyElement {
    html: string;
    text: string;
    path: string;
    kind: ReflectionKind;
    parents?: ({ path: string } | { html: string; text: string })[];
    children?: ({ path: string } | { html: string; text: string })[];
}

@Component({ name: "hierarchy" })
export class HierarchyPlugin extends RendererComponent {
    override initialize() {
        this.owner.on(RendererEvent.BEGIN, this.onRendererBegin.bind(this));
    }

    private onRendererBegin(_event: RendererEvent) {
        if (!(this.owner.theme instanceof DefaultTheme)) {
            return;
        }

        this.owner.preRenderAsyncJobs.push((event) =>
            this.buildHierarchy(event),
        );
    }

    private async buildHierarchy(event: RendererEvent) {
        const theme = this.owner.theme as DefaultTheme;

        const [_, pageEvent] = event.createPageEvent<Reflection>(
            new UrlMapping<Reflection>(
                "assets/hierarchy.js",
                event.project,
                () => "",
            ),
        );

        const context = theme.getRenderContext(pageEvent);

        const hierarchy = (
            event.project.getReflectionsByKind(
                ReflectionKind.ClassOrInterface,
            ) as DeclarationReflection[]
        )
            .filter(
                (reflection) =>
                    reflection.extendedTypes?.length ||
                    reflection.extendedBy?.length,
            )
            .map((reflection) => ({
                html: JSX.renderElement(
                    context.type(
                        ReferenceType.createResolvedReference(
                            reflection.name,
                            reflection,
                            reflection.project,
                        ),
                    ),
                ),
                // Full name should be safe here, since this list only includes classes/interfaces.
                text: reflection.getFullName(),
                path: reflection.url!,
                kind: reflection.kind,
                parents: reflection.extendedTypes?.map((type) =>
                    !(type instanceof ReferenceType) ||
                    !(type.reflection instanceof DeclarationReflection)
                        ? {
                              html: JSX.renderElement(context.type(type)),
                              text: type.toString(),
                          }
                        : { path: type.reflection.url! },
                ),
                children: reflection.extendedBy?.map((type) =>
                    !(type instanceof ReferenceType) ||
                    !(type.reflection instanceof DeclarationReflection)
                        ? {
                              html: JSX.renderElement(context.type(type)),
                              text: type.toString(),
                          }
                        : { path: type.reflection.url! },
                ),
            }));

        if (!hierarchy.length) return;

        const hierarchyJs = Path.join(
            event.outputDirectory,
            "assets",
            "hierarchy.js",
        );

        const gz = await gzipP(Buffer.from(JSON.stringify(hierarchy)));

        await writeFile(
            hierarchyJs,
            `window.hierarchyData = "data:application/octet-stream;base64,${gz.toString(
                "base64",
            )}"`,
        );
    }
}
