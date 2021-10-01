import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX, Raw } from "../../../../utils";
import { ReflectionType, SignatureReflection } from "../../../../models";
import { renderFlags } from "../../lib";
export const memberSignatureBody = (
    context: DefaultThemeRenderContext,
    props: SignatureReflection,
    { hideSources = false }: { hideSources?: boolean } = {}
) => (
    <>
        {!hideSources && context.memberSources(props)}
        {context.comment(props)}

        {!!props.typeParameters && (
            <div class="tsd-type-parameters">
                <h4 class="tsd-type-parameters-title">Type parameters</h4>
                {context.typeParameters(props.typeParameters)}
            </div>
        )}
        {props.parameters && props.parameters.length > 0 && (
            <div class="tsd-parameters">
                <h4 class="tsd-parameters-title">Parameters</h4>
                <ul class="tsd-parameter-list">
                    {props.parameters.map((item) => (
                        <li>
                            <h5>
                                {renderFlags(item.flags)}
                                {!!item.flags.isRest && <span class="tsd-signature-symbol">...</span>}
                                {item.name}
                                {": "}
                                {context.type(item.type)}
                                {item.defaultValue != null && (
                                    <span class="tsd-signature-symbol">
                                        {" = "}
                                        {item.defaultValue}
                                    </span>
                                )}
                            </h5>
                            {context.comment(item)}
                            {item.type instanceof ReflectionType && context.parameter(item.type.declaration)}
                        </li>
                    ))}
                </ul>
            </div>
        )}
        {props.type && (
            <>
                <h4 class="tsd-returns-title">
                    {"Returns "}
                    {context.type(props.type)}
                </h4>
                {!!props.comment?.returns && (
                    <div>
                        <Raw html={context.markdown(props.comment.returns)} />
                    </div>
                )}
                {props.type instanceof ReflectionType && context.parameter(props.type.declaration)}
            </>
        )}
    </>
);
