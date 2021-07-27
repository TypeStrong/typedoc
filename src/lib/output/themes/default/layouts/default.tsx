import { relativeURL, __partials__ } from "../../lib";
import * as React from "react";
import { PageEvent } from "../../../events";
import { Reflection } from "../../../../models";
export const defaultLayout = (props: PageEvent<Reflection>) => (
    <>
        <html className="default no-js">
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <title>
                    {props.model.name === props.project.name ? props.project.name : <>{props.model.name} | {props.project.name}</>}
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
                        <div className="col-8 col-content" dangerouslySetInnerHTML={{__html: props.contents!}}></div>
                        <div className="col-4 col-menu menu-sticky-wrap menu-highlight">
                            <nav className="tsd-navigation primary">
                                <ul>
                                    {props.navigation?.children?.map((item) => (
                                        <> {__partials__.navigation(item)}</>
                                    ))}{" "}
                                </ul>
                            </nav>

                            <nav className="tsd-navigation secondary menu-sticky">
                                {(() => {
                                    const children = props.toc?.children ?? [];
                                    let indexOfCurrent = children.findIndex(c => c.isInPath);
                                    // If none are isInPath, make sure all render within "before" block
                                    if(indexOfCurrent === -1) indexOfCurrent = children.length;
                                    const childrenBefore = children.slice(0, indexOfCurrent);
                                    const childInPath = children[indexOfCurrent];
                                    const childrenAfter = children.slice(indexOfCurrent + 1);
                                    return <>
                                        <ul className="before-current">
                                            {childrenBefore.map((item) => __partials__.tocRoot(item))}
                                        </ul>
                                        {childInPath && <>
                                            <ul className="current">
                                                {__partials__.tocRoot(childInPath)}
                                            </ul>
                                            <ul className="after-current">
                                                {childrenAfter.map((item) => __partials__.tocRoot(item))}
                                            </ul>
                                        </>}
                                    </>;
                                })()}
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
