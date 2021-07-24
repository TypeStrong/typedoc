import { relativeURL, __partials__, IfCond, IfNotCond } from "../../lib";
import * as React from "react";
import { PageEvent } from "../../../../events";
export const defaultLayout = (props: PageEvent) => (
    <>
        <html className="default no-js">
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <title>
                    <IfCond cond={props.model.name === props.project.name}>{props.project.name}</IfCond>
                    <IfNotCond cond={props.model.name === props.project.name}>
                        {props.model.name} | {props.project.name}
                    </IfNotCond>
                </title>
                <meta name="description" content={"Documentation for " + props.project.name} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />

                <link rel="stylesheet" href={relativeURL("assets/css/main.css")} />
                <script async={true} src={relativeURL("assets/js/search.js")} id="search-script"></script>
            </head>
            <body>
                {__partials__.header(props)}

                <div className="container container-main">
                    <div className="row">
                        <div className="col-8 col-content">{props.contents}</div>
                        <div className="col-4 col-menu menu-sticky-wrap menu-highlight">
                            <nav className="tsd-navigation primary">
                                <ul>
                                    {props.navigation?.children?.map((item, i) => (
                                        <> {__partials__.navigation(item)}</>
                                    ))}{" "}
                                </ul>
                            </nav>

                            <nav className="tsd-navigation secondary menu-sticky">
                                <ul className="before-current">
                                    {props.toc?.children?.map((item, i) => (
                                        <> {__partials__.tocRoot(item)}</>
                                    ))}{" "}
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>

                {__partials__.footer(props)}

                <div className="overlay"></div>
                <script src={relativeURL("assets/js/main.js")}></script>

                {__partials__.analytics(props)}
            </body>
        </html>
    </>
);
