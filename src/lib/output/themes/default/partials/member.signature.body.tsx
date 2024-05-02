import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX, Raw } from "../../../../utils";
import { ReflectionType, type SignatureReflection } from "../../../../models";
import { hasTypeParameters } from "../../lib";

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
                    <h4 class="tsd-parameters-title">{context.i18n.kind_plural_parameter()}</h4>
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
                                {item.type instanceof ReflectionType && context.parameter(item.type.declaration)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {props.type && (
                <>
                    <h4 class="tsd-returns-title">
                        {context.i18n.theme_returns()} {context.type(props.type)}
                    </h4>
                    {returnsTag && <Raw html={context.markdown(returnsTag.content)} />}
                    {props.type instanceof ReflectionType && context.parameter(props.type.declaration)}
                </>
            )}

            {context.commentTags(props)}

            {!hideSources && context.memberSources(props)}
        </>
    );
}
