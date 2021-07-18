import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import React from "react";
export const component = (props) => (
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
                <style type="text/css">{props.CSS}</style>
            </head>
            <body>
                {__partials__.header(props)}

                <nav className="tsd-navigation secondary">
                    <ul>
                        {props.toc.children.map((item, i) => (
                            <> {__partials__.toc(item)}</>
                        ))}{" "}
                    </ul>
                </nav>

                <div className="container container-main">
                    <div className="content-wrap">
                        {!!props.model.readme && (
                            <>
                                {" "}
                                <div className="tsd-panel tsd-typography">
                                    <Markdown>{props.model.readme}</Markdown>
                                </div>
                            </>
                        )}
                        {props.contents}
                        {__partials__.footer(props)}
                    </div>
                </div>

                <script type="text/javascript">{props.JS}</script>

                {__partials__.analytics(props)}
            </body>
        </html>
    </>
);
