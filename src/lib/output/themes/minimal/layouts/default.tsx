import { isProjectReflection } from "../../lib";
import * as React from "react";
import { PageEvent } from "../../../events";
import { readFileSync } from "fs";
import { resolve } from "path";
import { Reflection } from "../../../../models";
import { MinimalThemeRenderContext } from "../MinimalTheme";
const inlineCss = readFileSync(resolve(__dirname, "../../bin/minimal/assets/css/main.css"), "utf8");
const inlineJs = readFileSync(resolve(__dirname, "../../bin/minimal/assets/js/main.js"), "utf8");

export const defaultLayout =
    ({ partials, Markdown }: MinimalThemeRenderContext) =>
    (props: PageEvent<Reflection>) =>
        (
            <>
                <html className="minimal no-js">
                    <head>
                        <meta charSet="utf-8" />
                        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                        <title>
                            {props.model.name} | {props.project.name}
                        </title>
                        <meta name="description" content={"Documentation for " + props.project.name} />
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <style type="text/css" dangerouslySetInnerHTML={{ __html: inlineCss }}></style>
                    </head>
                    <body>
                        {partials.header(props)}

                        <nav className="tsd-navigation secondary">
                            <ul>{props.toc?.children?.map((item) => partials.toc(item))}</ul>
                        </nav>

                        <div className="container container-main">
                            <div className="content-wrap">
                                {isProjectReflection(props.model) && !!props.model.readme && (
                                    <div className="tsd-panel tsd-typography">
                                        <Markdown>{props.model.readme}</Markdown>
                                    </div>
                                )}
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: props.contents!,
                                    }}
                                ></div>
                                {partials.footer(props)}
                            </div>
                        </div>

                        <script type="text/javascript" dangerouslySetInnerHTML={{ __html: inlineJs }}></script>

                        {partials.analytics(props)}
                    </body>
                </html>
            </>
        );
