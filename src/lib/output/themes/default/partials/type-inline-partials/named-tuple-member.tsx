import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { createElement } from "../../../../../utils";
import { NamedTupleMember } from "../../../../../models";
export const namedTupleMember =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: NamedTupleMember) =>
        (
            <>
                {props.name}
                {props.isOptional ? (
                    <span class="tsd-signature-symbol">?: </span>
                ) : (
                    <span class="tsd-signature-symbol">: </span>
                )}
                {partials.type(props.element)}
            </>
        );
