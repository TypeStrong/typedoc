import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { createElement } from "../../../../../utils";
import { InferredType } from "../../../../../models";
export const inferred = (_ctx: DefaultThemeRenderContext) => (props: InferredType) =>
    (
        <>
            <span class="tsd-signature-symbol">infer </span> {props.name}
        </>
    );
