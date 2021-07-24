import { With, __partials__ } from "../../../lib";
import * as React from "react";
import { ReflectionType } from "../../../../../../models";
export const reflection = (props: ReflectionType, {needsParens}: {needsParens: boolean}) => (
    <>
        {props.declaration.children ? (
            <>
                {" "}
                {/* object literal */}
                <span className="tsd-signature-symbol">{"{"} </span>
                {props.declaration.children.map((item, i) => (
                    <>
                        {i > 0 && (
                            <>
                                {" "}
                                <span className="tsd-signature-symbol">; </span>
                            </>
                        )}
                        {item.getSignature ? (
                            item.setSignature ? (
                                <>
                                    {" "}
                                    {item.name}
                                    <span className="tsd-signature-symbol">: </span>
                                    {item.getSignature.type ? (
                                        <>
                                            {" "}
                                            {With(item.getSignature.type, (props) => (
                                                <>{__partials__.type(props)}</>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            {" "}
                                            <span className="tsd-signature-type">any</span>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    {" "}
                                    <span className="tsd-signature-symbol">get </span>
                                    {item.name}
                                    <span className="tsd-signature-symbol">(): </span>
                                    {item.getSignature.type ? (
                                        <>
                                            {" "}
                                            {With(item.getSignature.type, (props) => (
                                                <>{__partials__.type(props)}</>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            {" "}
                                            <span className="tsd-signature-type">any</span>
                                        </>
                                    )}
                                </>
                            )
                        ) : item.setSignature ? (
                            <>
                                {" "}
                                <span className="tsd-signature-symbol">set </span>
                                {item.name}
                                <span className="tsd-signature-symbol">(</span>
                                {/* Rather hacky to use each here... but we know there is exactly one. */}
                                {item.setSignature.parameters?.map((item, i) => (
                                    <>
                                        {" "}
                                        {item.name}
                                        <span className="tsd-signature-symbol">: </span>
                                        {item.type ? (
                                            <>
                                                {" "}
                                                {With(item.type, (props) => (
                                                    <>{__partials__.type(props)}</>
                                                ))}
                                            </>
                                        ) : (
                                            <>
                                                {" "}
                                                <span className="tsd-signature-type">any</span>
                                            </>
                                        )}
                                    </>
                                ))}{" "}
                                <span className="tsd-signature-symbol">)</span>
                            </>
                        ) : (
                            <>
                                {" "}
                                {item.name}
                                {item.flags.isOptional ? (
                                    <>
                                        {" "}
                                        <span className="tsd-signature-symbol">?: </span>
                                    </>
                                ) : (
                                    <>
                                        {" "}
                                        <span className="tsd-signature-symbol">: </span>
                                    </>
                                )}
                                {item.type ? (
                                    <>
                                        {" "}
                                        {__partials__.type(item.type)}
                                    </>
                                ) : (
                                    <>
                                        {" "}
                                        <span className="tsd-signature-type">any</span>
                                    </>
                                )}
                            </>
                        )}
                    </>
                ))}{" "}
                <span className="tsd-signature-symbol"> {"}"}</span>
            </>
        ) : props.declaration.signatures ? (
            <>
                {" "}
                {props.declaration.signatures[1] ? (
                    <>
                        {" "}
                        {/* more than one signature*/}
                        <span className="tsd-signature-symbol">{"{"} </span>
                        {props.declaration.signatures.map((item, i, l) => (
                            <>
                                {" "}
                                {__partials__["memberSignatureTitle"](item, { hideName: true })}
                                {i < l.length - 1 && (
                                    <>
                                        {" "}
                                        <span className="tsd-signature-symbol">; </span>
                                    </>
                                )}
                            </>
                        ))}{" "}
                        <span className="tsd-signature-symbol"> {"}"}</span>
                    </>
                ) : (
                    <>
                        {!!needsParens && (
                            <>
                                {" "}
                                <span className="tsd-signature-symbol">(</span>
                            </>
                        )}{" "}
                        {With(props.declaration.signatures[0], (props) => (
                            <>{__partials__["memberSignatureTitle"](props, { hideName: true, arrowStyle: true })}</>
                        ))}
                        {!!needsParens && (
                            <>
                                {" "}
                                <span className="tsd-signature-symbol">)</span>
                            </>
                        )}
                    </>
                )}
            </>
        ) : (
            <>
                {" "}
                <span className="tsd-signature-symbol">
                    {"{"}
                    {"}"}
                </span>
            </>
        )}
    </>
);
