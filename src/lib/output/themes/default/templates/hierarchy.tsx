import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import type { PageEvent } from "../../../events.js";
import { JSX } from "../../../../utils/index.js";
import { getHierarchyRoots } from "../../lib.js";
import type { DeclarationReflection, ProjectReflection } from "../../../../models/index.js";

function fullHierarchy(
    context: DefaultThemeRenderContext,
    root: DeclarationReflection,
    seen: Set<DeclarationReflection>,
) {
    if (seen.has(root)) {
        return (
            <li data-refl={root.id}>
                <a href={context.urlTo(root)}>
                    {context.icons[root.kind]()}
                    {root.name}
                </a>
            </li>
        );
    }
    seen.add(root);

    const children: JSX.Element[] = [];
    for (const child of [...(root.implementedBy || []), ...(root.extendedBy || [])]) {
        if (child.reflection) {
            children.push(fullHierarchy(context, child.reflection as DeclarationReflection, seen));
        }
    }

    // Note: We don't use root.anchor for the anchor, because those are built on a per page basis.
    // And classes/interfaces get their own page, so all the anchors will be empty anyways.
    // Full name should be safe here, since this list only includes classes/interfaces.
    return (
        <li data-refl={root.id}>
            <a id={root.getFullName()} class="tsd-anchor"></a>
            <a href={context.urlTo(root)}>
                {context.icons[root.kind]()}
                {root.name}
            </a>
            {children.length && <ul>{children}</ul>}
        </li>
    );
}

export function hierarchyTemplate(context: DefaultThemeRenderContext, props: PageEvent<ProjectReflection>) {
    const seen = new Set<DeclarationReflection>();

    return (
        <>
            <h2>{context.i18n.theme_hierarchy_summary()}</h2>
            {getHierarchyRoots(props.project).map((root) => (
                <ul class="tsd-full-hierarchy">{fullHierarchy(context, root, seen)}</ul>
            ))}
        </>
    );
}
