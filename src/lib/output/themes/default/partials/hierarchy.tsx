import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import type { DeclarationHierarchy } from "../../../../models";

export function hierarchy(context: DefaultThemeRenderContext, props: DeclarationHierarchy | undefined) {
    if (!props) return;

    return (
        <section class="tsd-panel tsd-hierarchy">
            <h4>Hierarchy</h4>
            {hierarchyList(context, props)}
        </section>
    );
}

function hierarchyList(context: DefaultThemeRenderContext, props: DeclarationHierarchy) {
    return (
        <ul class="tsd-hierarchy">
            {props.types.map((item, i, l) => (
                <li>
                    {props.isTarget ? <span class="target">{item.toString()}</span> : context.type(item)}
                    {i === l.length - 1 && !!props.next && hierarchyList(context, props.next)}
                </li>
            ))}
        </ul>
    );
}
