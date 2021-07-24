import { With, wbr, IfCond, __partials__ } from "../../lib";
import * as React from "react";
import { SignatureReflection } from "../../../../../models";
export const memberSignatureTitle = (props: SignatureReflection, {hideName = false, arrowStyle = false}: {hideName?: boolean, arrowStyle?: boolean} = {}) => (
    <>
        {!hideName ? (
            <> {wbr(props.name)}</>
        ) : (
            <>
                {" "}
                <IfCond cond={props.kindString === "Constructor signature"}>
                    {!!props.flags.isAbstract && (
                        <>
                            {" "}
                            <span className="tsd-signature-symbol">abstract </span>
                        </>
                    )}{" "}
                    <span className="tsd-signature-symbol">new </span>
                </IfCond>
            </>
        )}
        {!!props.typeParameters && (
            <>
                {" "}
                {"<"}
                {props.typeParameters.map((item, i) => (
                    <>
                        {" "}
                        {i && ",\xA0"}
                        {item.name}
                    </>
                ))}{" "}
                {">"}
            </>
        )}
        <span className="tsd-signature-symbol">(</span>
        {props.parameters?.map((item, i) => (
            <>
                {" "}
                {!!i && ",\xA0"}
                {!!item.flags.isRest && <span className="tsd-signature-symbol">...</span>}
                {item.name}
                <span className="tsd-signature-symbol">
                    {!!item.flags.isOptional && "?"}
                    {!!item.defaultValue && "?"}:
                </span>
                {With(item.type, (props) => (
                    <>{__partials__.type(props)}</>
                ))}
            </>
        ))}
        <span className="tsd-signature-symbol">)</span>
        {!!props.type && (
            <>
                {arrowStyle ? (
                    <>
                        {" "}
                        <span className="tsd-signature-symbol"> ={">"} </span>
                    </>
                ) : (
                    <>
                        {" "}
                        <span className="tsd-signature-symbol">: </span>
                    </>
                )}{" "}
                    {!!props.type && __partials__.type(props.type)}
            </>
        )}
    </>
);
