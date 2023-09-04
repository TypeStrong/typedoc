import * as Path from "path";
import { Component, RendererComponent } from "../components";
import { RendererEvent } from "../events";
import { writeFileSync } from "../../utils";
import { DefaultTheme } from "../themes/default/DefaultTheme";
import { gzipSync } from "zlib";

@Component({ name: "navigation-tree" })
export class NavigationPlugin extends RendererComponent {
    override initialize() {
        this.listenTo(this.owner, RendererEvent.BEGIN, this.onRendererBegin);
    }

    private onRendererBegin(event: RendererEvent) {
        if (!(this.owner.theme instanceof DefaultTheme)) {
            return;
        }
        if (event.isDefaultPrevented) {
            return;
        }

        const navigationJs = Path.join(
            event.outputDirectory,
            "assets",
            "navigation.js",
        );

        const nav = this.owner.theme.getNavigation(event.project);
        const gz = gzipSync(Buffer.from(JSON.stringify(nav)));

        writeFileSync(
            navigationJs,
            `window.navigationData = "data:application/octet-stream;base64,${gz.toString(
                "base64",
            )}"`,
        );
    }
}
