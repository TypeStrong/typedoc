import { __partials__ } from "../../../lib";
import * as React from "react";
import { TypeParameterType } from "../../../../../models";
export const typeParameter = (props: TypeParameterType) => (
    <>
        <span className="tsd-signature-type">{props.name}</span>
    </>
);
