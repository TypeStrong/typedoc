import { isSignature, hasElementType, isReferenceType } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { Type } from "../../../../models";

export const typeAndParent =
    ({ relativeURL, partials }: DefaultThemeRenderContext) =>
    (props: Type): JSX.Element => {
        if (!props) return <>{"        void\n"}</>;

        if (hasElementType(props)) {
            return (
                <>
                    {partials.typeAndParent(props.elementType)}
                    []
                </>
            );
        }

        if (isReferenceType(props) && props.reflection) {
            if (isSignature(props.reflection)) {
                return (
                    <>
                        {props.reflection.parent?.parent?.url ? (
                            <a href={relativeURL(props.reflection.parent.parent.url)}>
                                {props.reflection.parent.parent.name}
                            </a>
                        ) : (
                            <> {props.reflection.parent?.parent?.name}</>
                        )}
                        .
                        {props.reflection.parent?.url ? (
                            <a href={relativeURL(props.reflection.parent.url)}>{props.reflection.parent.name}</a>
                        ) : (
                            <> {props.reflection.parent?.name}</>
                        )}
                    </>
                );
            } else {
                return (
                    <>
                        {props.reflection.parent?.url ? (
                            <a href={relativeURL(props.reflection.parent.url)}>{props.reflection.parent.name}</a>
                        ) : (
                            <> {props.reflection.parent?.name}</>
                        )}
                        .
                        {props.reflection.url ? (
                            <a href={relativeURL(props.reflection.url)}>{props.reflection.name}</a>
                        ) : (
                            <> {props.reflection.name}</>
                        )}
                    </>
                );
            }
        }

        return <> {props.toString()}</>;
    };
