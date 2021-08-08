import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { TypeParameterContainer } from "../../../../models";
import { createElement } from "../../../../utils";

export const typeParameters = (context: DefaultThemeRenderContext, props: TypeParameterContainer) => (
    <ul class="tsd-type-parameters">
        {props.typeParameters?.map((item) => (
            <li>
                <h4>
                    {item.name}
                    {!!item.type && (
                        <>
                            <span class="tsd-signature-symbol">{": "}</span>
                            {context.type(item.type)}
                        </>
                    )}
                    {!!item.default && (
                        <>
                            {" = "}
                            {context.type(item.default)}
                        </>
                    )}
                </h4>
                {context.comment(item)}
            </li>
        ))}
    </ul>
);
