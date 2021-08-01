import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { createElement } from "../../../../../utils";
import { RestType } from "../../../../../models";
export const rest =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: RestType) =>
        (
            <>
                <span class="tsd-signature-symbol">...</span>
                {partials.type(props.elementType)}
            </>
        );
