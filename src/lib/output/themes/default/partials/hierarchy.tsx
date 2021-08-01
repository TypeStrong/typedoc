import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { createElement } from "../../../../utils";
import { DeclarationHierarchy } from "../../../../models";
export const hierarchy =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: DeclarationHierarchy) =>
        (
            <ul class="tsd-hierarchy">
                {props.types.map((item, i, l) => (
                    <li>
                        {props.isTarget ? <span class="target">{item.toString()}</span> : partials.type(item)}
                        {i === l.length - 1 && !!props.next && partials.hierarchy(props.next)}
                    </li>
                ))}
            </ul>
        );
