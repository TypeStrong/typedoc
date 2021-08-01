import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { TypeOperatorType } from "../../../../../models";
import { createElement } from "../../../../../utils";

export const typeOperator =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: TypeOperatorType) =>
        (
            <>
                <span class="tsd-signature-symbol">{props.operator} </span>
                {partials.type(props.target)}
            </>
        );
