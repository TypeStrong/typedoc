import type { Reflection } from "../../../../models";
import { JSX } from "../../../../utils";
import type { PageEvent } from "../../../events";
import { hasTypeParameters, join, renderFlags } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

export const header = (context: DefaultThemeRenderContext, props: PageEvent<Reflection>) => (
    <header>
        <div class="tsd-page-toolbar">
            <div class="container">
                <div class="table-wrap">
                    <div class="table-cell" id="tsd-search" data-base={context.relativeURL("./")}>
                        <div class="field">
                            <label for="tsd-search-field" class="tsd-widget search no-caption">
                                Search
                            </label>
                            <input type="text" id="tsd-search-field" />
                        </div>

                        <ul class="results">
                            <li class="state loading">Preparing search index...</li>
                            <li class="state failure">The search index is not available</li>
                        </ul>

                        <a href={context.relativeURL("index.html")} class="title">
                            {props.project.name}
                        </a>
                    </div>

                    <div class="table-cell" id="tsd-widgets">
                        <div id="tsd-filter">
                            <a href="#" class="tsd-widget options no-caption" data-toggle="options">
                                Options
                            </a>
                            <div class="tsd-filter-group">
                                <div class="tsd-select" id="tsd-filter-visibility">
                                    <span class="tsd-select-label">All</span>
                                    <ul class="tsd-select-list">
                                        <li data-value="public">Public</li>
                                        <li data-value="protected">Public/Protected</li>
                                        <li data-value="private" class="selected">
                                            All
                                        </li>
                                    </ul>
                                </div>{" "}
                                <input type="checkbox" id="tsd-filter-inherited" checked={true} />
                                <label class="tsd-widget" for="tsd-filter-inherited">
                                    Inherited
                                </label>
                                {!context.options.getValue("excludeExternals") && (
                                    <>
                                        <input type="checkbox" id="tsd-filter-externals" checked={true} />
                                        <label class="tsd-widget" for="tsd-filter-externals">
                                            Externals
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>

                        <a href="#" class="tsd-widget menu no-caption" data-toggle="menu">
                            Menu
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <div class="tsd-page-title">
            <div class="container">
                {!!props.model.parent && <ul class="tsd-breadcrumb">{context.breadcrumb(props.model)}</ul>}
                <h1>
                    {props.model.kindString !== "Project" && `${props.model.kindString ?? ""} `}
                    {props.model.name}
                    {hasTypeParameters(props.model) && (
                        <>
                            {"<"}
                            {join(", ", props.model.typeParameters, (item) => item.name)}
                            {">"}
                        </>
                    )}{" "}
                    {renderFlags(props.model.flags)}
                </h1>
            </div>
        </div>
    </header>
);
