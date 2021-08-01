import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { createElement } from "../../../../../utils";
import { IndexedAccessType } from "../../../../../models";
export const indexedAccess =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: IndexedAccessType) =>
        (
            <>
                {partials.type(props.objectType)}
                <span class="tsd-signature-symbol">[</span>
                {partials.type(props.indexType)}
                <span class="tsd-signature-symbol">]</span>
            </>
        );
