import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { TupleType } from "../../../../../models";
import { createElement } from "../../../../../utils";

export const tuple =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: TupleType) =>
        (
            <>
                <span class="tsd-signature-symbol">[</span>
                {props.elements.map((item, i) => (
                    <>
                        {i > 0 && <span class="tsd-signature-symbol">, </span>}
                        {partials.type(item)}
                    </>
                ))}
                <span class="tsd-signature-symbol">]</span>
            </>
        );
