import { join, wbr } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import { SignatureReflection } from "../../../../models";
export const memberSignatureTitle =
    ({ partials }: DefaultThemeRenderContext) =>
    (
        props: SignatureReflection,
        { hideName = false, arrowStyle = false }: { hideName?: boolean; arrowStyle?: boolean } = {}
    ) =>
        (
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
                {!!props.typeParameters && (
                    <>
                        {"<"}
                        {join(", ", props.typeParameters, (item) => item.name)}
                        {">"}
                    </>
                )}
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
                        {partials.type(item.type)}
                    </>
                ))}
                <span class="tsd-signature-symbol">)</span>
                {!!props.type && (
                    <>
                        <span class="tsd-signature-symbol">{arrowStyle ? " => " : ": "}</span>
                        {partials.type(props.type)}
                    </>
                )}
            </>
        );
