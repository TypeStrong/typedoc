import { RendererComponent } from "../components.js";
import { RendererEvent } from "../events.js";
import { DefaultTheme } from "../themes/default/DefaultTheme.js";
import { join } from "path";
import { JSX } from "#utils";
import type { Renderer } from "../index.js";

const ICONS_JS = `
(function() {
    addIcons();
    function addIcons() {
        if (document.readyState === "loading") return document.addEventListener("DOMContentLoaded", addIcons);
        const svg = document.body.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
        svg.innerHTML = \`SVG_HTML\`;
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
export class IconsPlugin extends RendererComponent {
    iconHtml?: string;

    constructor(owner: Renderer) {
        super(owner);
        this.owner.on(RendererEvent.END, this.onRenderEnd.bind(this));
    }

    private onRenderEnd(event: RendererEvent) {
        if (!(this.owner.theme instanceof DefaultTheme)) {
            return;
        }
        const children: JSX.Element[] = [];
        const icons = this.owner.theme.icons;

        for (const [name, icon] of Object.entries(icons)) {
            children.push(
                <g id={`icon-${name}`} class="tsd-no-select">
                    {icon.call(icons).children}
                </g>,
            );
        }

        const svg = JSX.renderElement(<svg xmlns="http://www.w3.org/2000/svg">{children}</svg>);
        const svgPath = join(event.outputDirectory, "assets/icons.svg");
        this.application.fs.writeFile(svgPath, svg);

        const js = ICONS_JS.replace("SVG_HTML", JSX.renderElement(<>{children}</>).replaceAll("`", "\\`"));
        const jsPath = join(event.outputDirectory, "assets/icons.js");
        this.application.fs.writeFile(jsPath, js);
    }
}
