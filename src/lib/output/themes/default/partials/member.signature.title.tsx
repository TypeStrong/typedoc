import { With, wbr, IfCond } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { SignatureReflection } from "../../../../models";
export const memberSignatureTitle =
    ({ partials }: DefaultThemeRenderContext) =>
    (
        props: SignatureReflection,
        {
            hideName = false,
            arrowStyle = false,
        }: { hideName?: boolean; arrowStyle?: boolean } = {}
    ) =>
        (
            <>
                {!hideName ? (
                    <>{wbr(props.name)}</>
                ) : (
                    <>
                        <IfCond
                            cond={props.kindString === "Constructor signature"}
                        >
                            {!!props.flags.isAbstract && (
                                <>
                                    <span className="tsd-signature-symbol">
                                        abstract{" "}
                                    </span>
                                </>
                            )}
                            <span className="tsd-signature-symbol">new </span>
                        </IfCond>
                    </>
                )}
                {!!props.typeParameters && (
                    <>
                        {"<"}
                        {props.typeParameters.map((item, i) => (
                            <>
                                {i > 0 && ", "}
                                {item.name}
                            </>
                        ))}
                        {">"}
                    </>
                )}
                <span className="tsd-signature-symbol">(</span>
                {props.parameters?.map((item, i) => (
                    <>
                        {!!i && ", "}
                        {!!item.flags.isRest && (
                            <span className="tsd-signature-symbol">...</span>
                        )}
                        {item.name}
                        <span className="tsd-signature-symbol">
                            {!!item.flags.isOptional && "?"}
                            {!!item.defaultValue && "?"}
                            {": "}
                        </span>
                        {With(item.type, (props) => (
                            <>{partials.type(props)}</>
                        ))}
                    </>
                ))}
                <span className="tsd-signature-symbol">)</span>
                {!!props.type && (
                    <>
                        {arrowStyle ? (
                            <span className="tsd-signature-symbol">
                                {" "}
                                ={">"}{" "}
                            </span>
                        ) : (
                            <span className="tsd-signature-symbol">: </span>
                        )}
                        {!!props.type && partials.type(props.type)}
                    </>
                )}
            </>
        );
