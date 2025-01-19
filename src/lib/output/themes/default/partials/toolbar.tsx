import type { Reflection } from "../../../../models/index.js";
import { JSX } from "../../../../utils/index.js";
import type { PageEvent } from "../../../events.js";
import { getDisplayName } from "../../lib.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";

export const toolbar = (context: DefaultThemeRenderContext, props: PageEvent<Reflection>) => (
    <header class="tsd-page-toolbar">
        <div class="tsd-toolbar-contents container">
            <a href={context.options.getValue("titleLink") || context.relativeURL("index.html")} class="title">
                {getDisplayName(props.project)}
            </a>

            <div id="tsd-toolbar-links">
                {Object.entries(context.options.getValue("navigationLinks")).map(([label, url]) => (
                    <a href={url}>{label}</a>
                ))}
            </div>

            <button id="tsd-search-trigger" class="tsd-widget" aria-label={context.i18n.theme_search()}>
                {context.icons.search()}
            </button>

            <a
                href="#"
                class="tsd-widget menu"
                id="tsd-toolbar-menu-trigger"
                data-toggle="menu"
                aria-label={context.i18n.theme_menu()}
            >
                {context.icons.menu()}
            </a>
        </div>
    </header>
);
