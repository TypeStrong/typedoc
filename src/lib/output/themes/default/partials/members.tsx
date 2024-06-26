import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { filterMap, JSX } from "../../../../utils";
import type { ContainerReflection } from "../../../../models";

function getMemberSections(parent: ContainerReflection) {
    if (parent.categories?.length) {
        return filterMap(parent.categories, (cat) => {
            if (!cat.allChildrenHaveOwnDocument()) {
                return {
                    title: cat.title,
                    children: cat.children.filter((child) => !child.hasOwnDocument),
                };
            }
        });
    }

    if (parent.groups?.length) {
        return parent.groups.flatMap((group) => {
            if (group.categories?.length) {
                return filterMap(group.categories, (cat) => {
                    if (!cat.allChildrenHaveOwnDocument()) {
                        return {
                            title: `${group.title} - ${cat.title}`,
                            children: cat.children.filter((child) => !child.hasOwnDocument),
                        };
                    }
                });
            }

            return {
                title: group.title,
                children: group.children.filter((child) => !child.hasOwnDocument),
            };
        });
    }

    return [];
}

export function members(context: DefaultThemeRenderContext, props: ContainerReflection) {
    const sections = getMemberSections(props).filter((sect) => sect.children.length);

    return (
        <>
            {sections.map(({ title, children }) => {
                context.page.startNewSection(title);

                return (
                    <details class="tsd-panel-group tsd-member-group tsd-accordion" open>
                        <summary class="tsd-accordion-summary" data-key={"section-" + title}>
                            <h2>
                                {context.icons.chevronDown()} {title}
                            </h2>
                        </summary>
                        <section>{children.map((item) => context.member(item))}</section>
                    </details>
                );
            })}
        </>
    );
}
