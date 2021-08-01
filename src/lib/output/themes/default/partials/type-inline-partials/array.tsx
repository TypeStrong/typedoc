import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { createElement } from "../../../../../utils";
import { ArrayType } from "../../../../../models";
export const array =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: ArrayType) =>
        (
            <>
                {partials.type(props.elementType, { needsParens: true })}
                <span class="tsd-signature-symbol">[]</span>
            </>
        );
