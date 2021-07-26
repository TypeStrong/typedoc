import { With, relativeURL, __partials__, Compact, IfCond, IfNotCond, isSignature, hasElementType, isReferenceType } from "../../lib";
import * as React from "react";
import { Type } from "../../../../models";

export const typeAndParent = (props: Type) => (
    <>
        <Compact>
            {props ? (
                hasElementType(props) ? (
                    <>
                        {" "}
                        {With(props.elementType, (props) => (
                            <>{__partials__.typeAndParent(props)}</>
                        ))}
                        []
                    </>
                ) : isReferenceType(props) && props.reflection ? (
                    <>
                        {" "}
                        <IfCond cond={isSignature(props.reflection)}>
                            {props.reflection.parent?.parent?.url ? (
                                <>
                                    {" "}
                                    <a href={relativeURL(props.reflection.parent.parent.url)}>{props.reflection.parent.parent.name}</a>
                                </>
                            ) : (
                                <> {props.reflection.parent?.parent?.name}</>
                            )}{" "}
                            .
                            {props.reflection.parent?.url ? (
                                <>
                                    {" "}
                                    <a href={relativeURL(props.reflection.parent.url)}>{props.reflection.parent.name}</a>
                                </>
                            ) : (
                                <> {props.reflection.parent?.name}</>
                            )}{" "}
                        </IfCond>
                        <IfNotCond cond={isSignature(props.reflection)}>
                            {props.reflection.parent?.url ? (
                                <>
                                    {" "}
                                    <a href={relativeURL(props.reflection.parent.url)}>{props.reflection.parent.name}</a>
                                </>
                            ) : (
                                <> {props.reflection.parent?.name}</>
                            )}{" "}
                            .
                            {props.reflection.url ? (
                                <>
                                    {" "}
                                    <a href={relativeURL(props.reflection.url)}>{props.reflection.name}</a>
                                </>
                            ) : (
                                <> {props.reflection.name}</>
                            )}{" "}
                        </IfNotCond>
                    </>
                ) : (
                    <> {props}</>
                )
            ) : (
                "        void\n"
            )}
        </Compact>
    </>
);
