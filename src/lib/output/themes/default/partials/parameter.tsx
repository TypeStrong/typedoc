import { renderFlags, wbr } from "../../lib";
import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import { DeclarationReflection, ReflectionType } from "../../../../models";

export const parameter = (context: DefaultThemeRenderContext, props: DeclarationReflection) => (
    <>
        <ul class="tsd-parameters">
            {!!props.signatures && (
                <li class="tsd-parameter-signature">
                    <ul class={"tsd-signatures " + props.cssClasses}>
                        {props.signatures.map((item) => (
                            <li class="tsd-signature tsd-kind-icon">
                                {context.memberSignatureTitle(item, { hideName: true })}
                            </li>
                        ))}
                    </ul>

                    <ul class="tsd-descriptions">
                        {props.signatures.map((item) => (
                            <li class="tsd-description">{context.memberSignatureBody(item, { hideSources: true })}</li>
                        ))}
                    </ul>
                </li>
            )}
            {!!props.indexSignature && (
                <>
                    <li class="tsd-parameter-index-signature">
                        <h5>
                            <span class="tsd-signature-symbol">[</span>
                            {props.indexSignature?.parameters?.map((item) => (
                                <>
                                    {!!item.flags.isRest && <span class="tsd-signature-symbol">...</span>}
                                    {item.name}
                                    {": "}
                                    {context.type(item.type)}
                                </>
                            ))}
                            <span class="tsd-signature-symbol">{"]: "}</span>
                            {context.type(props.indexSignature.type)}
                        </h5>
                        {context.comment(props.indexSignature)}
                        {props.indexSignature.type instanceof ReflectionType &&
                            context.parameter(props.indexSignature.type.declaration)}
                    </li>
                </>
            )}
            {props.children?.map((item) => (
                <>
                    {item.signatures ? (
                        <li class="tsd-parameter">
                            <h5>
                                {!!item.flags.isRest && <span class="tsd-signature-symbol">...</span>}
                                {wbr(item.name)}
                                <span class="tsd-signature-symbol">{!!item.flags.isOptional && "?"}:</span>
                                function
                            </h5>

                            {context.memberSignatures(item)}
                        </li>
                    ) : item.type ? (
                        <>
                            {/* standard type */}
                            <li class="tsd-parameter">
                                <h5>
                                    {renderFlags(item.flags)}
                                    {!!item.flags.isRest && <span class="tsd-signature-symbol">...</span>}
                                    {wbr(item.name)}
                                    <span class="tsd-signature-symbol">
                                        {!!item.flags.isOptional && "?"}
                                        {": "}
                                    </span>
                                    {context.type(item.type)}
                                </h5>
                                {context.comment(item)}
                                {!!item.children && context.parameter(item)}
                                {item.type instanceof ReflectionType && context.parameter(item.type.declaration)}
                            </li>
                        </>
                    ) : (
                        <>
                            {/* getter/setter */}
                            {item.getSignature && (
                                <>
                                    {/* getter */}
                                    <li class="tsd-parameter">
                                        <h5>
                                            {renderFlags(item.getSignature.flags)}
                                            <span class="tsd-signature-symbol">get </span>
                                            {wbr(item.name)}
                                            <span class="tsd-signature-symbol">(): </span>
                                            {context.type(item.getSignature.type)}
                                        </h5>

                                        {context.comment(item.getSignature)}
                                    </li>
                                </>
                            )}
                            {item.setSignature && (
                                <>
                                    {/* setter */}
                                    <li class="tsd-parameter">
                                        <h5>
                                            {renderFlags(item.setSignature.flags)}
                                            <span class="tsd-signature-symbol">set </span>
                                            {wbr(item.name)}
                                            <span class="tsd-signature-symbol">(</span>
                                            {item.setSignature.parameters?.map((item) => (
                                                <>
                                                    {item.name}
                                                    <span class="tsd-signature-symbol">: </span>
                                                    {context.type(item.type)}
                                                </>
                                            ))}
                                            <span class="tsd-signature-symbol">): </span>
                                            {context.type(item.setSignature.type)}
                                        </h5>

                                        {context.comment(item.setSignature)}
                                    </li>
                                </>
                            )}
                        </>
                    )}
                </>
            ))}
        </ul>
    </>
);
