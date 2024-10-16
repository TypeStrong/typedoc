import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import type { DeclarationHierarchy, DeclarationReflection, Type } from "../../../../models";

const isLinkedReferenceType = (type: Type) =>
    type.visit({
        reference: (ref) => ref.reflection !== undefined,
    }) ?? false;

function hasAnyLinkedReferenceType(h: DeclarationHierarchy | undefined): boolean {
    if (!h) return false;

    if (!h.isTarget && h.types.some(isLinkedReferenceType)) return true;

    return hasAnyLinkedReferenceType(h.next);
}

export function hierarchy(
    context: DefaultThemeRenderContext,
    typeHierarchy: DeclarationHierarchy | undefined,
    reflection: DeclarationReflection,
) {
    if (!typeHierarchy) return;

    const summaryLink =
        context.options.getValue("includeHierarchySummary") && hasAnyLinkedReferenceType(typeHierarchy) ? (
            <>
                {" "}
                (
                <a href={context.relativeURL("hierarchy.html") + "#" + context.page.model.getFullName()}>
                    {context.i18n.theme_hierarchy_view_summary()}
                </a>
                )
            </>
        ) : (
            <></>
        );

    return (
        <section
            class="tsd-panel tsd-hierarchy"
            id="tsd-hierarchy-container"
            data-base={context.relativeURL("./")}
            data-target-path={reflection.url!}
        >
            <input id="tsd-full-hierarchy-toggle" type="checkbox" />

            <h4>
                {context.i18n.theme_hierarchy()}
                {summaryLink}{" "}
                <label for="tsd-full-hierarchy-toggle">
                    (<span class="expand">{context.i18n.theme_hierarchy_expand()}</span>
                    <span class="collapse">{context.i18n.theme_hierarchy_collapse()}</span>)
                </label>
            </h4>

            {hierarchyList(context, typeHierarchy)}
        </section>
    );
}

function hierarchyList(context: DefaultThemeRenderContext, props: DeclarationHierarchy) {
    return (
        <ul class="tsd-hierarchy">
            {props.types.map((item, i, l) => (
                <li
                    class={`tsd-hierarchy-item ${props.isTarget ? "tsd-hierarchy-target" : "tsd-hierarchy-close-relative"}`}
                >
                    {props.isTarget ? <span>{item.toString()}</span> : context.type(item)}
                    {i === l.length - 1 && !!props.next && hierarchyList(context, props.next)}
                </li>
            ))}
        </ul>
    );
}
