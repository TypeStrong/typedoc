import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { createElement } from "../../../../../utils";
import { OptionalType } from "../../../../../models";
export const optional =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: OptionalType) =>
        (
            <>
                {partials.type(props.elementType)}
                <span class="tsd-signature-symbol">?</span>
            </>
        );
