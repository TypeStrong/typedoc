import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { TypeInlinePartialsOptions } from "./type-inline-partials/options";
import { Type } from "../../../../models";
import { createElement, JSX } from "../../../../utils";

// The type helper accepts an optional needsParens parameter that is checked
// if an inner type may result in invalid output without them. For example:
// 1 | 2[] !== (1 | 2)[]
// () => 1 | 2 !== (() => 1) | 2
export const type =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: Type, options?: TypeInlinePartialsOptions): JSX.Element => {
        if (props) {
            const typeIdent = props.type as keyof typeof partials.typePartials;
            const renderFn = partials.typePartials[typeIdent] as TypeRenderTemplate;
            return renderFn(props, options);
        } else {
            return <span class="tsd-signature-type">void</span>;
        }
    };

type TypeRenderTemplate = (type: Type, options?: TypeInlinePartialsOptions) => JSX.Element;
