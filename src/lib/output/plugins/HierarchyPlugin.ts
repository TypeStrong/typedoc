import * as Path from "path";
import { Component, RendererComponent } from "../components";
import { RendererEvent } from "../events";
import { writeFile } from "../../utils";
import { DefaultTheme } from "../themes/default/DefaultTheme";
import { gzip } from "zlib";
import { promisify } from "util";
import { type Reflection } from "../../models";
import { UrlMapping } from "..";

const gzipP = promisify(gzip);

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

        const hierarchy = context.getHierarchy();

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
