import Path from "path";
import { Component, RendererComponent } from "../components.js";
import { RendererEvent } from "../events.js";
import { DefaultTheme } from "../themes/default/DefaultTheme.js";
import { Option, writeFile } from "../../utils/index.js";
import html from "../../utils/html.cjs";

@Component({ name: "sitemap" })
export class SitemapPlugin extends RendererComponent {
    @Option("sitemapBaseUrl")
    accessor sitemapBaseUrl!: string;

    override initialize() {
        this.listenTo(this.owner, RendererEvent.BEGIN, this.onRendererBegin);
    }

    private onRendererBegin(event: RendererEvent) {
        if (!(this.owner.theme instanceof DefaultTheme)) {
            return;
        }
        if (event.isDefaultPrevented || !this.sitemapBaseUrl) {
            return;
        }

        this.owner.preRenderAsyncJobs.push((event) => this.buildSitemap(event));
    }

    private async buildSitemap(event: RendererEvent) {
        // cSpell:words lastmod urlset
        const sitemapXml = Path.join(event.outputDirectory, "sitemap.xml");
        const lastmod = new Date(this.owner.renderStartTime).toISOString();

        const urls: XmlElementData[] =
            event.urls?.map((url) => {
                return {
                    tag: "url",
                    children: [
                        {
                            tag: "loc",
                            children: new URL(
                                url.url,
                                this.sitemapBaseUrl,
                            ).toString(),
                        },
                        {
                            tag: "lastmod",
                            children: lastmod,
                        },
                    ],
                };
            }) ?? [];

        const sitemap =
            `<?xml version="1.0" encoding="UTF-8"?>\n` +
            stringifyXml({
                tag: "urlset",
                attr: { xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9" },
                children: urls,
            }) +
            "\n";

        await writeFile(sitemapXml, sitemap);
    }
}

interface XmlElementData {
    attr?: Record<string, string>;
    tag: string;
    children: XmlElementData[] | string;
}

function stringifyXml(xml: XmlElementData, indent = 0) {
    const parts = ["\t".repeat(indent), "<", xml.tag];

    for (const [key, val] of Object.entries(xml.attr || {})) {
        parts.push(" ", key, '="', html.escapeHtml(val), '"');
    }

    parts.push(">");

    if (typeof xml.children === "string") {
        parts.push(html.escapeHtml(xml.children));
    } else {
        for (const child of xml.children) {
            parts.push("\n");
            parts.push(stringifyXml(child, indent + 1));
        }
        parts.push("\n", "\t".repeat(indent));
    }

    parts.push("</", xml.tag, ">");

    return parts.join("");
}
