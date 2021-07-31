import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { TypeInlinePartialsOptions } from "./type-inline-partials/options";
import { Type } from "../../../../models";

// The type helper accepts an optional needsParens parameter that is checked
// if an inner type may result in invalid output without them. For example:
// 1 | 2[] !== (1 | 2)[]
// () => 1 | 2 !== (() => 1) | 2
export const type =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: Type, options?: TypeInlinePartialsOptions): React.ReactElement => {
        if (props) {
            const typeIdent = props.type as keyof typeof partials.typePartials;
            const renderFn = partials.typePartials[typeIdent] as TypeRenderTemplate;
            return renderFn(props, options);
        } else {
            return <span className="tsd-signature-type">void</span>;
        }
    };

type TypeRenderTemplate = (type: Type, options?: TypeInlinePartialsOptions) => React.ReactElement;
