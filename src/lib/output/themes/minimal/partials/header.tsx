import { PageEvent } from "../../../events";
import { Reflection } from "../../../../models";
import { MinimalThemeRenderContext } from "../MinimalTheme";
import { createElement } from "../../../../utils";

export const header =
    ({ relativeURL }: MinimalThemeRenderContext) =>
    (props: PageEvent<Reflection>) =>
        (
            <header>
                <div class="tsd-page-toolbar">
                    <div class="container">
                        <div class="table-wrap">
                            <div class="table-cell">
                                <strong>
                                    <a href={relativeURL("index.html")}>{props.project.name}</a>
                                </strong>
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
                                        </div>

                                        <input type="checkbox" id="tsd-filter-inherited" checked={true} />
                                        <label class="tsd-widget" for="tsd-filter-inherited">
                                            Inherited
                                        </label>

                                        {!props.settings.excludeExternals && (
                                            <>
                                                <input type="checkbox" id="tsd-filter-externals" checked={true} />
                                                <label class="tsd-widget" for="tsd-filter-externals">
                                                    Externals
                                                </label>
                                            </>
                                        )}
                                        <input type="checkbox" id="tsd-filter-only-exported" />
                                        <label class="tsd-widget" for="tsd-filter-only-exported">
                                            Only exported
                                        </label>
                                    </div>
                                </div>
                                <a href="#typedoc-main-index" class="tsd-widget menu no-caption">
                                    Menu
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        );
