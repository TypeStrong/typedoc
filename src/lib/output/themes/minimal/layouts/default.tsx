import { PageEvent } from "../../../events";
import { readFileSync } from "fs";
import { resolve } from "path";
import { Reflection } from "../../../../models";
import { MinimalThemeRenderContext } from "../MinimalTheme";
import { createElement, Raw } from "../../../../utils";
const inlineCss = readFileSync(resolve(__dirname, "../../bin/minimal/assets/css/main.css"), "utf8");
const inlineJs = readFileSync(resolve(__dirname, "../../bin/minimal/assets/js/main.js"), "utf8");

export const defaultLayout =
    ({ partials, markdown }: MinimalThemeRenderContext) =>
    (props: PageEvent<Reflection>) =>
        (
            <>
                <html class="minimal no-js">
                    <head>
                        <meta charSet="utf-8" />
                        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                        <title>
                            {props.model.name} | {props.project.name}
                        </title>
                        <meta name="description" content={"Documentation for " + props.project.name} />
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <Raw html={`<style type="text/css">${inlineCss}</style>`} />
                    </head>
                    <body>
                        {partials.header(props)}

                        <nav class="tsd-navigation secondary">
                            <ul>{props.toc?.children?.map((item) => partials.toc(item))}</ul>
                        </nav>

                        <div class="container container-main">
                            <div class="content-wrap">
                                {props.model.isProject() && !!props.model.readme && (
                                    <div class="tsd-panel tsd-typography">
                                        <div>
                                            <Raw html={markdown(props.model.readme)} />
                                        </div>
                                    </div>
                                )}
                                <div>{props.template(props)}</div>
                                {partials.footer(props)}
                            </div>
                        </div>
                        <Raw html={`<script type="text/javascript">${inlineJs}</script>`} />

                        {partials.analytics(props)}
                    </body>
                </html>
            </>
        );
