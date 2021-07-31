import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import * as React from "react";
import { TupleType } from "../../../../../models";
export const tuple =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: TupleType) =>
        (
            <>
                <span className="tsd-signature-symbol">[</span>
                {props.elements.map((item, i) => (
                    <>
                        {i > 0 && (
                            <>
                                <span className="tsd-signature-symbol">, </span>
                            </>
                        )}
                        {partials.type(item)}
                    </>
                ))}
                <span className="tsd-signature-symbol">]</span>
            </>
        );
