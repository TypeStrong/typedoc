import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement, Raw } from "../../../../utils";
import { ReflectionType, SignatureReflection } from "../../../../models";
import { renderFlags } from "../../lib";
export const memberSignatureBody = (
    { partials, markdown }: DefaultThemeRenderContext,
    props: SignatureReflection,
    { hideSources = false }: { hideSources?: boolean } = {}
) => (
    <>
        {!hideSources && partials.memberSources(props)}
        {partials.comment(props)}

        {!!props.typeParameters && (
            <>
                <h4 class="tsd-type-parameters-title">Type parameters</h4>
                {partials.typeParameters(props)}
            </>
        )}
        {props.parameters && props.parameters.length > 0 && (
            <>
                <h4 class="tsd-parameters-title">Parameters</h4>
                <ul class="tsd-parameters">
                    {props.parameters.map((item) => (
                        <li>
                            <h5>
                                {renderFlags(item.flags)}
                                {!!item.flags.isRest && <span class="tsd-signature-symbol">...</span>}
                                {item.name}
                                {": "}
                                {partials.type(item.type)}
                                {item.defaultValue != null && (
                                    <span class="tsd-signature-symbol">
                                        {" = "}
                                        {item.defaultValue}
                                    </span>
                                )}
                            </h5>
                            {partials.comment(item)}
                            {item.type instanceof ReflectionType && partials.parameter(item.type.declaration)}
                        </li>
                    ))}
                </ul>
            </>
        )}
        {props.type && (
            <>
                <h4 class="tsd-returns-title">
                    {"Returns "}
                    {partials.type(props.type)}
                </h4>
                {!!props.comment?.returns && (
                    <div>
                        <Raw html={markdown(props.comment.returns)} />
                    </div>
                )}
                {props.type instanceof ReflectionType && partials.parameter(props.type.declaration)}
            </>
        )}
    </>
);
