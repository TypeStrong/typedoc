import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import { JSX } from "../../../../utils";
import type { ContainerReflection } from "../../../../models";

export function members(context: DefaultThemeRenderContext, props: ContainerReflection) {
    if (props.categories && props.categories.length) {
        return (
            <>
                {props.categories.map(
                    (item) =>
                        !item.allChildrenHaveOwnDocument() && (
                            <section class={"tsd-panel-group tsd-member-group " + props.cssClasses}>
                                <h2>{item.title}</h2>
                                {item.children.map((item) => !item.hasOwnDocument && context.member(item))}
                            </section>
                        )
                )}
            </>
        );
    }

    return <>{props.groups?.map((item) => !item.allChildrenHaveOwnDocument() && context.membersGroup(item))}</>;
}
