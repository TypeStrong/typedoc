import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { createElement } from "../../../../../utils";
import { PredicateType } from "../../../../../models";
export const predicate =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: PredicateType) =>
        (
            <>
                {!!props.asserts && <span class="tsd-signature-symbol">asserts </span>}
                <span class="tsd-signature-type">{props.name}</span>
                {!!props.targetType && (
                    <>
                        <span class="tsd-signature-symbol"> is </span>
                        {partials.type(props.targetType)}
                    </>
                )}
            </>
        );
