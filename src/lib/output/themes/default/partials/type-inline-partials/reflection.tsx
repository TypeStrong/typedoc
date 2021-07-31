import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import * as React from "react";
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
                        <span className="tsd-signature-symbol">{"{ "}</span>
                        {props.declaration.children.map((item, i) => (
                            <>
                                {i > 0 && <span className="tsd-signature-symbol">; </span>}
                                {item.getSignature ? (
                                    item.setSignature ? (
                                        <>
                                            {item.name}
                                            <span className="tsd-signature-symbol">: </span>
                                            {item.getSignature.type ? (
                                                partials.type(item.getSignature.type)
                                            ) : (
                                                <span className="tsd-signature-type">any</span>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <span className="tsd-signature-symbol">{"get "}</span>
                                            {item.name}
                                            <span className="tsd-signature-symbol">(): </span>
                                            {item.getSignature.type ? (
                                                partials.type(item.getSignature.type)
                                            ) : (
                                                <span className="tsd-signature-type">any</span>
                                            )}
                                        </>
                                    )
                                ) : item.setSignature ? (
                                    <>
                                        <span className="tsd-signature-symbol">{"set "}</span>
                                        {item.name}
                                        <span className="tsd-signature-symbol">(</span>
                                        {item.setSignature.parameters?.map((item) => (
                                            <>
                                                {item.name}
                                                <span className="tsd-signature-symbol">: </span>
                                                {item.type ? (
                                                    partials.type(item.type)
                                                ) : (
                                                    <span className="tsd-signature-type">any</span>
                                                )}
                                            </>
                                        ))}
                                        <span className="tsd-signature-symbol">)</span>
                                    </>
                                ) : (
                                    <>
                                        {item.name}
                                        <span className="tsd-signature-symbol">
                                            {item.flags.isOptional ? "?: " : ": "}
                                        </span>
                                        {item.type ? (
                                            <>{partials.type(item.type)}</>
                                        ) : (
                                            <span className="tsd-signature-type">any</span>
                                        )}
                                    </>
                                )}
                            </>
                        ))}
                        <span className="tsd-signature-symbol">{" }"}</span>
                    </>
                ) : props.declaration.signatures ? (
                    props.declaration.signatures.length > 1 ? (
                        <>
                            <span className="tsd-signature-symbol">{"{"} </span>
                            {props.declaration.signatures.map((item, i, l) => (
                                <>
                                    {partials.memberSignatureTitle(item, { hideName: true })}
                                    {i < l.length - 1 && <span className="tsd-signature-symbol">; </span>}
                                </>
                            ))}
                            <span className="tsd-signature-symbol">{" }"}</span>
                        </>
                    ) : (
                        <>
                            {needsParens && <span className="tsd-signature-symbol">(</span>}
                            {partials.memberSignatureTitle(props.declaration.signatures[0], {
                                hideName: true,
                                arrowStyle: true,
                            })}
                            {needsParens && <span className="tsd-signature-symbol">)</span>}
                        </>
                    )
                ) : (
                    <span className="tsd-signature-symbol">
                        {"{"}
                        {"}"}
                    </span>
                )}
            </>
        );
