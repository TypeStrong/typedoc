import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import type { ReflectionGroup } from "../../../../models";

export function membersGroup(context: DefaultThemeRenderContext, group: ReflectionGroup) {
    if (group.categories) {
        return (
            <>
                {group.categories.map((item) => {
                    const title = `${group.title} - ${item.title}`;

                    return (
                        <details class="tsd-panel-group tsd-member-group tsd-accordion" open>
                            <summary class="tsd-accordion-summary" data-key={"section-" + title}>
                                <h2>
                                    {context.icons.chevronDown()} {title}
                                </h2>
                            </summary>
                            <section>
                                {item.children.map((item) => !item.hasOwnDocument && context.member(item))}
                            </section>
                        </details>
                    );
                })}
            </>
        );
    }

    return (
        <details class="tsd-panel-group tsd-member-group tsd-accordion" open>
            <summary class="tsd-accordion-summary" data-key={"section-" + group.title}>
                <h2>
                    {context.icons.chevronDown()} {group.title}
                </h2>
            </summary>
            <section>{group.children.map((item) => !item.hasOwnDocument && context.member(item))}</section>
        </details>
    );
}
