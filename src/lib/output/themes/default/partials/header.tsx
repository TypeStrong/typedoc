import { With, relativeURL, __partials__, Compact, hasTypeParameters } from "../../lib";
import * as React from "react";
import { PageEvent } from "../../../events";
import { Reflection } from "../../../../models";
export const header = (props: PageEvent<Reflection>) => (
    <>
        <header>
            <div className="tsd-page-toolbar">
                <div className="container">
                    <div className="table-wrap">
                        <div
                            className="table-cell"
                            id="tsd-search"
                            data-index={relativeURL("assets/js/search.json")}
                            data-base={relativeURL("./")}
                        >
                            <div className="field">
                                <label htmlFor="tsd-search-field" className="tsd-widget search no-caption">
                                    Search
                                </label>
                                <input id="tsd-search-field" type="text" />
                            </div>

                            <ul className="results">
                                <li className="state loading">Preparing search index...</li>
                                <li className="state failure">The search index is not available</li>
                            </ul>

                            <a href={relativeURL("index.html")} className="title">
                                {props.project.name}
                            </a>
                        </div>

                        <div className="table-cell" id="tsd-widgets">
                            <div id="tsd-filter">
                                <a href="#" className="tsd-widget options no-caption" data-toggle="options">
                                    Options
                                </a>
                                <div className="tsd-filter-group">
                                    <div className="tsd-select" id="tsd-filter-visibility">
                                        <span className="tsd-select-label">All</span>
                                        <ul className="tsd-select-list">
                                            <li data-value="public">Public</li>
                                            <li data-value="protected">Public/Protected</li>
                                            <li data-value="private" className="selected">
                                                All
                                            </li>
                                        </ul>
                                    </div>{" "}
                                    <input type="checkbox" id="tsd-filter-inherited" checked={true} />
                                    <label className="tsd-widget" htmlFor="tsd-filter-inherited">
                                        Inherited
                                    </label>
                                    {!props.settings.excludeExternals && (
                                        <>
                                            {" "}
                                            <input type="checkbox" id="tsd-filter-externals" checked={true} />
                                            <label className="tsd-widget" htmlFor="tsd-filter-externals">
                                                Externals
                                            </label>
                                        </>
                                    )}
                                </div>
                            </div>

                            <a href="#" className="tsd-widget menu no-caption" data-toggle="menu">
                                Menu
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="tsd-page-title">
                <div className="container">
                    {!!props.model.parent && (
                        <>

                            {/* Don't show breadcrumbs on main project page, it is the root page. !*/}
                            <ul className="tsd-breadcrumb">
                                {With(props.model, (props) => (
                                    <>{__partials__.breadcrumb(props)}</>
                                ))}
                            </ul>
                        </>
                    )}
                    <h1>
                        <Compact>
                            {props.model.kindString !== 'Project' &&
                                `${props.model.kindString ?? ''} `
                            }
                            {props.model.name}
                            {hasTypeParameters(props.model) && (
                                <>
                                    {"<"}
                                    {props.model.typeParameters.map((item, i) => (
                                        <>
                                            {i > 0 && ", "}
                                            {item.name}
                                        </>
                                    ))}
                                    {">"}
                                </>
                            )}
                        </Compact>
                    </h1>
                </div>
            </div>
        </header>
    </>
);
