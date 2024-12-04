import * as Path from "path";
import { RendererComponent } from "../components.js";
import { RendererEvent } from "../events.js";
import { writeFile } from "../../utils/index.js";
import { DefaultTheme } from "../themes/default/DefaultTheme.js";
import type { Renderer } from "../index.js";
import { compressJson } from "../../utils/compress.js";

export class NavigationPlugin extends RendererComponent {
    constructor(owner: Renderer) {
        super(owner);
        this.owner.on(RendererEvent.BEGIN, this.onRendererBegin.bind(this));
    }

    private onRendererBegin(_event: RendererEvent) {
        if (!(this.owner.theme instanceof DefaultTheme)) {
            return;
        }
        this.owner.preRenderAsyncJobs.push((event) =>
            this.buildNavigationIndex(event),
        );
    }

    private async buildNavigationIndex(event: RendererEvent) {
        const navigationJs = Path.join(
            event.outputDirectory,
            "assets",
            "navigation.js",
        );

        const nav = (this.owner.theme as DefaultTheme).getNavigation(
            event.project,
        );

        await writeFile(
            navigationJs,
            `window.navigationData = "${await compressJson(nav)}"`,
        );
    }
}
