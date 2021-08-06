import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import { createElement } from "../../../../../utils";
import { ReflectionType } from "../../../../../models";
import { TypeInlinePartialsOptions } from "./options";
export const reflection =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: ReflectionType, { needsParens = false }: TypeInlinePartialsOptions = {}) =>
        (
            <>
                {props.declaration.children ? (
                    <>
                        {/* object literal */}
                        <span class="tsd-signature-symbol">{"{ "}</span>
                        {props.declaration.children.map((item, i) => (
                            <>
                                {i > 0 && <span class="tsd-signature-symbol">; </span>}
                                {item.getSignature ? (
                                    item.setSignature ? (
                                        <>
                                            {item.name}
                                            <span class="tsd-signature-symbol">: </span>
                                            {partials.type(item.getSignature.type)}
                                        </>
                                    ) : (
                                        <>
                                            <span class="tsd-signature-symbol">{"get "}</span>
                                            {item.name}
                                            <span class="tsd-signature-symbol">(): </span>
                                            {partials.type(item.getSignature.type)}
                                        </>
                                    )
                                ) : item.setSignature ? (
                                    <>
                                        <span class="tsd-signature-symbol">{"set "}</span>
                                        {item.name}
                                        <span class="tsd-signature-symbol">(</span>
                                        {item.setSignature.parameters?.map((item) => (
                                            <>
                                                {item.name}
                                                <span class="tsd-signature-symbol">: </span>
                                                {partials.type(item.type)}
                                            </>
                                        ))}
                                        <span class="tsd-signature-symbol">)</span>
                                    </>
                                ) : (
                                    <>
                                        {item.name}
                                        <span class="tsd-signature-symbol">{item.flags.isOptional ? "?: " : ": "}</span>
                                        {partials.type(item.type)}
                                    </>
                                )}
                            </>
                        ))}
                        <span class="tsd-signature-symbol">{" }"}</span>
                    </>
                ) : props.declaration.signatures ? (
                    props.declaration.signatures.length > 1 ? (
                        <>
                            <span class="tsd-signature-symbol">{"{"} </span>
                            {props.declaration.signatures.map((item, i, l) => (
                                <>
                                    {partials.memberSignatureTitle(item, { hideName: true })}
                                    {i < l.length - 1 && <span class="tsd-signature-symbol">; </span>}
                                </>
                            ))}
                            <span class="tsd-signature-symbol">{" }"}</span>
                        </>
                    ) : (
                        <>
                            {needsParens && <span class="tsd-signature-symbol">(</span>}
                            {partials.memberSignatureTitle(props.declaration.signatures[0], {
                                hideName: true,
                                arrowStyle: true,
                            })}
                            {needsParens && <span class="tsd-signature-symbol">)</span>}
                        </>
                    )
                ) : (
                    <span class="tsd-signature-symbol">
                        {"{"}
                        {"}"}
                    </span>
                )}
            </>
        );
