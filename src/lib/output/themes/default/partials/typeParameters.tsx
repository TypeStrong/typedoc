import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import type { TypeParameterReflection } from "../../../../models/index.js";
import { i18n, JSX } from "#utils";
import { anchorLinkIfPresent } from "./anchor-icon.js";

export function typeParameters(context: DefaultThemeRenderContext, typeParameters: TypeParameterReflection[]) {
    return (
        <>
            <section class="tsd-panel">
                <h4>{i18n.kind_plural_type_parameter()}</h4>
                <ul class="tsd-type-parameter-list">
                    {typeParameters.map((item) => (
                        <li>
                            <span>
                                {anchorLinkIfPresent(context, item)}
                                {item.flags.isConst && (
                                    <>
                                        <span class="tsd-signature-keyword">const</span>
                                        {" "}
                                    </>
                                )}
                                {item.varianceModifier && (
                                    <>
                                        <span class="tsd-signature-keyword">{item.varianceModifier}</span>
                                        {" "}
                                    </>
                                )}
                                <span class="tsd-kind-type-parameter">{item.name}</span>
                                {!!item.type && (
                                    <>
                                        {" "}
                                        <span class="tsd-signature-keyword">extends</span> {context.type(item.type)}
                                    </>
                                )}
                                {!!item.default && (
                                    <>
                                        {" = "}
                                        {context.type(item.default)}
                                    </>
                                )}
                            </span>
                            {context.commentSummary(item)}
                            {context.commentTags(item)}
                        </li>
                    ))}
                </ul>
            </section>
        </>
    );
}
