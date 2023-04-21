import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import type { TypeParameterReflection } from "../../../../models";
import { JSX } from "../../../../utils";

export function typeParameters(context: DefaultThemeRenderContext, typeParameters: TypeParameterReflection[]) {
    return (
        <>
            <section class="tsd-panel">
                <h4>Type Parameters</h4>
                <ul class="tsd-type-parameter-list">
                    {typeParameters?.map((item) => (
                        <li>
                            <h4>
                                {item.flags.isConst && "const "}
                                {item.varianceModifier ? `${item.varianceModifier} ` : ""}
                                <span class="tsd-kind-type-parameter">{item.name}</span>
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
