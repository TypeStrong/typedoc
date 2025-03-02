import type { Reflection } from "../../../../models/index.js";
import { i18n, JSX } from "#utils";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";

export function anchorIcon(context: DefaultThemeRenderContext, anchor: string | undefined) {
    if (!anchor) return <></>;

    return (
        <a href={`#${anchor}`} aria-label={i18n.theme_permalink()} class="tsd-anchor-icon">
            {context.icons.anchor()}
        </a>
    );
}

export function anchorTargetIfPresent(context: DefaultThemeRenderContext, refl: Reflection) {
    return context.router.hasUrl(refl) ? context.router.getAnchor(refl) : undefined;
}
