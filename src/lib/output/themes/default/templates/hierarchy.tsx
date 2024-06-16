import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import type { PageEvent } from "../../../events";
import { JSX } from "../../../../utils";
import { getHierarchyRoots } from "../../lib";
import type { DeclarationReflection, ProjectReflection } from "../../../../models";

function fullHierarchy(
    context: DefaultThemeRenderContext,
    root: DeclarationReflection,
    seen = new Set<DeclarationReflection>(),
) {
    if (seen.has(root)) return;
    seen.add(root);

    // Note: We don't use root.anchor for the anchor, because those are built on a per page basis.
    // And classes/interfaces get their own page, so all the anchors will be empty anyways.
    // Full name should be safe here, since this list only includes classes/interfaces.
    return (
        <li>
            <a id={root.getFullName()} class="tsd-anchor"></a>
            <a href={context.urlTo(root)}>
                {context.icons[root.kind]()}
                {root.name}
            </a>
            <ul>
                {root.implementedBy?.map((child) => {
                    return child.reflection && fullHierarchy(context, child.reflection as DeclarationReflection, seen);
                })}
                {root.extendedBy?.map((child) => {
                    return child.reflection && fullHierarchy(context, child.reflection as DeclarationReflection, seen);
                })}
            </ul>
        </li>
    );
}

export function hierarchyTemplate(context: DefaultThemeRenderContext, props: PageEvent<ProjectReflection>) {
    return (
        <>
            <h2>{context.i18n.theme_class_hierarchy_title()}</h2>
            {getHierarchyRoots(props.project).map((root) => (
                <ul class="tsd-full-hierarchy">{fullHierarchy(context, root)}</ul>
            ))}
        </>
    );
}
