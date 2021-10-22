import { join, renderTypeParametersSignature, wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import type { SignatureReflection } from "../../../../models";

export const memberSignatureTitle = (
    context: DefaultThemeRenderContext,
    props: SignatureReflection,
    { hideName = false, arrowStyle = false }: { hideName?: boolean; arrowStyle?: boolean } = {}
) => (
    <>
        {!hideName ? (
            wbr(props.name)
        ) : (
            <>
                {props.kindString === "Constructor signature" && (
                    <>
                        {!!props.flags.isAbstract && <span class="tsd-signature-symbol">abstract </span>}
                        <span class="tsd-signature-symbol">new </span>
                    </>
                )}
            </>
        )}
        {renderTypeParametersSignature(props.typeParameters)}
        <span class="tsd-signature-symbol">(</span>
        {join(", ", props.parameters ?? [], (item) => (
            <>
                {!!item.flags.isRest && <span class="tsd-signature-symbol">...</span>}
                {item.name}
                <span class="tsd-signature-symbol">
                    {!!item.flags.isOptional && "?"}
                    {!!item.defaultValue && "?"}
                    {": "}
                </span>
                {context.type(item.type)}
            </>
        ))}
        <span class="tsd-signature-symbol">)</span>
        {!!props.type && (
            <>
                <span class="tsd-signature-symbol">{arrowStyle ? " => " : ": "}</span>
                {context.type(props.type)}
            </>
        )}
    </>
);
