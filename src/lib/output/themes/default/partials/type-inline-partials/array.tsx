import { With, __partials__ } from "../../../lib";
import * as React from "react";
import { ArrayType } from "../../../../../models";
export const array = (props: ArrayType) => (
    <>
        {With(props.elementType, (props) => (
            <>
                {__partials__.type(props, { needsParens: true })}
                <span className="tsd-signature-symbol">[]</span>
            </>
        ))}
    </>
);
