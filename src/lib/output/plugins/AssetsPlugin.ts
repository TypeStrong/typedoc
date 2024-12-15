import { RendererComponent } from "../components.js";
import { RendererEvent } from "../events.js";
import { copySync, readFile, writeFileSync } from "../../utils/fs.js";
import { DefaultTheme } from "../themes/default/DefaultTheme.js";
import { getStyles } from "../../utils/highlighter.js";
import { Option } from "../../utils/index.js";
import { existsSync } from "fs";
import { extname, join } from "path";
import { fileURLToPath } from "url";
import type { Renderer } from "../index.js";

/**
 * A plugin that copies the subdirectory ´assets´ from the current themes
 * source folder to the output directory.
 */
export class AssetsPlugin extends RendererComponent {
    @Option("favicon")
    private accessor favicon!: string;

    @Option("customCss")
    private accessor customCss!: string;

    @Option("customJs")
    private accessor customJs!: string;

    constructor(owner: Renderer) {
        super(owner);
        this.owner.on(RendererEvent.BEGIN, this.onRenderBegin.bind(this));
        this.owner.on(RendererEvent.END, this.onRenderEnd.bind(this));
    }

    getTranslatedStrings() {
        return {
            copy: this.application.i18n.theme_copy(),
            copied: this.application.i18n.theme_copied(),
            normally_hidden: this.application.i18n.theme_normally_hidden(),
            hierarchy_expand: this.application.i18n.theme_hierarchy_expand(),
            hierarchy_collapse:
                this.application.i18n.theme_hierarchy_collapse(),
        };
    }

    private onRenderBegin(event: RendererEvent) {
        const dest = join(event.outputDirectory, "assets");

        if ([".ico", ".png", ".svg"].includes(extname(this.favicon))) {
            copySync(
                this.favicon,
                join(dest, "favicon" + extname(this.favicon)),
            );
        }

        if (this.customCss) {
            if (existsSync(this.customCss)) {
                copySync(this.customCss, join(dest, "custom.css"));
            } else {
                this.application.logger.error(
                    this.application.i18n.custom_css_file_0_does_not_exist(
                        this.customCss,
                    ),
                );
            }
        }

        if (this.customJs) {
            if (existsSync(this.customJs)) {
                copySync(this.customJs, join(dest, "custom.js"));
            } else {
                this.application.logger.error(
                    this.application.i18n.custom_js_file_0_does_not_exist(
                        this.customJs,
                    ),
                );
            }
        }
    }

    /**
     * Triggered before the renderer starts rendering a project.
     *
     * @param event  An event object describing the current render operation.
     */
    private onRenderEnd(event: RendererEvent) {
        if (this.owner.theme instanceof DefaultTheme) {
            const src = join(
                fileURLToPath(import.meta.url),
                "../../../../../static",
            );
            const dest = join(event.outputDirectory, "assets");
            copySync(join(src, "style.css"), join(dest, "style.css"));

            const mainJs = readFile(join(src, "main.js"));
            writeFileSync(
                join(dest, "main.js"),
                [
                    '"use strict";',
                    `window.translations=${JSON.stringify(this.getTranslatedStrings())};`,
                    mainJs,
                ].join("\n"),
            );

            writeFileSync(join(dest, "highlight.css"), getStyles());

            const media = join(event.outputDirectory, "media");
            const toCopy = event.project.files.getNameToAbsoluteMap();
            for (const [fileName, absolute] of toCopy.entries()) {
                copySync(absolute, join(media, fileName));
            }
        }
    }
}
