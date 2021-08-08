import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { TypeParameterContainer } from "../../../../models";
import { createElement } from "../../../../utils";

export const typeParameters = ({ partials }: DefaultThemeRenderContext, props: TypeParameterContainer) => (
    <ul class="tsd-type-parameters">
        {props.typeParameters?.map((item) => (
            <li>
                <h4>
                    {item.name}
                    {!!item.type && (
                        <>
                            <span class="tsd-signature-symbol">{": "}</span>
                            {partials.type(item.type)}
                        </>
                    )}
                    {!!item.default && (
                        <>
                            {" = "}
                            {partials.type(item.default)}
                        </>
                    )}
                </h4>
                {partials.comment(item)}
            </li>
        ))}
    </ul>
);
