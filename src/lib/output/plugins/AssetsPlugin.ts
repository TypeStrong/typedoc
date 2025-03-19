import { RendererComponent } from "../components.js";
import { RendererEvent } from "../events.js";
import { DefaultTheme } from "../themes/default/DefaultTheme.js";
import { getStyles } from "../../utils/highlighter.js";
import { type EnumKeys, getEnumKeys, i18n, type NormalizedPath } from "#utils";
import { existsSync } from "fs";
import { extname, join } from "path";
import { fileURLToPath } from "url";
import type { Renderer } from "../index.js";
import { ReflectionKind } from "../../models/index.js";
import { Option } from "../../utils/index.js";

/**
 * A plugin that copies the subdirectory ´assets´ from the current themes
 * source folder to the output directory.
 */
export class AssetsPlugin extends RendererComponent {
    @Option("favicon")
    private accessor favicon!: NormalizedPath;

    @Option("customCss")
    private accessor customCss!: NormalizedPath;

    @Option("customJs")
    private accessor customJs!: NormalizedPath;

    constructor(owner: Renderer) {
        super(owner);
        this.owner.on(RendererEvent.BEGIN, this.onRenderBegin.bind(this));
        this.owner.on(RendererEvent.END, this.onRenderEnd.bind(this));
    }

    getTranslatedStrings() {
        const translations: Record<string, string> = {
            copy: i18n.theme_copy(),
            copied: i18n.theme_copied(),
            normally_hidden: i18n.theme_normally_hidden(),
            hierarchy_expand: i18n.theme_hierarchy_expand(),
            hierarchy_collapse: i18n.theme_hierarchy_collapse(),
            folder: i18n.theme_folder(),

            search_index_not_available: i18n.theme_search_index_not_available(),
            search_no_results_found_for_0: i18n.theme_search_no_results_found_for_0(
                "{0}",
            ),
        };

        for (const key of getEnumKeys(ReflectionKind)) {
            const kind = ReflectionKind[key as EnumKeys<typeof ReflectionKind>];
            translations[`kind_${kind}`] = ReflectionKind.singularString(kind);
        }

        return translations;
    }

    private onRenderBegin(event: RendererEvent) {
        const dest = join(event.outputDirectory, "assets");
        const fs = this.application.fs;

        if (
            !/^https?:\/\//i.test(this.favicon) &&
            [".ico", ".png", ".svg"].includes(extname(this.favicon))
        ) {
            fs.copy(
                this.favicon,
                join(dest, "favicon" + extname(this.favicon)),
            );
        }

        if (this.customCss) {
            this.application.watchFile(this.customCss);
            if (existsSync(this.customCss)) {
                fs.copy(this.customCss, join(dest, "custom.css"));
            } else {
                this.application.logger.error(
                    i18n.custom_css_file_0_does_not_exist(
                        this.customCss,
                    ),
                );
            }
        }

        if (this.customJs) {
            this.application.watchFile(this.customJs);
            if (existsSync(this.customJs)) {
                fs.copy(this.customJs, join(dest, "custom.js"));
            } else {
                this.application.logger.error(
                    i18n.custom_js_file_0_does_not_exist(
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
        const fs = this.application.fs;

        if (this.owner.theme instanceof DefaultTheme) {
            const src = join(
                fileURLToPath(import.meta.url),
                "../../../../../static",
            );
            const dest = join(event.outputDirectory, "assets");
            fs.copy(join(src, "style.css"), join(dest, "style.css"));

            const mainJs = fs.readFile(join(src, "main.js"));
            fs.writeFile(
                join(dest, "main.js"),
                [
                    '"use strict";',
                    `window.translations=${JSON.stringify(this.getTranslatedStrings())};`,
                    mainJs,
                ].join("\n"),
            );

            fs.writeFile(join(dest, "highlight.css"), getStyles());

            const media = join(event.outputDirectory, "media");
            const toCopy = event.project.files.getNameToAbsoluteMap();
            for (const [fileName, absolute] of toCopy.entries()) {
                fs.copy(absolute, join(media, fileName));
            }
        }
    }
}
