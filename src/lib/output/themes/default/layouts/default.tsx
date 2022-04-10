import type { Reflection } from "../../../../models";
import { JSX, Raw } from "../../../../utils";
import type { PageEvent } from "../../../events";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

export const defaultLayout = (context: DefaultThemeRenderContext, props: PageEvent<Reflection>) => (
    <html class="default">
        <head>
            <meta charSet="utf-8" />
            {context.hook("head.begin")}
            <meta http-equiv="x-ua-compatible" content="IE=edge" />
            <title>
                {props.model.name === props.project.name
                    ? props.project.name
                    : `${props.model.name} | ${props.project.name}`}
            </title>
            <meta name="description" content={"Documentation for " + props.project.name} />
            <meta name="viewport" content="width=device-width, initial-scale=1" />

            <link rel="stylesheet" href={context.relativeURL("assets/style.css")} />
            <link rel="stylesheet" href={context.relativeURL("assets/highlight.css")} />
            {context.options.getValue("customCss") && (
                <link rel="stylesheet" href={context.relativeURL("assets/custom.css")} />
            )}
            <script async src={context.relativeURL("assets/search.js")} id="search-script"></script>
            {context.hook("head.end")}
        </head>
        <body>
            {context.hook("body.begin")}
            <script>
                <Raw html='document.body.classList.add(localStorage.getItem("tsd-theme") || "os")' />
            </script>
            {context.header(props)}

            <div class="container container-main">
                <div class="row">
                    <div class="col-8 col-content">
                        {context.hook("content.begin")}
                        {props.template(props)}
                        {context.hook("content.end")}
                    </div>
                    <div class="col-4 col-menu menu-sticky-wrap menu-highlight">
                        {context.hook("navigation.begin")}
                        {context.navigation(props)}
                        {context.hook("navigation.end")}
                    </div>
                </div>
            </div>

            {context.footer(props)}

            <div class="overlay"></div>
            <script src={context.relativeURL("assets/main.js")}></script>

            {context.analytics()}
            {context.hook("body.end")}
        </body>
    </html>
);
