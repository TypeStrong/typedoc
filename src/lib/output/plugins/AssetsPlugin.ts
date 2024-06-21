import { Component, RendererComponent } from "../components";
import { RendererEvent } from "../events";
import { copySync, readFile, writeFileSync } from "../../utils/fs";
import { DefaultTheme } from "../themes/default/DefaultTheme";
import { getStyles } from "../../utils/highlighter";
import { Option } from "../../utils";
import { existsSync } from "fs";
import { join } from "path";

/**
 * A plugin that copies the subdirectory ´assets´ from the current themes
 * source folder to the output directory.
 */
@Component({ name: "assets" })
export class AssetsPlugin extends RendererComponent {
    /** @internal */
    @Option("customCss")
    accessor customCss!: string;

    getTranslatedStrings() {
        return {
            copy: this.application.i18n.theme_copy(),
            copied: this.application.i18n.theme_copied(),
            normally_hidden: this.application.i18n.theme_normally_hidden(),
        };
    }

    /**
     * Create a new AssetsPlugin instance.
     */
    override initialize() {
        this.owner.on(RendererEvent.BEGIN, this.onRenderBegin.bind(this));
        this.owner.on(RendererEvent.END, this.onRenderEnd.bind(this));
    }

    private onRenderBegin(event: RendererEvent) {
        const dest = join(event.outputDirectory, "assets");

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
    }

    /**
     * Triggered before the renderer starts rendering a project.
     *
     * @param event  An event object describing the current render operation.
     */
    private onRenderEnd(event: RendererEvent) {
        if (this.owner.theme instanceof DefaultTheme) {
            const src = join(__dirname, "..", "..", "..", "..", "static");
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
