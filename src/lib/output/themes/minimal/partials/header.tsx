import * as React from "react";
import { PageEvent } from "../../../events";
import { Reflection } from "../../../../models";
import { MinimalThemeRenderContext } from "../MinimalTheme";

export const header =
    ({ relativeURL }: MinimalThemeRenderContext) =>
    (props: PageEvent<Reflection>) =>
        (
            <header>
                <div className="tsd-page-toolbar">
                    <div className="container">
                        <div className="table-wrap">
                            <div className="table-cell">
                                <strong>
                                    <a href={relativeURL("index.html")}>{props.project.name}</a>
                                </strong>
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
                                        </div>

                                        <input type="checkbox" id="tsd-filter-inherited" checked={true} />
                                        <label className="tsd-widget" htmlFor="tsd-filter-inherited">
                                            Inherited
                                        </label>

                                        {!props.settings.excludeExternals && (
                                            <>
                                                <input type="checkbox" id="tsd-filter-externals" checked={true} />
                                                <label className="tsd-widget" htmlFor="tsd-filter-externals">
                                                    Externals
                                                </label>
                                            </>
                                        )}
                                        <input type="checkbox" id="tsd-filter-only-exported" />
                                        <label className="tsd-widget" htmlFor="tsd-filter-only-exported">
                                            Only exported
                                        </label>
                                    </div>
                                </div>
                                <a href="#typedoc-main-index" className="tsd-widget menu no-caption">
                                    Menu
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        );
