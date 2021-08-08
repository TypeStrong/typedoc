import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { PageEvent } from "../../../events";
import { Reflection } from "../../../../models";
import { createElement } from "../../../../utils";

export const defaultLayout = ({ relativeURL, partials }: DefaultThemeRenderContext, props: PageEvent<Reflection>) => (
    <>
        <html class="default no-js">
            <head>
                <meta charSet="utf-8" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <title>
                    {props.model.name === props.project.name ? (
                        props.project.name
                    ) : (
                        <>
                            {props.model.name} | {props.project.name}
                        </>
                    )}
                </title>
                <meta name="description" content={"Documentation for " + props.project.name} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />

                <link rel="stylesheet" href={relativeURL("assets/css/main.css")} />
                <script async src={relativeURL("assets/js/search.js")} id="search-script"></script>
            </head>
            <body>
                {partials.header(props)}

                <div class="container container-main">
                    <div class="row">
                        <div class="col-8 col-content">{props.template(props)}</div>
                        <div class="col-4 col-menu menu-sticky-wrap menu-highlight">
                            <nav class="tsd-navigation primary">
                                <ul>
                                    {props.navigation?.children?.map((item) => (
                                        <> {partials.navigation(item)}</>
                                    ))}
                                </ul>
                            </nav>

                            <nav class="tsd-navigation secondary menu-sticky">
                                {(() => {
                                    const children = props.toc?.children ?? [];
                                    let indexOfCurrent = children.findIndex((c) => c.isInPath);
                                    // If none are isInPath, make sure all render within "before" block
                                    if (indexOfCurrent === -1) indexOfCurrent = children.length;
                                    const childrenBefore = children.slice(0, indexOfCurrent);
                                    const childInPath = children[indexOfCurrent];
                                    const childrenAfter = children.slice(indexOfCurrent + 1);
                                    return (
                                        <>
                                            <ul class="before-current">
                                                {childrenBefore.map((item) => partials.tocRoot(item))}
                                            </ul>
                                            {childInPath && (
                                                <>
                                                    <ul class="current">{partials.tocRoot(childInPath)}</ul>
                                                    <ul class="after-current">
                                                        {childrenAfter.map((item) => partials.tocRoot(item))}
                                                    </ul>
                                                </>
                                            )}
                                        </>
                                    );
                                })()}
                            </nav>
                        </div>
                    </div>
                </div>

                {partials.footer(props)}

                <div class="overlay"></div>
                <script src={relativeURL("assets/js/main.js")}></script>

                {partials.analytics(props)}
            </body>
        </html>
    </>
);
