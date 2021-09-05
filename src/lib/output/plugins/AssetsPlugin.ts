import * as Path from "path";

import { Component, RendererComponent } from "../components";
import { RendererEvent } from "../events";
import { copySync, writeFileSync } from "../../utils/fs";
import { DefaultTheme } from "../themes/default/DefaultTheme";
import { getStyles } from "../../utils/highlighter";

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
            [RendererEvent.END]: this.onRenderEnd,
        });
    }

    /**
     * Triggered before the renderer starts rendering a project.
     *
     * @param event  An event object describing the current render operation.
     */
    private onRenderEnd(event: RendererEvent) {
        if (this.owner.theme instanceof DefaultTheme) {
            const src = Path.join(__dirname, "..", "..", "..", "..", "static");
            const dest = Path.join(event.outputDirectory, "assets");
            copySync(src, dest);

            writeFileSync(Path.join(dest, "highlight.css"), getStyles());
        }
    }
}
