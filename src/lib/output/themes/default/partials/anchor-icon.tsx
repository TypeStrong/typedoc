import { JSX } from "../../../../utils/index.js";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";

void JSX; // Trick TS into seeing this as used, the import is required.

export function anchorIcon(context: DefaultThemeRenderContext, anchor: string | undefined) {
    if (!anchor) return <></>;

    return (
        <a href={`#${anchor}`} aria-label={context.i18n.theme_permalink()} class="tsd-anchor-icon">
            {context.icons.anchor()}
        </a>
    );
}
