import type { RenderTemplate } from "../../../index.js";
import type { Reflection } from "../../../../models/index.js";
import { JSX, Raw } from "../../../../utils/index.js";
import type { PageEvent } from "../../../events.js";
import { getDisplayName, getHierarchyRoots } from "../../lib.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { extname } from "path";

function favicon(context: DefaultThemeRenderContext) {
    const fav = context.options.getValue("favicon");
    if (!fav) return null;

    switch (extname(fav)) {
        case ".ico":
            return <link rel="icon" href={context.relativeURL("assets/favicon.ico", true)} />;
        case ".png":
            return <link rel="icon" href={context.relativeURL("assets/favicon.png", true)} type="image/png" />;
        case ".svg":
            return <link rel="icon" href={context.relativeURL("assets/favicon.svg", true)} type="image/svg+xml" />;
        default:
            return null;
    }
}

// See #2760
function buildSiteMetadata(context: DefaultThemeRenderContext) {
    try {
        // We have to know where we are hosted in order to generate this block
        const url = new URL(context.options.getValue("hostedBaseUrl"));

        // No point in generating this if we aren't the root page on the site
        if (url.pathname !== "/") {
            return null;
        }

        return (
            <script type="application/ld+json">
                <Raw
                    html={JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        name: context.page.project.name,
                        url: url.toString(),
                    })}
                />
            </script>
        );
    } catch {
        return null;
    }
}

export const defaultLayout = (
    context: DefaultThemeRenderContext,
    template: RenderTemplate<PageEvent<Reflection>>,
    props: PageEvent<Reflection>,
) => (
    <html class="default" lang={context.options.getValue("lang")} data-base={context.relativeURL("./")}>
        <head>
            <meta charset="utf-8" />
            {context.hook("head.begin", context)}
            <meta http-equiv="x-ua-compatible" content="IE=edge" />
            <title>
                {props.model.isProject()
                    ? getDisplayName(props.model)
                    : `${getDisplayName(props.model)} | ${getDisplayName(props.project)}`}
            </title>
            {favicon(context)}
            {props.url === "index.html" && buildSiteMetadata(context)}
            <meta name="description" content={"Documentation for " + props.project.name} />
            <meta name="viewport" content="width=device-width, initial-scale=1" />

            <link rel="stylesheet" href={context.relativeURL("assets/style.css", true)} />
            <link rel="stylesheet" href={context.relativeURL("assets/highlight.css", true)} />
            {context.options.getValue("customCss") && (
                <link rel="stylesheet" href={context.relativeURL("assets/custom.css", true)} />
            )}
            <script defer src={context.relativeURL("assets/main.js", true)}></script>
            {context.options.getValue("customJs") && (
                <script defer src={context.relativeURL("assets/custom.js", true)}></script>
            )}
            <script async src={context.relativeURL("assets/icons.js", true)} id="tsd-icons-script"></script>
            <script async src={context.relativeURL("assets/search.js", true)} id="tsd-search-script"></script>
            <script async src={context.relativeURL("assets/navigation.js", true)} id="tsd-nav-script"></script>
            {!!getHierarchyRoots(props.project).length && (
                <script async src={context.relativeURL("assets/hierarchy.js", true)} id="tsd-hierarchy-script"></script>
            )}
            {context.hook("head.end", context)}
        </head>
        <body>
            {context.hook("body.begin", context)}
            <script>
                <Raw html='document.documentElement.dataset.theme = localStorage.getItem("tsd-theme") || "os";' />
                {/* Hide the entire page for up to 0.5 seconds so that if navigating between pages on a fast */}
                {/* device the navigation pane doesn't appear to flash if it loads just after the page displays. */}
                {/* This could still happen if we're unlucky, but from experimenting with Firefox's throttling */}
                {/* settings, this appears to be a reasonable tradeoff between displaying page content without the */}
                {/* navigation on exceptionally slow connections and not having the navigation obviously repaint. */}
                <Raw html='document.body.style.display="none";' />
                <Raw html='setTimeout(() => app?app.showPage():document.body.style.removeProperty("display"),500)' />
            </script>
            {context.toolbar(props)}

            <div class="container container-main">
                <div class="col-content">
                    {context.hook("content.begin", context)}
                    {context.header(props)}
                    {template(props)}
                    {context.hook("content.end", context)}
                </div>
                <div class="col-sidebar">
                    <div class="page-menu">
                        {context.hook("pageSidebar.begin", context)}
                        {context.pageSidebar(props)}
                        {context.hook("pageSidebar.end", context)}
                    </div>
                    <div class="site-menu">
                        {context.hook("sidebar.begin", context)}
                        {context.sidebar(props)}
                        {context.hook("sidebar.end", context)}
                    </div>
                </div>
            </div>

            {context.footer()}

            <div class="overlay"></div>

            {context.hook("body.end", context)}
        </body>
    </html>
);
