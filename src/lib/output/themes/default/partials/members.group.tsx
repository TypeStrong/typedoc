import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import type { ReflectionGroup } from "../../../../models";

export function membersGroup(context: DefaultThemeRenderContext, group: ReflectionGroup) {
    if (group.categories) {
        return (
            <>
                {group.categories.map((item) => (
                    <section class={"tsd-panel-group tsd-member-group " + group.cssClasses}>
                        <h2>
                            {!!item.title && <>{item.title} </>}
                            {group.title}
                        </h2>
                        {item.children.map((item) => !item.hasOwnDocument && context.member(item))}
                    </section>
                ))}
            </>
        );
    }

    return (
        <section class={"tsd-panel-group tsd-member-group " + group.cssClasses}>
            <h2>{group.title}</h2>
            {group.children.map((item) => !item.hasOwnDocument && context.member(item))}
        </section>
    );
}
