import { getKindClass, join, renderTypeParametersSignature, wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import { type ParameterReflection, ReflectionKind, type SignatureReflection } from "../../../../models";

function renderParameterWithType(context: DefaultThemeRenderContext, item: ParameterReflection) {
    return (
        <>
            {!!item.flags.isRest && <span class="tsd-signature-symbol">...</span>}
            <span class="tsd-kind-parameter">{item.name}</span>
            <span class="tsd-signature-symbol">
                {!!item.flags.isOptional && "?"}
                {!!item.defaultValue && "?"}
                {": "}
            </span>
            {context.type(item.type)}
        </>
    );
}

function renderParameterWithoutType(item: ParameterReflection) {
    return (
        <>
            {!!item.flags.isRest && <span class="tsd-signature-symbol">...</span>}
            <span class="tsd-kind-parameter">{item.name}</span>
            {(item.flags.isOptional || item.defaultValue) && <span class="tsd-signature-symbol">?</span>}
        </>
    );
}

export function memberSignatureTitle(
    context: DefaultThemeRenderContext,
    props: SignatureReflection,
    {
        hideName = false,
        arrowStyle = false,
        hideParamTypes = context.options.getValue("hideParameterTypesInTitle"),
    }: { hideName?: boolean; arrowStyle?: boolean; hideParamTypes?: boolean } = {},
) {
    const renderParam = hideParamTypes ? renderParameterWithoutType : renderParameterWithType.bind(null, context);

    return (
        <>
            {!hideName ? (
                <span class={getKindClass(props)}>{wbr(props.name)}</span>
            ) : (
                <>
                    {props.kind === ReflectionKind.ConstructorSignature && (
                        <>
                            {!!props.flags.isAbstract && <span class="tsd-signature-keyword">abstract </span>}
                            <span class="tsd-signature-keyword">new </span>
                        </>
                    )}
                </>
            )}
            {renderTypeParametersSignature(context, props.typeParameters)}
            <span class="tsd-signature-symbol">(</span>
            {join(", ", props.parameters ?? [], renderParam)}
            <span class="tsd-signature-symbol">)</span>
            {!!props.type && (
                <>
                    <span class="tsd-signature-symbol">{arrowStyle ? " => " : ": "}</span>
                    {context.type(props.type)}
                </>
            )}
        </>
    );
}
