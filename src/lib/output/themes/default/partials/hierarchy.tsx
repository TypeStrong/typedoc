import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { DeclarationHierarchy } from "../../../../models";
export const hierarchy =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: DeclarationHierarchy) =>
        (
            <ul className="tsd-hierarchy">
                {props.types.map((item, i, l) => (
                    <li>
                        {props.isTarget ? <span className="target">{item.toString()}</span> : partials.type(item)}
                        {i === l.length - 1 && !!props.next && partials.hierarchy(props.next)}
                    </li>
                ))}
            </ul>
        );
