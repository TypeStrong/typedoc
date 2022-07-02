import { JSX } from "../../../../utils";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";

export const anchorIcon = (context: DefaultThemeRenderContext, anchor: string | undefined) => (
    <a href={`#${anchor}`} aria-label="Permalink" class="tsd-anchor-icon">
        {context.icons.anchor()}
    </a>
);
