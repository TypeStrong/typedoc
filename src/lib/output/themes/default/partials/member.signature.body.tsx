import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { i18n, JSX } from "#utils";
import type { SignatureReflection } from "../../../../models/index.js";
import { hasTypeParameters } from "../../lib.js";

export function memberSignatureBody(
    context: DefaultThemeRenderContext,
    props: SignatureReflection,
    { hideSources = false }: { hideSources?: boolean } = {},
) {
    const returnsTag = props.comment?.getTag("@returns");

    return (
        <>
            {context.reflectionFlags(props)}
            {context.commentSummary(props)}

            {hasTypeParameters(props) && context.typeParameters(props.typeParameters)}

            {props.parameters && props.parameters.length > 0 && (
                <div class="tsd-parameters">
                    <h4 class="tsd-parameters-title">{i18n.kind_plural_parameter()}</h4>
                    <ul class="tsd-parameter-list">
                        {props.parameters.map((item) => (
                            <li>
                                <span>
                                    {context.reflectionFlags(item)}
                                    {!!item.flags.isRest && <span class="tsd-signature-symbol">...</span>}
                                    <span class="tsd-kind-parameter">{item.name}</span>
                                    {": "}
                                    {context.type(item.type)}
                                    {item.defaultValue != null && (
                                        <span class="tsd-signature-symbol">
                                            {" = "}
                                            {item.defaultValue}
                                        </span>
                                    )}
                                </span>
                                {context.commentSummary(item)}
                                {context.commentTags(item)}
                                {context.typeDetailsIfUseful(item, item.type)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {props.type && (
                <>
                    <h4 class="tsd-returns-title">
                        {i18n.theme_returns()} {context.type(props.type)}
                    </h4>
                    {returnsTag && <JSX.Raw html={context.markdown(returnsTag.content)} />}
                    {context.typeDetailsIfUseful(props, props.type)}
                </>
            )}

            {context.commentTags(props)}

            {!hideSources && context.memberSources(props)}
        </>
    );
}
