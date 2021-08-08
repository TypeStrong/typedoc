import * as Path from "path";

import { Component, RendererComponent } from "../components";
import { RendererEvent } from "../events";
import { copySync } from "../../utils/fs";

/**
 * A plugin that copies the subdirectory ´assets´ from the current themes
 * source folder to the output directory.
 */
@Component({ name: "assets" })
export class AssetsPlugin extends RendererComponent {
    /**
     * Create a new AssetsPlugin instance.
     */
    override initialize() {
        this.listenTo(this.owner, {
            [RendererEvent.BEGIN]: this.onRendererBegin,
        });
    }

    /**
     * Triggered before the renderer starts rendering a project.
     *
     * @param event  An event object describing the current render operation.
     */
    private onRendererBegin(event: RendererEvent) {
        const src = Path.join(
            __dirname,
            "..",
            "themes",
            "bin",
            "default",
            "assets"
        );
        const dest = Path.join(event.outputDirectory, "assets");
        copySync(src, dest);
        // TODO: Copy from active theme directory?
    }
}
