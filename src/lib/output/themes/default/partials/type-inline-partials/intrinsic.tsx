import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { createElement } from "../../../../../utils";
import { IntrinsicType } from "../../../../../models";
export const intrinsic = (_ctx: DefaultThemeRenderContext) => (props: IntrinsicType) =>
    <span class="tsd-signature-type">{props.name}</span>;
