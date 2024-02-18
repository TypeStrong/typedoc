import type { Reflection } from "../../../../models";
import { JSX } from "../../../../utils";
import type { PageEvent } from "../../../events";
import { getDisplayName } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

export const toolbar = (context: DefaultThemeRenderContext, props: PageEvent<Reflection>) => (
    <header class="tsd-page-toolbar">
        <div class="tsd-toolbar-contents container">
            <div class="table-cell" id="tsd-search" data-base={context.relativeURL("./")}>
                <div class="field">
                    <label for="tsd-search-field" class="tsd-widget tsd-toolbar-icon search no-caption">
                        {context.icons.search()}
                    </label>
                    <input type="text" id="tsd-search-field" aria-label={context.i18n.theme_search()} />
                </div>

                <div class="field">
                    <div id="tsd-toolbar-links">
                        {Object.entries(context.options.getValue("navigationLinks")).map(([label, url]) => (
                            <a href={url}>{label}</a>
                        ))}
                    </div>
                </div>

                <ul class="results">
                    <li class="state loading">{context.i18n.theme_preparing_search_index()}</li>
                    <li class="state failure">{context.i18n.theme_search_index_not_available()}</li>
                </ul>

                <a href={context.options.getValue("titleLink") || context.relativeURL("index.html")} class="title">
                    {getDisplayName(props.project)}
                </a>
            </div>

            <div class="table-cell" id="tsd-widgets">
                <a
                    href="#"
                    class="tsd-widget tsd-toolbar-icon menu no-caption"
                    data-toggle="menu"
                    aria-label={context.i18n.theme_menu()}
                >
                    {context.icons.menu()}
                </a>
            </div>
        </div>
    </header>
);
