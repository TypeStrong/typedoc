import { stringify } from "../../../lib";
import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { createElement } from "../../../../../utils";
import { LiteralType } from "../../../../../models";
export const literal = (_ctx: DefaultThemeRenderContext) => (props: LiteralType) =>
    <span class="tsd-signature-type">{stringify(props.value)}</span>;
