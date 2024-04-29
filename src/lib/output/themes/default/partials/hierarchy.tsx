import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import type { DeclarationHierarchy, Type } from "../../../../models";

const isLinkedReferenceType = (type: Type) =>
    type.visit({
        reference: (ref) => ref.reflection !== undefined,
    }) ?? false;

function hasAnyLinkedReferenceType(h: DeclarationHierarchy | undefined): boolean {
    if (!h) return false;

    if (!h.isTarget && h.types.some(isLinkedReferenceType)) return true;

    return hasAnyLinkedReferenceType(h.next);
}

export function hierarchy(context: DefaultThemeRenderContext, props: DeclarationHierarchy | undefined) {
    if (!props) return;

    const fullLink = hasAnyLinkedReferenceType(props) ? (
        <>
            {" "}
            (
            <a href={context.relativeURL("hierarchy.html") + "#" + context.page.model.getFullName()}>
                {context.i18n.theme_hierarchy_view_full()}
            </a>
            )
        </>
    ) : (
        <></>
    );

    return (
        <section class="tsd-panel tsd-hierarchy">
            <h4>
                {context.i18n.theme_hierarchy()}
                {fullLink}
            </h4>
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
