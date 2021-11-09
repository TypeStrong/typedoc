import type { Reflection } from "../../../../models";
import { JSX } from "../../../../utils";
import type { PageEvent } from "../../../events";
import { hasTypeParameters, join } from "../../lib";
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
