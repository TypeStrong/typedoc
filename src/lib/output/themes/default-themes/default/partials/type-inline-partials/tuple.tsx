import { __partials__ } from "../../../lib";
import * as React from "react";
import { TupleType } from "../../../../../../models";
export const tuple = (props: TupleType) => (
    <>
        <span className="tsd-signature-symbol">[</span>
        {props.elements.map((item, i) => (
            <>
                {i > 0 && (
                    <>
                        {" "}
                        <span className="tsd-signature-symbol">, </span>
                    </>
                )}{" "}
                {__partials__.type(item)}
            </>
        ))}{" "}
        <span className="tsd-signature-symbol">]</span>
    </>
);
