import { DefaultThemeRenderContext } from "../../DefaultThemeRenderContext";
import * as React from "react";
import { TemplateLiteralType } from "../../../../../models";

export const templateLiteral =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: TemplateLiteralType) =>
        (
            <>
                <span className="tsd-signature-symbol">`</span>
                {!!props.head && <span className="tsd-signature-type">{props.head}</span>}
                {props.tail.map((item) => (
                    <>
                        <span className="tsd-signature-symbol">{"${"}</span>
                        {!!item[0] && partials.type(item[0])}
                        <span className="tsd-signature-symbol">{"}"}</span>
                        {!!item[1] && <span className="tsd-signature-type">{item[1]}</span>}
                    </>
                ))}
                <span className="tsd-signature-symbol">`</span>
            </>
        );
