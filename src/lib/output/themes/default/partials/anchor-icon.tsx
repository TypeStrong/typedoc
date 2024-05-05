import { JSX } from "../../../../utils";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

export function anchorIcon(context: DefaultThemeRenderContext, anchor: string | undefined) {
    if (!anchor) return <></>;

    return (
        <a href={`#${anchor}`} aria-label={context.i18n.theme_permalink()} class="tsd-anchor-icon">
            {context.icons.anchor()}
        </a>
    );
}
