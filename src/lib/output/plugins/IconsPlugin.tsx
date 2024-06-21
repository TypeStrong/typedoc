import { Component, RendererComponent } from "../components";
import { RendererEvent } from "../events";
import { writeFile } from "../../utils/fs";
import { DefaultTheme } from "../themes/default/DefaultTheme";
import { join } from "path";
import { JSX, renderElement } from "../../utils";

const ICONS_JS = `
(function() {
    addIcons();
    function addIcons() {
        if (document.readyState === "loading") return document.addEventListener("DOMContentLoaded", addIcons);
        const svg = document.body.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
        svg.innerHTML = \`"SVG_HTML"\`;
        svg.style.display = "none";
        if (location.protocol === "file:") updateUseElements();
    }

    function updateUseElements() {
        document.querySelectorAll("use").forEach(el => {
            if (el.getAttribute("href").includes("#icon-")) {
                el.setAttribute("href", el.getAttribute("href").replace(/.*#/, "#"));
            }
        });
    }
})()
`.trim();

/**
 * Plugin which is responsible for creating an icons.js file that embeds the icon SVGs
 * within the page on page load to reduce page sizes.
 */
@Component({ name: "icons" })
export class IconsPlugin extends RendererComponent {
    iconHtml?: string;

    override initialize() {
        this.owner.on(RendererEvent.BEGIN, this.onBeginRender.bind(this));
    }

    private onBeginRender(_event: RendererEvent) {
        if (this.owner.theme instanceof DefaultTheme) {
            this.owner.postRenderAsyncJobs.push((event) => this.onRenderEnd(event));
        }
    }

    private async onRenderEnd(event: RendererEvent) {
        const children: JSX.Element[] = [];
        const icons = (this.owner.theme as DefaultTheme).icons;

        for (const [name, icon] of Object.entries(icons)) {
            children.push(<g id={`icon-${name}`}>{icon.call(icons).children}</g>);
        }

        const svg = renderElement(<svg xmlns="http://www.w3.org/2000/svg">{children}</svg>);
        const js = ICONS_JS.replace("SVG_HTML", renderElement(<>{children}</>).replaceAll("`", "\\`"));

        const svgPath = join(event.outputDirectory, "assets/icons.svg");
        const jsPath = join(event.outputDirectory, "assets/icons.js");

        await Promise.all([writeFile(svgPath, svg), writeFile(jsPath, js)]);
    }
}
