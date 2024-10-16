import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

import { JSX } from "../../../../utils";

export function hierarchyTemplate(context: DefaultThemeRenderContext) {
    return (
        <section class="tsd-panel tsd-hierarchy" id="tsd-hierarchy-container" data-base={context.relativeURL("./")}>
            <h4>{context.i18n.theme_hierarchy_summary()}</h4>

            <ul class="tsd-hierarchy tsd-full-hierarchy">
                <li class="tsd-hierarchy-item">
                    <span>{context.i18n.theme_loading()}</span>
                </li>
            </ul>
        </section>
    );
}
