import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import type { TypeParameterReflection } from "../../../../models";
import { JSX } from "../../../../utils";

export function typeParameters(context: DefaultThemeRenderContext, typeParameters: TypeParameterReflection[]) {
    return (
        <>
            <section class="tsd-panel tsd-type-parameters">
                <h4>Type Parameters</h4>
                <ul class="tsd-type-parameters">
                    {typeParameters?.map((item) => (
                        <li>
                            <h4>
                                {item.varianceModifier ? `${item.varianceModifier} ` : ""}
                                {item.name}
                                {!!item.type && (
                                    <>
                                        <span class="tsd-signature-symbol"> extends </span>
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
            </section>
        </>
    );
}
