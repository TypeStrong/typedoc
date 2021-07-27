import {
    __partials__,
} from "../../lib";
import * as React from "react";
import { TypeInlinePartialsOptions } from "./type-inline-partials/options";
import { Type } from "../../../../models";

export const type = (props: Type, options?: TypeInlinePartialsOptions): React.ReactElement => {
        /* Each type gets its own inline helper to determine how it is rendered. */
        /* The name of the helper is the value of the 'type' property on the type.*/
        /*
    The type helper accepts an optional needsParens parameter that is checked
    if an inner type may result in invalid output without them. For example:
    1 | 2[] !== (1 | 2)[]
    () => 1 | 2 !== (() => 1) | 2
    */
    if(props) {
        const typeIdent = props.type as keyof typeof __partials__['typePartials'];
        const renderFn = __partials__.typePartials[typeIdent] as TypeRenderTemplate;
        return renderFn(props, options);
    } else {
        return <>

            <span className="tsd-signature-type">void</span>
        </>;
    }
}

type TypeRenderTemplate = (type: Type, options?: TypeInlinePartialsOptions) => React.ReactElement;
