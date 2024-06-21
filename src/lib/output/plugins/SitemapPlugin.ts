import Path from "path";
import { Component, RendererComponent } from "../components";
import { RendererEvent } from "../events";
import { DefaultTheme } from "../themes/default/DefaultTheme";
import { writeFile } from "../../utils";
import { escapeHtml } from "../../utils/html";
import { Fragment } from "../../utils/jsx";

@Component({ name: "sitemap" })
export class SitemapPlugin extends RendererComponent {
    private get hostedBaseUrl() {
        const url = this.application.options.getValue("hostedBaseUrl");
        return !url || url.endsWith("/") ? url : url + "/";
    }

    override initialize() {
        this.owner.on(RendererEvent.BEGIN, this.onRendererBegin.bind(this));
    }

    private onRendererBegin(_event: RendererEvent) {
        if (!(this.owner.theme instanceof DefaultTheme)) {
            return;
        }
        if (!this.hostedBaseUrl) {
            return;
        }

        this.owner.hooks.on("head.begin", (context) => {
            if (context.page.url === "index.html") {
                return {
                    tag: "link",
                    props: { rel: "canonical", href: this.hostedBaseUrl },
                    children: [],
                };
            }
            return { tag: Fragment, props: null, children: [] };
        });

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
                                this.hostedBaseUrl,
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
        parts.push(" ", key, '="', escapeHtml(val), '"');
    }

    parts.push(">");

    if (typeof xml.children === "string") {
        parts.push(escapeHtml(xml.children));
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
