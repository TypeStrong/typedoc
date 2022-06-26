import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import { ReflectionType, SignatureReflection } from "../../../../models";
import { hasTypeParameters, renderFlags } from "../../lib";

export const memberSignatureBody = (
    context: DefaultThemeRenderContext,
    props: SignatureReflection,
    { hideSources = false }: { hideSources?: boolean } = {}
) => (
    <>
        {renderFlags(props.flags, props.comment)}
        {context.comment(props)}

        {hasTypeParameters(props) && (
            <div class="tsd-type-parameters">
                <h4 class="tsd-type-parameters-title">Type Parameters</h4>
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
                                {renderFlags(item.flags, item.comment)}
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
                {props.type instanceof ReflectionType && context.parameter(props.type.declaration)}
            </>
        )}
        {!hideSources && context.memberSources(props)}
    </>
);
