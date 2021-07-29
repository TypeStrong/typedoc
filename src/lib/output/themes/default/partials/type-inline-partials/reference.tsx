import {DefaultThemeRenderContext} from '../../DefaultThemeRenderContext';
import * as React from "react";
import { ReferenceType } from "../../../../../models";

export const reference = ({relativeURL, partials }: DefaultThemeRenderContext) => (props: ReferenceType) => {
    const reflection = props.getReflection();
    return (
        <>
            {reflection ? (
                <>
                    {
                        <a
                            href={relativeURL(reflection.url) || ''}
                            className="tsd-signature-type"
                            data-tsd-kind={reflection.kindString}
                        >
                            {reflection.name}
                        </a>
                    }
                </>
            ) : (
                <>
                    <span className="tsd-signature-type">{props.name}</span>
                </>
            )}
            {props.typeArguments && props.typeArguments.length > 0 && (
                <>
                    <span className="tsd-signature-symbol">{"<"}</span>
                    {props.typeArguments.map((item, i) => (
                        <>
                            {i > 0 && (
                                <>
                                    <span className="tsd-signature-symbol">, </span>
                                </>
                            )}
                            {partials.type(item)}
                        </>
                    ))}
                    <span className="tsd-signature-symbol">{">"}</span>
                </>
            )}
        </>
    );
};
