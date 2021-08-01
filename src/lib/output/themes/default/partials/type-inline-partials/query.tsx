import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { createElement } from "../../../../../utils";
import { QueryType } from "../../../../../models";
export const query =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: QueryType) =>
        (
            <>
                <span class="tsd-signature-symbol">typeof </span>
                {partials.type(props.queryType)}
            </>
        );
