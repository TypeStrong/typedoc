import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import type { PageEvent } from "../../../events";
import { JSX } from "../../../../utils";
import { ReflectionKind, type ProjectReflection, DeclarationReflection } from "../../../../models";

function fullHierarchy(context: DefaultThemeRenderContext, root: DeclarationReflection) {
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
                    return child.reflection && fullHierarchy(context, child.reflection as DeclarationReflection);
                })}
                {root.extendedBy?.map((child) => {
                    return child.reflection && fullHierarchy(context, child.reflection as DeclarationReflection);
                })}
            </ul>
        </li>
    );
}

export function hierarchyTemplate(context: DefaultThemeRenderContext, props: PageEvent<ProjectReflection>) {
    // Keep this condition in sync with the one in DefaultTheme.tsx
    const roots = (props.project.getReflectionsByKind(ReflectionKind.ClassOrInterface) as DeclarationReflection[])
        .filter((refl) => !(refl.implementedTypes || refl.extendedTypes) && (refl.implementedBy || refl.extendedBy))
        .sort((a, b) => a.name.localeCompare(b.name));

    return (
        <>
            <h2>Class Hierarchy</h2>
            {roots.map((root) => (
                <ul class="tsd-full-hierarchy">{fullHierarchy(context, root)}</ul>
            ))}
        </>
    );
}
