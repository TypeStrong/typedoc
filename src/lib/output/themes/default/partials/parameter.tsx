import { wbr } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import { DeclarationReflection, ReflectionType } from "../../../../models";
export const parameter =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: DeclarationReflection) =>
        (
            <>
                <ul class="tsd-parameters">
                    {!!props.signatures && (
                        <li class="tsd-parameter-signature">
                            <ul class={"tsd-signatures " + props.cssClasses}>
                                {props.signatures.map((item) => (
                                    <li class="tsd-signature tsd-kind-icon">
                                        {partials.memberSignatureTitle(item, { hideName: true })}
                                    </li>
                                ))}
                            </ul>

                            <ul class="tsd-descriptions">
                                {props.signatures.map((item) => (
                                    <>
                                        <li class="tsd-description">
                                            {partials.memberSignatureBody(item, { hideSources: true })}
                                        </li>
                                    </>
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
                                            {item.type && partials.type(item.type)}
                                        </>
                                    ))}
                                    <span class="tsd-signature-symbol">{"]: "}</span>
                                    {props.indexSignature.type && partials.type(props.indexSignature.type)}
                                </h5>
                                {partials.comment(props.indexSignature)}
                                {props.indexSignature.type instanceof ReflectionType &&
                                    partials.parameter(props.indexSignature.type.declaration)}
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

                                    {partials.memberSignatures(item)}
                                </li>
                            ) : item.type ? (
                                <>
                                    {/* standard type */}
                                    <li class="tsd-parameter">
                                        <h5>
                                            {item.flags.map((item) => (
                                                <>
                                                    <span class={"tsd-flag ts-flag" + item}>{item}</span>{" "}
                                                </>
                                            ))}
                                            {!!item.flags.isRest && <span class="tsd-signature-symbol">...</span>}
                                            {wbr(item.name)}
                                            <span class="tsd-signature-symbol">
                                                {!!item.flags.isOptional && "?"}
                                                {": "}
                                            </span>
                                            {partials.type(item.type)}
                                        </h5>
                                        {partials.comment(item)}
                                        {!!item.children && <> {partials.parameter(item)}</>}
                                        {item.type instanceof ReflectionType &&
                                            partials.parameter(item.type.declaration)}
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
                                                    {item.getSignature.flags.map((item) => (
                                                        <>
                                                            <span class={"tsd-flag ts-flag" + item}>{item}</span>{" "}
                                                        </>
                                                    ))}
                                                    <span class="tsd-signature-symbol">get </span>
                                                    {wbr(item.name)}
                                                    <span class="tsd-signature-symbol">(): </span>
                                                    {item.getSignature.type && partials.type(item.getSignature.type)}
                                                </h5>

                                                {partials.comment(item.getSignature)}
                                            </li>
                                        </>
                                    )}
                                    {item.setSignature && (
                                        <>
                                            {/* setter */}
                                            <li class="tsd-parameter">
                                                <h5>
                                                    {item.setSignature.flags.map((item) => (
                                                        <>
                                                            <span class={"tsd-flag ts-flag" + item}>{item}</span>{" "}
                                                        </>
                                                    ))}
                                                    <span class="tsd-signature-symbol">set </span>
                                                    {wbr(item.name)}
                                                    <span class="tsd-signature-symbol">(</span>
                                                    {item.setSignature.parameters?.map((item) => (
                                                        <>
                                                            {item.name}
                                                            <span class="tsd-signature-symbol">: </span>
                                                            {item.type ? (
                                                                partials.type(item.type)
                                                            ) : (
                                                                <span class="tsd-signature-type">any</span>
                                                            )}
                                                        </>
                                                    ))}
                                                    <span class="tsd-signature-symbol">): </span>
                                                    {item.setSignature.type && partials.type(item.setSignature.type)}
                                                </h5>

                                                {partials.comment(item.setSignature)}
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
