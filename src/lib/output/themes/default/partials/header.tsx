import type { Reflection } from "../../../../models";
import { JSX, VisibilityFilter } from "../../../../utils";
import type { PageEvent } from "../../../events";
import { hasTypeParameters, join } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

const visibilityFilterLabels = {
    [VisibilityFilter.all]: "All",
    [VisibilityFilter.public]: "Public",
    [VisibilityFilter.protected]: "Public/Protected",
};

export const header = (context: DefaultThemeRenderContext, props: PageEvent<Reflection>) => {
    const defaultSelectedVisibility = context.options.getValue("visibility");
    const selectedVisibility = Object.keys(visibilityFilterLabels).includes(defaultSelectedVisibility)
        ? (defaultSelectedVisibility as VisibilityFilter)
        : VisibilityFilter.all;
    const defaultInheritedChecked = context.options.getValue("showInherited");
    const defaultExternalsChecked = context.options.getValue("showExternals");

    return (
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
                                        <span class="tsd-select-label">
                                            {visibilityFilterLabels[selectedVisibility]}
                                        </span>
                                        <ul class="tsd-select-list">
                                            {Object.entries(visibilityFilterLabels).map(([value, label]) => (
                                                <li
                                                    data-value={value}
                                                    class={value === selectedVisibility ? "selected" : ""}
                                                >
                                                    {label}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>{" "}
                                    <input
                                        type="checkbox"
                                        id="tsd-filter-inherited"
                                        checked={!!defaultInheritedChecked}
                                    />
                                    <label class="tsd-widget" for="tsd-filter-inherited">
                                        Inherited
                                    </label>
                                    {!context.options.getValue("excludeExternals") && (
                                        <>
                                            <input
                                                type="checkbox"
                                                id="tsd-filter-externals"
                                                checked={!!defaultExternalsChecked}
                                            />
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
                        )}
                    </h1>
                </div>
            </div>
        </header>
    );
};
