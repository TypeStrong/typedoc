import { With, __partials__, Compact, IfCond, IfNotCond, Markdown, relativeURL } from "../../../lib";
import * as React from "react";
import { ReferenceType } from "../../../../../../models";

export const reference = (props: ReferenceType) => {
    const reflection = props.getReflection();
    return (
        <>
            {reflection ? (
                <>
                    {" "}
                    {
                        <a
                            href={relativeURL(reflection.url)}
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
            {!!props.typeArguments && (
                <>
                    <span className="tsd-signature-symbol">{"<"}</span>
                    {props.typeArguments.map((item, i) => (
                        <>
                            {i > 0 && (
                                <>
                                    <span className="tsd-signature-symbol">, </span>
                                </>
                            )}{" "}
                            {__partials__.type(item)}
                        </>
                    ))}{" "}
                    <span className="tsd-signature-symbol">{">"}</span>
                </>
            )}
        </>
    );
};
