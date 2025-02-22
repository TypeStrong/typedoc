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

export function anchorLink(anchor: string | undefined) {
    if (!anchor) return <></>;

    return <a id={anchor} class="tsd-anchor" />;
}

export function anchorLinkIfPresent(context: DefaultThemeRenderContext, refl: Reflection) {
    if (!context.router.hasUrl(refl)) return <></>;

    return anchorLink(context.router.getAnchor(refl));
}
