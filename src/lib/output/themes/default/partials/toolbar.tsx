import type { Reflection } from "../../../../models/index.js";
import { JSX } from "#utils";
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
            <dialog id="tsd-search" aria-label={context.i18n.theme_search()}>
                <input
                    role="combobox"
                    id="tsd-search-input"
                    aria-controls="tsd-search-results"
                    aria-autocomplete="list"
                    aria-expanded="true"
                    spellcheck={false}
                    autocapitalize="off"
                    autocomplete="off"
                    placeholder={context.i18n.theme_search_placeholder()}
                    maxLength={100}
                />

                <ul role="listbox" id="tsd-search-results"></ul>
                <div id="tsd-search-status" aria-live="polite" aria-atomic="true">
                    <div>{context.i18n.theme_preparing_search_index()}</div>
                </div>
            </dialog>

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
